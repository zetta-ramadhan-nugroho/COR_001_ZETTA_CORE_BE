// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODEL ***************
const AdditionalFeeModel = require('./additional_fee.model');
const ErrorLogModel = require('../../../core/error_log.model');

// *************** IMPORT UTILITIES ***************
const { AppError } = require('../../../core/error');
const { buildTenantQuery } = require('../../../shared/utils/tenant_guard');

// *************** QUERY ***************

/**
 * Retrieves a paginated list of additional fees scoped to the tenant.
 *
 * @param {Object} args - { page, limit }
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} { data, total, page, limit }
 */
async function GetAdditionalFeesHelper(args, tenant_id) {
  try {
    const { page = 1, limit = 20 } = args;
    const query = buildTenantQuery(tenant_id);
    const [data, total] = await Promise.all([
      AdditionalFeeModel.find(query).lean().sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit),
      AdditionalFeeModel.countDocuments(query),
    ]);
    return { data, total, page, limit };
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/financial_settings/additional_fees/additional_fee.helper.js',
      function_name: 'GetAdditionalFeesHelper',
      parameter_input: JSON.stringify({ args, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_ADDITIONAL_FEES_FAILED', 500);
  }
}

/**
 * Retrieves a single additional fee by ID scoped to the tenant.
 *
 * @param {string} id - Additional fee document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object|null>} Additional fee document or null
 */
async function GetAdditionalFeeByIdHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    return await AdditionalFeeModel.findOne(query).lean();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/financial_settings/additional_fees/additional_fee.helper.js',
      function_name: 'GetAdditionalFeeByIdHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_ADDITIONAL_FEE_FAILED', 500);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new additional fee record for the tenant.
 *
 * @param {Object} input - Additional fee fields (name, amount, currency, description)
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Created additional fee document
 */
async function CreateAdditionalFeeHelper(input, tenant_id) {
  try {
    const additionalFee = await AdditionalFeeModel.create({ ...input, tenant_id });
    return additionalFee.toObject();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/financial_settings/additional_fees/additional_fee.helper.js',
      function_name: 'CreateAdditionalFeeHelper',
      parameter_input: JSON.stringify({ input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    if (error.code === 11000) {
      throw new AppError('An additional fee with this name already exists.', 'ADDITIONAL_FEE_DUPLICATE', 409);
    }
    throw new AppError(error.message, 'CREATE_ADDITIONAL_FEE_FAILED', 500);
  }
}

/**
 * Updates an existing additional fee by ID.
 *
 * @param {string} id - Additional fee document ID
 * @param {Object} input - Fields to update
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Updated additional fee document
 */
async function UpdateAdditionalFeeHelper(id, input, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const additionalFee = await AdditionalFeeModel.findOneAndUpdate(query, { $set: input }, { new: true }).lean();
    if (!additionalFee) throw new AppError('Additional fee not found.', 'ADDITIONAL_FEE_NOT_FOUND', 404);
    return additionalFee;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/financial_settings/additional_fees/additional_fee.helper.js',
      function_name: 'UpdateAdditionalFeeHelper',
      parameter_input: JSON.stringify({ id, input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'UPDATE_ADDITIONAL_FEE_FAILED', 500);
  }
}

/**
 * Soft-deletes an additional fee by setting deleted_at.
 *
 * @param {string} id - Additional fee document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<boolean>}
 */
async function DeleteAdditionalFeeHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const result = await AdditionalFeeModel.findOneAndUpdate(query, { $set: { deleted_at: new Date() } }).lean();
    if (!result) throw new AppError('Additional fee not found.', 'ADDITIONAL_FEE_NOT_FOUND', 404);
    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/financial_settings/additional_fees/additional_fee.helper.js',
      function_name: 'DeleteAdditionalFeeHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'DELETE_ADDITIONAL_FEE_FAILED', 500);
  }
}

// *************** EXPORT MODULE ***************
module.exports = { GetAdditionalFeesHelper, GetAdditionalFeeByIdHelper, CreateAdditionalFeeHelper, UpdateAdditionalFeeHelper, DeleteAdditionalFeeHelper };
