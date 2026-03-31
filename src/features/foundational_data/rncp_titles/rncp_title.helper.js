// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODEL ***************
const RncpTitleModel = require('./rncp_title.model');
const ErrorLogModel = require('../../../core/error_log.model');

// *************** IMPORT UTILITIES ***************
const { AppError } = require('../../../core/error');
const { buildTenantQuery } = require('../../../shared/utils/tenant_guard');

// *************** QUERY ***************

/**
 * Retrieves a paginated list of RNCP titles scoped to the tenant.
 *
 * @param {Object} args - { page, limit }
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} { data, total, page, limit }
 */
async function GetRncpTitlesHelper(args, tenant_id) {
  try {
    const { page = 1, limit = 20 } = args;
    const query = buildTenantQuery(tenant_id);
    const [data, total] = await Promise.all([
      RncpTitleModel.find(query).lean().sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit),
      RncpTitleModel.countDocuments(query),
    ]);
    return { data, total, page, limit };
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/rncp_titles/rncp_title.helper.js',
      function_name: 'GetRncpTitlesHelper',
      parameter_input: JSON.stringify({ args, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_RNCP_TITLES_FAILED', 500);
  }
}

/**
 * Retrieves a single RNCP title by ID scoped to the tenant.
 *
 * @param {string} id - RNCP title document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object|null>} RNCP title document or null
 */
async function GetRncpTitleByIdHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    return await RncpTitleModel.findOne(query).lean();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/rncp_titles/rncp_title.helper.js',
      function_name: 'GetRncpTitleByIdHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_RNCP_TITLE_FAILED', 500);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new RNCP title record for the tenant.
 *
 * @param {Object} input - RNCP title fields (name, code, eqf_level, etc.)
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Created RNCP title document
 */
async function CreateRncpTitleHelper(input, tenant_id) {
  try {
    const rncpTitle = await RncpTitleModel.create({ ...input, tenant_id });
    return rncpTitle.toObject();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/rncp_titles/rncp_title.helper.js',
      function_name: 'CreateRncpTitleHelper',
      parameter_input: JSON.stringify({ input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    if (error.code === 11000) {
      throw new AppError('An RNCP title with this name already exists.', 'RNCP_TITLE_DUPLICATE', 409);
    }
    throw new AppError(error.message, 'CREATE_RNCP_TITLE_FAILED', 500);
  }
}

/**
 * Updates an existing RNCP title by ID.
 *
 * @param {string} id - RNCP title document ID
 * @param {Object} input - Fields to update
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Updated RNCP title document
 */
async function UpdateRncpTitleHelper(id, input, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const rncpTitle = await RncpTitleModel.findOneAndUpdate(query, { $set: input }, { new: true }).lean();
    if (!rncpTitle) throw new AppError('RNCP title not found.', 'RNCP_TITLE_NOT_FOUND', 404);
    return rncpTitle;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/foundational_data/rncp_titles/rncp_title.helper.js',
      function_name: 'UpdateRncpTitleHelper',
      parameter_input: JSON.stringify({ id, input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'UPDATE_RNCP_TITLE_FAILED', 500);
  }
}

/**
 * Soft-deletes an RNCP title by setting deleted_at.
 *
 * @param {string} id - RNCP title document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<boolean>}
 */
async function DeleteRncpTitleHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const result = await RncpTitleModel.findOneAndUpdate(query, { $set: { deleted_at: new Date() } }).lean();
    if (!result) throw new AppError('RNCP title not found.', 'RNCP_TITLE_NOT_FOUND', 404);
    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/foundational_data/rncp_titles/rncp_title.helper.js',
      function_name: 'DeleteRncpTitleHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'DELETE_RNCP_TITLE_FAILED', 500);
  }
}

// *************** EXPORT MODULE ***************
module.exports = { GetRncpTitlesHelper, GetRncpTitleByIdHelper, CreateRncpTitleHelper, UpdateRncpTitleHelper, DeleteRncpTitleHelper };
