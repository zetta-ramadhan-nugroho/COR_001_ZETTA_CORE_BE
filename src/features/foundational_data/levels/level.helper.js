// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODEL ***************
const LevelModel = require('./level.model');
const ErrorLogModel = require('../../../core/error_log.model');

// *************** IMPORT UTILITIES ***************
const { AppError } = require('../../../core/error');
const { buildTenantQuery } = require('../../../shared/utils/tenant_guard');

// *************** QUERY ***************

/**
 * Retrieves a paginated list of levels scoped to the tenant.
 *
 * @param {Object} args - { page, limit }
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} { data, total, page, limit }
 */
async function GetLevelsHelper(args, tenant_id) {
  try {
    const { page = 1, limit = 20 } = args;
    const query = buildTenantQuery(tenant_id);
    const [data, total] = await Promise.all([
      LevelModel.find(query).lean().sort({ rank: 1, created_at: -1 }).skip((page - 1) * limit).limit(limit),
      LevelModel.countDocuments(query),
    ]);
    return { data, total, page, limit };
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/levels/level.helper.js',
      function_name: 'GetLevelsHelper',
      parameter_input: JSON.stringify({ args, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_LEVELS_FAILED', 500);
  }
}

/**
 * Retrieves a single level by ID scoped to the tenant.
 *
 * @param {string} id - Level document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object|null>} Level document or null
 */
async function GetLevelByIdHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    return await LevelModel.findOne(query).lean();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/levels/level.helper.js',
      function_name: 'GetLevelByIdHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_LEVEL_FAILED', 500);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new level record for the tenant.
 *
 * @param {Object} input - Level fields (name, rank, etc.)
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Created level document
 */
async function CreateLevelHelper(input, tenant_id) {
  try {
    const level = await LevelModel.create({ ...input, tenant_id });
    return level.toObject();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/levels/level.helper.js',
      function_name: 'CreateLevelHelper',
      parameter_input: JSON.stringify({ input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    if (error.code === 11000) {
      throw new AppError('A level with this name already exists.', 'LEVEL_DUPLICATE', 409);
    }
    throw new AppError(error.message, 'CREATE_LEVEL_FAILED', 500);
  }
}

/**
 * Updates an existing level by ID.
 *
 * @param {string} id - Level document ID
 * @param {Object} input - Fields to update
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Updated level document
 */
async function UpdateLevelHelper(id, input, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const level = await LevelModel.findOneAndUpdate(query, { $set: input }, { new: true }).lean();
    if (!level) throw new AppError('Level not found.', 'LEVEL_NOT_FOUND', 404);
    return level;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/foundational_data/levels/level.helper.js',
      function_name: 'UpdateLevelHelper',
      parameter_input: JSON.stringify({ id, input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'UPDATE_LEVEL_FAILED', 500);
  }
}

/**
 * Soft-deletes a level by setting deleted_at.
 *
 * @param {string} id - Level document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<boolean>}
 */
async function DeleteLevelHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const result = await LevelModel.findOneAndUpdate(query, { $set: { deleted_at: new Date() } }).lean();
    if (!result) throw new AppError('Level not found.', 'LEVEL_NOT_FOUND', 404);
    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/foundational_data/levels/level.helper.js',
      function_name: 'DeleteLevelHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'DELETE_LEVEL_FAILED', 500);
  }
}

// *************** EXPORT MODULE ***************
module.exports = { GetLevelsHelper, GetLevelByIdHelper, CreateLevelHelper, UpdateLevelHelper, DeleteLevelHelper };
