// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODEL ***************
const SectorModel = require('./sector.model');
const ErrorLogModel = require('../../../core/error_log.model');

// *************** IMPORT UTILITIES ***************
const { AppError } = require('../../../core/error');
const { buildTenantQuery } = require('../../../shared/utils/tenant_guard');

// *************** QUERY ***************

/**
 * Retrieves a paginated list of sectors scoped to the tenant.
 *
 * @param {Object} args - { page, limit }
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} { data, total, page, limit }
 */
async function GetSectorsHelper(args, tenant_id) {
  try {
    const { page = 1, limit = 20 } = args;
    const query = buildTenantQuery(tenant_id);
    const [data, total] = await Promise.all([
      SectorModel.find(query).lean().sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit),
      SectorModel.countDocuments(query),
    ]);
    return { data, total, page, limit };
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/sectors/sector.helper.js',
      function_name: 'GetSectorsHelper',
      parameter_input: JSON.stringify({ args, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_SECTORS_FAILED', 500);
  }
}

/**
 * Retrieves a single sector by ID scoped to the tenant.
 *
 * @param {string} id - Sector document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object|null>} Sector document or null
 */
async function GetSectorByIdHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    return await SectorModel.findOne(query).lean();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/sectors/sector.helper.js',
      function_name: 'GetSectorByIdHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_SECTOR_FAILED', 500);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new sector record for the tenant.
 *
 * @param {Object} input - Sector fields (name, code, etc.)
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Created sector document
 */
async function CreateSectorHelper(input, tenant_id) {
  try {
    const sector = await SectorModel.create({ ...input, tenant_id });
    return sector.toObject();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/sectors/sector.helper.js',
      function_name: 'CreateSectorHelper',
      parameter_input: JSON.stringify({ input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    if (error.code === 11000) {
      throw new AppError('A sector with this name already exists.', 'SECTOR_DUPLICATE', 409);
    }
    throw new AppError(error.message, 'CREATE_SECTOR_FAILED', 500);
  }
}

/**
 * Updates an existing sector by ID.
 *
 * @param {string} id - Sector document ID
 * @param {Object} input - Fields to update
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Updated sector document
 */
async function UpdateSectorHelper(id, input, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const sector = await SectorModel.findOneAndUpdate(query, { $set: input }, { new: true }).lean();
    if (!sector) throw new AppError('Sector not found.', 'SECTOR_NOT_FOUND', 404);
    return sector;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/foundational_data/sectors/sector.helper.js',
      function_name: 'UpdateSectorHelper',
      parameter_input: JSON.stringify({ id, input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'UPDATE_SECTOR_FAILED', 500);
  }
}

/**
 * Soft-deletes a sector by setting deleted_at.
 *
 * @param {string} id - Sector document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<boolean>}
 */
async function DeleteSectorHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const result = await SectorModel.findOneAndUpdate(query, { $set: { deleted_at: new Date() } }).lean();
    if (!result) throw new AppError('Sector not found.', 'SECTOR_NOT_FOUND', 404);
    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/foundational_data/sectors/sector.helper.js',
      function_name: 'DeleteSectorHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'DELETE_SECTOR_FAILED', 500);
  }
}

// *************** EXPORT MODULE ***************
module.exports = { GetSectorsHelper, GetSectorByIdHelper, CreateSectorHelper, UpdateSectorHelper, DeleteSectorHelper };
