// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODEL ***************
const LegalEntityModel = require('./legal_entity.model');
const ErrorLogModel = require('../../../core/error_log.model');

// *************** IMPORT UTILITIES ***************
const { AppError } = require('../../../core/error');
const { buildTenantQuery } = require('../../../shared/utils/tenant_guard');

// *************** QUERY ***************

/**
 * Retrieves a paginated list of legal entities scoped to the tenant.
 *
 * @param {Object} args - { page, limit }
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} { data, total, page, limit }
 */
async function GetLegalEntitiesHelper(args, tenant_id) {
  try {
    const { page = 1, limit = 20 } = args;
    const query = buildTenantQuery(tenant_id);
    const [data, total] = await Promise.all([
      LegalEntityModel.find(query).lean().sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit),
      LegalEntityModel.countDocuments(query),
    ]);
    return { data, total, page, limit };
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/legal_entities/legal_entity.helper.js',
      function_name: 'GetLegalEntitiesHelper',
      parameter_input: JSON.stringify({ args, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_LEGAL_ENTITIES_FAILED', 500);
  }
}

/**
 * Retrieves a single legal entity by ID scoped to the tenant.
 *
 * @param {string} id - Legal entity document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object|null>} Legal entity document or null
 */
async function GetLegalEntityByIdHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    return await LegalEntityModel.findOne(query).lean();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/legal_entities/legal_entity.helper.js',
      function_name: 'GetLegalEntityByIdHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_LEGAL_ENTITY_FAILED', 500);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new legal entity record for the tenant.
 *
 * @param {Object} input - Legal entity fields (name, siret, iban, etc.)
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Created legal entity document
 */
async function CreateLegalEntityHelper(input, tenant_id) {
  try {
    const legalEntity = await LegalEntityModel.create({ ...input, tenant_id });
    return legalEntity.toObject();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/legal_entities/legal_entity.helper.js',
      function_name: 'CreateLegalEntityHelper',
      parameter_input: JSON.stringify({ input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    if (error.code === 11000) {
      throw new AppError('A legal entity with this name already exists.', 'LEGAL_ENTITY_DUPLICATE', 409);
    }
    throw new AppError(error.message, 'CREATE_LEGAL_ENTITY_FAILED', 500);
  }
}

/**
 * Updates an existing legal entity by ID.
 *
 * @param {string} id - Legal entity document ID
 * @param {Object} input - Fields to update
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Updated legal entity document
 */
async function UpdateLegalEntityHelper(id, input, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const legalEntity = await LegalEntityModel.findOneAndUpdate(query, { $set: input }, { new: true }).lean();
    if (!legalEntity) throw new AppError('Legal entity not found.', 'LEGAL_ENTITY_NOT_FOUND', 404);
    return legalEntity;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/foundational_data/legal_entities/legal_entity.helper.js',
      function_name: 'UpdateLegalEntityHelper',
      parameter_input: JSON.stringify({ id, input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'UPDATE_LEGAL_ENTITY_FAILED', 500);
  }
}

/**
 * Soft-deletes a legal entity by setting deleted_at.
 *
 * @param {string} id - Legal entity document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<boolean>}
 */
async function DeleteLegalEntityHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const result = await LegalEntityModel.findOneAndUpdate(query, { $set: { deleted_at: new Date() } }).lean();
    if (!result) throw new AppError('Legal entity not found.', 'LEGAL_ENTITY_NOT_FOUND', 404);
    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/foundational_data/legal_entities/legal_entity.helper.js',
      function_name: 'DeleteLegalEntityHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'DELETE_LEGAL_ENTITY_FAILED', 500);
  }
}

// *************** EXPORT MODULE ***************
module.exports = { GetLegalEntitiesHelper, GetLegalEntityByIdHelper, CreateLegalEntityHelper, UpdateLegalEntityHelper, DeleteLegalEntityHelper };
