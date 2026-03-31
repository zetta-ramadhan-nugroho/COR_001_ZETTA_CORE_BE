// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODEL ***************
const SpecialityModel = require('./speciality.model');
const ErrorLogModel = require('../../../core/error_log.model');

// *************** IMPORT UTILITIES ***************
const { AppError } = require('../../../core/error');
const { buildTenantQuery } = require('../../../shared/utils/tenant_guard');

// *************** QUERY ***************

/**
 * Retrieves a paginated list of specialities scoped to the tenant.
 *
 * @param {Object} args - { page, limit }
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} { data, total, page, limit }
 */
async function GetSpecialitiesHelper(args, tenant_id) {
  try {
    const { page = 1, limit = 20 } = args;
    const query = buildTenantQuery(tenant_id);
    const [data, total] = await Promise.all([
      SpecialityModel.find(query).lean().sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit),
      SpecialityModel.countDocuments(query),
    ]);
    return { data, total, page, limit };
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/specialities/speciality.helper.js',
      function_name: 'GetSpecialitiesHelper',
      parameter_input: JSON.stringify({ args, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_SPECIALITIES_FAILED', 500);
  }
}

/**
 * Retrieves a single speciality by ID scoped to the tenant.
 *
 * @param {string} id - Speciality document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object|null>} Speciality document or null
 */
async function GetSpecialityByIdHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    return await SpecialityModel.findOne(query).lean();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/specialities/speciality.helper.js',
      function_name: 'GetSpecialityByIdHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_SPECIALITY_FAILED', 500);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new speciality record for the tenant.
 *
 * @param {Object} input - Speciality fields (name, code, sector_id, etc.)
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Created speciality document
 */
async function CreateSpecialityHelper(input, tenant_id) {
  try {
    const speciality = await SpecialityModel.create({ ...input, tenant_id });
    return speciality.toObject();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/specialities/speciality.helper.js',
      function_name: 'CreateSpecialityHelper',
      parameter_input: JSON.stringify({ input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    if (error.code === 11000) {
      throw new AppError('A speciality with this name already exists.', 'SPECIALITY_DUPLICATE', 409);
    }
    throw new AppError(error.message, 'CREATE_SPECIALITY_FAILED', 500);
  }
}

/**
 * Updates an existing speciality by ID.
 *
 * @param {string} id - Speciality document ID
 * @param {Object} input - Fields to update
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Updated speciality document
 */
async function UpdateSpecialityHelper(id, input, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const speciality = await SpecialityModel.findOneAndUpdate(query, { $set: input }, { new: true }).lean();
    if (!speciality) throw new AppError('Speciality not found.', 'SPECIALITY_NOT_FOUND', 404);
    return speciality;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/foundational_data/specialities/speciality.helper.js',
      function_name: 'UpdateSpecialityHelper',
      parameter_input: JSON.stringify({ id, input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'UPDATE_SPECIALITY_FAILED', 500);
  }
}

/**
 * Soft-deletes a speciality by setting deleted_at.
 *
 * @param {string} id - Speciality document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<boolean>}
 */
async function DeleteSpecialityHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const result = await SpecialityModel.findOneAndUpdate(query, { $set: { deleted_at: new Date() } }).lean();
    if (!result) throw new AppError('Speciality not found.', 'SPECIALITY_NOT_FOUND', 404);
    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/foundational_data/specialities/speciality.helper.js',
      function_name: 'DeleteSpecialityHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'DELETE_SPECIALITY_FAILED', 500);
  }
}

// *************** EXPORT MODULE ***************
module.exports = { GetSpecialitiesHelper, GetSpecialityByIdHelper, CreateSpecialityHelper, UpdateSpecialityHelper, DeleteSpecialityHelper };
