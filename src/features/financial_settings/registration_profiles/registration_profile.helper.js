// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODEL ***************
const RegistrationProfileModel = require('./registration_profile.model');
const ErrorLogModel = require('../../../core/error_log.model');

// *************** IMPORT UTILITIES ***************
const { AppError } = require('../../../core/error');
const { buildTenantQuery } = require('../../../shared/utils/tenant_guard');

// *************** QUERY ***************

/**
 * Retrieves a paginated list of registration profiles scoped to the tenant.
 *
 * @param {Object} args - { page, limit }
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} { data, total, page, limit }
 */
async function GetRegistrationProfilesHelper(args, tenant_id) {
  try {
    const { page = 1, limit = 20 } = args;
    const query = buildTenantQuery(tenant_id);
    const [data, total] = await Promise.all([
      RegistrationProfileModel.find(query).lean().sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit),
      RegistrationProfileModel.countDocuments(query),
    ]);
    return { data, total, page, limit };
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/financial_settings/registration_profiles/registration_profile.helper.js',
      function_name: 'GetRegistrationProfilesHelper',
      parameter_input: JSON.stringify({ args, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_REGISTRATION_PROFILES_FAILED', 500);
  }
}

/**
 * Retrieves a single registration profile by ID scoped to the tenant.
 *
 * @param {string} id - Registration profile document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object|null>} Registration profile document or null
 */
async function GetRegistrationProfileByIdHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    return await RegistrationProfileModel.findOne(query).lean();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/financial_settings/registration_profiles/registration_profile.helper.js',
      function_name: 'GetRegistrationProfileByIdHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_REGISTRATION_PROFILE_FAILED', 500);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new registration profile record for the tenant.
 *
 * @param {Object} input - Registration profile fields
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Created registration profile document
 */
async function CreateRegistrationProfileHelper(input, tenant_id) {
  try {
    const registrationProfile = await RegistrationProfileModel.create({ ...input, tenant_id });
    return registrationProfile.toObject();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/financial_settings/registration_profiles/registration_profile.helper.js',
      function_name: 'CreateRegistrationProfileHelper',
      parameter_input: JSON.stringify({ input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    if (error.code === 11000) {
      throw new AppError('A registration profile with this name already exists.', 'REGISTRATION_PROFILE_DUPLICATE', 409);
    }
    throw new AppError(error.message, 'CREATE_REGISTRATION_PROFILE_FAILED', 500);
  }
}

/**
 * Updates an existing registration profile by ID.
 *
 * @param {string} id - Registration profile document ID
 * @param {Object} input - Fields to update
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Updated registration profile document
 */
async function UpdateRegistrationProfileHelper(id, input, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const registrationProfile = await RegistrationProfileModel.findOneAndUpdate(query, { $set: input }, { new: true }).lean();
    if (!registrationProfile) throw new AppError('Registration profile not found.', 'REGISTRATION_PROFILE_NOT_FOUND', 404);
    return registrationProfile;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/financial_settings/registration_profiles/registration_profile.helper.js',
      function_name: 'UpdateRegistrationProfileHelper',
      parameter_input: JSON.stringify({ id, input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'UPDATE_REGISTRATION_PROFILE_FAILED', 500);
  }
}

/**
 * Soft-deletes a registration profile by setting deleted_at.
 *
 * @param {string} id - Registration profile document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<boolean>}
 */
async function DeleteRegistrationProfileHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const result = await RegistrationProfileModel.findOneAndUpdate(query, { $set: { deleted_at: new Date() } }).lean();
    if (!result) throw new AppError('Registration profile not found.', 'REGISTRATION_PROFILE_NOT_FOUND', 404);
    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/financial_settings/registration_profiles/registration_profile.helper.js',
      function_name: 'DeleteRegistrationProfileHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'DELETE_REGISTRATION_PROFILE_FAILED', 500);
  }
}

// *************** EXPORT MODULE ***************
module.exports = { GetRegistrationProfilesHelper, GetRegistrationProfileByIdHelper, CreateRegistrationProfileHelper, UpdateRegistrationProfileHelper, DeleteRegistrationProfileHelper };
