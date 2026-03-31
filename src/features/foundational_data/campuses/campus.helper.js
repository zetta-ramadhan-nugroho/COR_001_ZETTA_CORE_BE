// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODEL ***************
const CampusModel = require('./campus.model');
const ErrorLogModel = require('../../../core/error_log.model');

// *************** IMPORT UTILITIES ***************
const { AppError } = require('../../../core/error');
const { buildTenantQuery } = require('../../../shared/utils/tenant_guard');

// *************** QUERY ***************

/**
 * Retrieves a paginated list of campuses scoped to the tenant.
 *
 * @param {Object} args - { page, limit }
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} { data, total, page, limit }
 */
async function GetCampusesHelper(args, tenant_id) {
  try {
    const { page = 1, limit = 20 } = args;
    const query = buildTenantQuery(tenant_id);
    const [data, total] = await Promise.all([
      CampusModel.find(query).lean().sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit),
      CampusModel.countDocuments(query),
    ]);
    return { data, total, page, limit };
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/campuses/campus.helper.js',
      function_name: 'GetCampusesHelper',
      parameter_input: JSON.stringify({ args, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_CAMPUSES_FAILED', 500);
  }
}

/**
 * Retrieves a single campus by ID scoped to the tenant.
 *
 * @param {string} id - Campus document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object|null>} Campus document or null
 */
async function GetCampusByIdHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    return await CampusModel.findOne(query).lean();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/campuses/campus.helper.js',
      function_name: 'GetCampusByIdHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_CAMPUS_FAILED', 500);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new campus record for the tenant.
 *
 * @param {Object} input - Campus fields (name, school_id, etc.)
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Created campus document
 */
async function CreateCampusHelper(input, tenant_id) {
  try {
    const campus = await CampusModel.create({ ...input, tenant_id });
    return campus.toObject();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/campuses/campus.helper.js',
      function_name: 'CreateCampusHelper',
      parameter_input: JSON.stringify({ input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    if (error.code === 11000) {
      throw new AppError('A campus with this name already exists.', 'CAMPUS_DUPLICATE', 409);
    }
    throw new AppError(error.message, 'CREATE_CAMPUS_FAILED', 500);
  }
}

/**
 * Updates an existing campus by ID.
 *
 * @param {string} id - Campus document ID
 * @param {Object} input - Fields to update
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Updated campus document
 */
async function UpdateCampusHelper(id, input, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const campus = await CampusModel.findOneAndUpdate(query, { $set: input }, { new: true }).lean();
    if (!campus) throw new AppError('Campus not found.', 'CAMPUS_NOT_FOUND', 404);
    return campus;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/foundational_data/campuses/campus.helper.js',
      function_name: 'UpdateCampusHelper',
      parameter_input: JSON.stringify({ id, input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'UPDATE_CAMPUS_FAILED', 500);
  }
}

/**
 * Soft-deletes a campus by setting deleted_at.
 *
 * @param {string} id - Campus document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<boolean>}
 */
async function DeleteCampusHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const result = await CampusModel.findOneAndUpdate(query, { $set: { deleted_at: new Date() } }).lean();
    if (!result) throw new AppError('Campus not found.', 'CAMPUS_NOT_FOUND', 404);
    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/foundational_data/campuses/campus.helper.js',
      function_name: 'DeleteCampusHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'DELETE_CAMPUS_FAILED', 500);
  }
}

// *************** EXPORT MODULE ***************
module.exports = { GetCampusesHelper, GetCampusByIdHelper, CreateCampusHelper, UpdateCampusHelper, DeleteCampusHelper };
