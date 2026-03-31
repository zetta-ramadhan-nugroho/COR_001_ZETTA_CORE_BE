// *************** IMPORT MODEL ***************
const StudentModel = require('../../features/students/student.model');
const ErrorLogModel = require('../../core/error_log.model');

// *************** IMPORT UTILITIES ***************
const { HandleGraphQLError, AppError } = require('../../core/error');
const { VerifyServiceAuth } = require('../../middlewares/auth/service_auth.middleware');
const { buildTenantQuery } = require('../../shared/utils/tenant_guard');
const { AuditLogger } = require('../../core/audit_logger');
const mongoose = require('mongoose');

// *************** INTERNAL MUTATION ***************

/**
 * Updates allowed student fields from a validated downstream admission command.
 * student_number and email are NOT writable by downstream commands.
 * SERVICE-AUTH REQUIRED.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { student_id, input: AdmissionStudentUpdateInput }
 * @param {Object} context - GraphQL context
 * @returns {Promise<Object>} Updated student document
 */
async function internal_updateStudentFromAdmission(_, args, context) {
  try {
    // *************** Verify service-to-service auth — treat downstream commands as untrusted until verified
    const { source_app } = VerifyServiceAuth(context);

    if (!context.tenant_id) throw new AppError('Tenant context required.', 'MISSING_TENANT', 400);

    const query = buildTenantQuery(context.tenant_id, { _id: new mongoose.Types.ObjectId(args.student_id) });
    const before = await StudentModel.findOne(query).lean();
    if (!before) throw new AppError('Student not found.', 'STUDENT_NOT_FOUND', 404);

    // *************** student_number and email must not be writable by downstream app commands
    const { student_number: _s, email: _e, ...safeInput } = args.input;

    const after = await StudentModel.findOneAndUpdate(
      query,
      { $set: safeInput },
      { new: true }
    ).lean();

    // *************** Audit the cross-app update
    await AuditLogger.log({
      action: 'STUDENT_UPDATED_FROM_ADMISSION',
      tenant_id: context.tenant_id,
      acting_user_id: context.user_id || null,
      source_app,
      target_entity: 'student',
      target_id: args.student_id,
      before,
      after,
    });

    return after;
  } catch (error) {
    if (!(error instanceof AppError)) {
      await ErrorLogModel.create({
        path: 'internal_api/commands/student_update_command.resolver.js',
        function_name: 'internal_updateStudentFromAdmission',
        parameter_input: JSON.stringify({ student_id: args.student_id }),
        error: String(error.stack),
        tenant_id: context.tenant_id,
      });
    }
    throw HandleGraphQLError(error);
  }
}

/**
 * Updates the Core-owned profile photo reference on a student record.
 * Called after SAT uploads a photo through Core's file upload flow.
 * SERVICE-AUTH REQUIRED.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { student_id, file_id }
 * @param {Object} context - GraphQL context
 * @returns {Promise<Object>} Updated student document
 */
async function internal_updateStudentPhotoRef(_, args, context) {
  try {
    const { source_app } = VerifyServiceAuth(context);

    if (!context.tenant_id) throw new AppError('Tenant context required.', 'MISSING_TENANT', 400);

    const query = buildTenantQuery(context.tenant_id, { _id: new mongoose.Types.ObjectId(args.student_id) });
    const before = await StudentModel.findOne(query).lean();
    if (!before) throw new AppError('Student not found.', 'STUDENT_NOT_FOUND', 404);

    const after = await StudentModel.findOneAndUpdate(
      query,
      { $set: { photo_s3_key: args.file_id } },
      { new: true }
    ).lean();

    await AuditLogger.log({
      action: 'STUDENT_PHOTO_UPDATED',
      tenant_id: context.tenant_id,
      acting_user_id: context.user_id || null,
      source_app,
      target_entity: 'student',
      target_id: args.student_id,
      before: { photo_s3_key: before.photo_s3_key },
      after: { photo_s3_key: args.file_id },
    });

    return after;
  } catch (error) {
    if (!(error instanceof AppError)) {
      await ErrorLogModel.create({
        path: 'internal_api/commands/student_update_command.resolver.js',
        function_name: 'internal_updateStudentPhotoRef',
        parameter_input: JSON.stringify({ student_id: args.student_id }),
        error: String(error.stack),
        tenant_id: context.tenant_id,
      });
    }
    throw HandleGraphQLError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Mutation: {
    internal_updateStudentFromAdmission,
    internal_updateStudentPhotoRef,
  },
};
