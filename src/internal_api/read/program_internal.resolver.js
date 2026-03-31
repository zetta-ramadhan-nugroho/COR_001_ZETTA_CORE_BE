// *************** IMPORT MODEL ***************
const ProgramModel = require('../../features/programs/program.model');
const RegistrationProfileModel = require('../../features/financial_settings/registration_profiles/registration_profile.model');
const ErrorLogModel = require('../../core/error_log.model');

// *************** IMPORT UTILITIES ***************
const { HandleGraphQLError, AppError } = require('../../core/error');
const { VerifyServiceAuth } = require('../../middlewares/auth/service_auth.middleware');
const { buildTenantQuery } = require('../../shared/utils/tenant_guard');
const mongoose = require('mongoose');

// *************** INTERNAL QUERY ***************

/**
 * Returns program summary for downstream apps.
 * SERVICE-AUTH REQUIRED.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { program_id }
 * @param {Object} context - GraphQL context
 * @returns {Promise<Object|null>} ProgramSummary
 */
async function internal_getProgramSummary(_, args, context) {
  try {
    VerifyServiceAuth(context);
    if (!context.tenant_id) throw new AppError('Tenant context required.', 'MISSING_TENANT', 400);

    const query = buildTenantQuery(context.tenant_id, { _id: new mongoose.Types.ObjectId(args.program_id) });
    return await ProgramModel.findOne(query)
      .select('name status tenant_id level_id school_id campus_id')
      .lean();
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Returns program readiness status for downstream workflows.
 * A program is ready when it has a name, legal entity, at least one registration profile, and financial rates.
 * SERVICE-AUTH REQUIRED.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { program_id }
 * @param {Object} context - GraphQL context
 * @returns {Promise<Object>} ProgramReadiness
 */
async function internal_getProgramReadiness(_, args, context) {
  try {
    VerifyServiceAuth(context);
    if (!context.tenant_id) throw new AppError('Tenant context required.', 'MISSING_TENANT', 400);

    const query = buildTenantQuery(context.tenant_id, { _id: new mongoose.Types.ObjectId(args.program_id) });
    const program = await ProgramModel.findOne(query).lean();

    if (!program) throw new AppError('Program not found.', 'PROGRAM_NOT_FOUND', 404);

    // *************** START: Build program readiness check ***************
    const missing_fields = [];
    if (!program.legal_entity_id) missing_fields.push('legal_entity_id');
    if (!program.registration_profile_ids || program.registration_profile_ids.length === 0) missing_fields.push('registration_profile_ids');
    if (program.full_rate_internal == null && program.full_rate_external == null) missing_fields.push('full_rate');
    if (!program.cgv_s3_key) missing_fields.push('cgv_s3_key');

    const is_ready = missing_fields.length === 0 && program.status === 'published';
    // *************** END: Build program readiness check ***************

    return { program_id: args.program_id, is_ready, missing_fields };
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Returns the financial context (rates + registration profiles) for a program.
 * SERVICE-AUTH REQUIRED.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { program_id }
 * @param {Object} context - GraphQL context
 * @returns {Promise<Object>} FinancialContext
 */
async function internal_getFinancialContext(_, args, context) {
  try {
    VerifyServiceAuth(context);
    if (!context.tenant_id) throw new AppError('Tenant context required.', 'MISSING_TENANT', 400);

    const query = buildTenantQuery(context.tenant_id, { _id: new mongoose.Types.ObjectId(args.program_id) });
    const program = await ProgramModel.findOne(query).lean();
    if (!program) throw new AppError('Program not found.', 'PROGRAM_NOT_FOUND', 404);

    const registrationProfiles = await RegistrationProfileModel.find({
      tenant_id: context.tenant_id,
      _id: { $in: program.registration_profile_ids || [] },
      deleted_at: null,
    }).lean();

    return {
      program_id: args.program_id,
      full_rate_internal: program.full_rate_internal,
      full_rate_external: program.full_rate_external,
      down_payment_internal: program.down_payment_internal,
      down_payment_external: program.down_payment_external,
      registration_profiles: registrationProfiles,
    };
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Returns registration profile summary for downstream apps.
 * SERVICE-AUTH REQUIRED.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { profile_id }
 * @param {Object} context - GraphQL context
 * @returns {Promise<Object|null>} RegistrationProfileSummary
 */
async function internal_getRegistrationProfile(_, args, context) {
  try {
    VerifyServiceAuth(context);
    if (!context.tenant_id) throw new AppError('Tenant context required.', 'MISSING_TENANT', 400);

    const query = buildTenantQuery(context.tenant_id, { _id: new mongoose.Types.ObjectId(args.profile_id) });
    return await RegistrationProfileModel.findOne(query)
      .select('name status perimeters payment_methods')
      .lean();
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    internal_getProgramSummary,
    internal_getProgramReadiness,
    internal_getFinancialContext,
    internal_getRegistrationProfile,
  },
};
