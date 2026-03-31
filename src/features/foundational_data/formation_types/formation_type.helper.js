// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODEL ***************
const FormationTypeModel = require('./formation_type.model');
const ErrorLogModel = require('../../../core/error_log.model');

// *************** IMPORT UTILITIES ***************
const { AppError } = require('../../../core/error');
const { buildTenantQuery } = require('../../../shared/utils/tenant_guard');

// *************** QUERY ***************

/**
 * Retrieves a paginated list of formation types scoped to the tenant.
 *
 * @param {Object} args - { page, limit }
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} { data, total, page, limit }
 */
async function GetFormationTypesHelper(args, tenant_id) {
  try {
    const { page = 1, limit = 20 } = args;
    const query = buildTenantQuery(tenant_id);
    const [data, total] = await Promise.all([
      FormationTypeModel.find(query).lean().sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit),
      FormationTypeModel.countDocuments(query),
    ]);
    return { data, total, page, limit };
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/formation_types/formation_type.helper.js',
      function_name: 'GetFormationTypesHelper',
      parameter_input: JSON.stringify({ args, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_FORMATION_TYPES_FAILED', 500);
  }
}

/**
 * Retrieves a single formation type by ID scoped to the tenant.
 *
 * @param {string} id - Formation type document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object|null>} Formation type document or null
 */
async function GetFormationTypeByIdHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    return await FormationTypeModel.findOne(query).lean();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/formation_types/formation_type.helper.js',
      function_name: 'GetFormationTypeByIdHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_FORMATION_TYPE_FAILED', 500);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new formation type record for the tenant.
 *
 * @param {Object} input - Formation type fields (name, code, etc.)
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Created formation type document
 */
async function CreateFormationTypeHelper(input, tenant_id) {
  try {
    const formationType = await FormationTypeModel.create({ ...input, tenant_id });
    return formationType.toObject();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/formation_types/formation_type.helper.js',
      function_name: 'CreateFormationTypeHelper',
      parameter_input: JSON.stringify({ input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    if (error.code === 11000) {
      throw new AppError('A formation type with this name already exists.', 'FORMATION_TYPE_DUPLICATE', 409);
    }
    throw new AppError(error.message, 'CREATE_FORMATION_TYPE_FAILED', 500);
  }
}

/**
 * Updates an existing formation type by ID.
 *
 * @param {string} id - Formation type document ID
 * @param {Object} input - Fields to update
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Updated formation type document
 */
async function UpdateFormationTypeHelper(id, input, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const formationType = await FormationTypeModel.findOneAndUpdate(query, { $set: input }, { new: true }).lean();
    if (!formationType) throw new AppError('Formation type not found.', 'FORMATION_TYPE_NOT_FOUND', 404);
    return formationType;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/foundational_data/formation_types/formation_type.helper.js',
      function_name: 'UpdateFormationTypeHelper',
      parameter_input: JSON.stringify({ id, input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'UPDATE_FORMATION_TYPE_FAILED', 500);
  }
}

/**
 * Soft-deletes a formation type by setting deleted_at.
 *
 * @param {string} id - Formation type document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<boolean>}
 */
async function DeleteFormationTypeHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const result = await FormationTypeModel.findOneAndUpdate(query, { $set: { deleted_at: new Date() } }).lean();
    if (!result) throw new AppError('Formation type not found.', 'FORMATION_TYPE_NOT_FOUND', 404);
    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/foundational_data/formation_types/formation_type.helper.js',
      function_name: 'DeleteFormationTypeHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'DELETE_FORMATION_TYPE_FAILED', 500);
  }
}

// *************** EXPORT MODULE ***************
module.exports = { GetFormationTypesHelper, GetFormationTypeByIdHelper, CreateFormationTypeHelper, UpdateFormationTypeHelper, DeleteFormationTypeHelper };
