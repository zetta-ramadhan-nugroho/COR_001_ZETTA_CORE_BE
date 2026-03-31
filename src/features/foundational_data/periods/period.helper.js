// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODEL ***************
const PeriodModel = require('./period.model');
const ErrorLogModel = require('../../../core/error_log.model');

// *************** IMPORT UTILITIES ***************
const { AppError } = require('../../../core/error');
const { buildTenantQuery } = require('../../../shared/utils/tenant_guard');

// *************** QUERY ***************

/**
 * Retrieves a paginated list of periods scoped to the tenant.
 *
 * @param {Object} args - { page, limit }
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} { data, total, page, limit }
 */
async function GetPeriodsHelper(args, tenant_id) {
  try {
    const { page = 1, limit = 20 } = args;
    const query = buildTenantQuery(tenant_id);
    const [data, total] = await Promise.all([
      PeriodModel.find(query).lean().sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit),
      PeriodModel.countDocuments(query),
    ]);
    return { data, total, page, limit };
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/periods/period.helper.js',
      function_name: 'GetPeriodsHelper',
      parameter_input: JSON.stringify({ args, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_PERIODS_FAILED', 500);
  }
}

/**
 * Retrieves a single period by ID scoped to the tenant.
 *
 * @param {string} id - Period document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object|null>} Period document or null
 */
async function GetPeriodByIdHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    return await PeriodModel.findOne(query).lean();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/periods/period.helper.js',
      function_name: 'GetPeriodByIdHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_PERIOD_FAILED', 500);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new period record for the tenant.
 *
 * @param {Object} input - Period fields (name, start_date, end_date, etc.)
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Created period document
 */
async function CreatePeriodHelper(input, tenant_id) {
  try {
    const period = await PeriodModel.create({ ...input, tenant_id });
    return period.toObject();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/periods/period.helper.js',
      function_name: 'CreatePeriodHelper',
      parameter_input: JSON.stringify({ input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    if (error.code === 11000) {
      throw new AppError('A period with this name already exists.', 'PERIOD_DUPLICATE', 409);
    }
    throw new AppError(error.message, 'CREATE_PERIOD_FAILED', 500);
  }
}

/**
 * Updates an existing period by ID.
 *
 * @param {string} id - Period document ID
 * @param {Object} input - Fields to update
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Updated period document
 */
async function UpdatePeriodHelper(id, input, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const period = await PeriodModel.findOneAndUpdate(query, { $set: input }, { new: true }).lean();
    if (!period) throw new AppError('Period not found.', 'PERIOD_NOT_FOUND', 404);
    return period;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/foundational_data/periods/period.helper.js',
      function_name: 'UpdatePeriodHelper',
      parameter_input: JSON.stringify({ id, input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'UPDATE_PERIOD_FAILED', 500);
  }
}

/**
 * Soft-deletes a period by setting deleted_at.
 *
 * @param {string} id - Period document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<boolean>}
 */
async function DeletePeriodHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const result = await PeriodModel.findOneAndUpdate(query, { $set: { deleted_at: new Date() } }).lean();
    if (!result) throw new AppError('Period not found.', 'PERIOD_NOT_FOUND', 404);
    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/foundational_data/periods/period.helper.js',
      function_name: 'DeletePeriodHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'DELETE_PERIOD_FAILED', 500);
  }
}

// *************** EXPORT MODULE ***************
module.exports = { GetPeriodsHelper, GetPeriodByIdHelper, CreatePeriodHelper, UpdatePeriodHelper, DeletePeriodHelper };
