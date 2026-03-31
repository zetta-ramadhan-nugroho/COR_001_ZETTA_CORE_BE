// *************** IMPORT MODEL ***************
const StudentModel = require('../../features/students/student.model');
const ErrorLogModel = require('../../core/error_log.model');

// *************** IMPORT UTILITIES ***************
const { HandleGraphQLError, AppError } = require('../../core/error');
const { VerifyServiceAuth } = require('../../middlewares/auth/service_auth.middleware');
const { buildTenantQuery } = require('../../shared/utils/tenant_guard');
const mongoose = require('mongoose');

// *************** INTERNAL QUERY ***************

/**
 * Returns a student summary for downstream apps.
 * SERVICE-AUTH REQUIRED: X-Service-Token + X-Source-App headers.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { student_id }
 * @param {Object} context - GraphQL context (includes req)
 * @returns {Promise<Object|null>} StudentSummary
 */
async function internal_getStudentSummary(_, args, context) {
  try {
    // *************** Verify service-to-service auth before any data access
    VerifyServiceAuth(context);

    if (!context.tenant_id) throw new AppError('Tenant context required.', 'MISSING_TENANT', 400);

    const query = buildTenantQuery(context.tenant_id, { _id: new mongoose.Types.ObjectId(args.student_id) });
    const student = await StudentModel.findOne(query)
      .select('student_number civility first_name last_name email photo_s3_key status tenant_id')
      .lean();

    return student || null;
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Returns full student detail for downstream composition.
 * SERVICE-AUTH REQUIRED.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { student_id }
 * @param {Object} context - GraphQL context
 * @returns {Promise<Object|null>} StudentDetail
 */
async function internal_getStudentDetail(_, args, context) {
  try {
    VerifyServiceAuth(context);

    if (!context.tenant_id) throw new AppError('Tenant context required.', 'MISSING_TENANT', 400);

    const query = buildTenantQuery(context.tenant_id, { _id: new mongoose.Types.ObjectId(args.student_id) });
    return await StudentModel.findOne(query).lean();
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    internal_getStudentSummary,
    internal_getStudentDetail,
  },
};
