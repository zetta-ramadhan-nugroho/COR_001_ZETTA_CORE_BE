// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODEL ***************
const PaymentModalityModel = require('./payment_modality.model');
const ErrorLogModel = require('../../../core/error_log.model');

// *************** IMPORT UTILITIES ***************
const { AppError } = require('../../../core/error');
const { buildTenantQuery } = require('../../../shared/utils/tenant_guard');

// *************** QUERY ***************

/**
 * Retrieves a paginated list of payment modalities scoped to the tenant.
 *
 * @param {Object} args - { page, limit }
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} { data, total, page, limit }
 */
async function GetPaymentModalitiesHelper(args, tenant_id) {
  try {
    const { page = 1, limit = 20 } = args;
    const query = buildTenantQuery(tenant_id);
    const [data, total] = await Promise.all([
      PaymentModalityModel.find(query).lean().sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit),
      PaymentModalityModel.countDocuments(query),
    ]);
    return { data, total, page, limit };
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/financial_settings/payment_modalities/payment_modality.helper.js',
      function_name: 'GetPaymentModalitiesHelper',
      parameter_input: JSON.stringify({ args, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_PAYMENT_MODALITIES_FAILED', 500);
  }
}

/**
 * Retrieves a single payment modality by ID scoped to the tenant.
 *
 * @param {string} id - Payment modality document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object|null>} Payment modality document or null
 */
async function GetPaymentModalityByIdHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    return await PaymentModalityModel.findOne(query).lean();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/financial_settings/payment_modalities/payment_modality.helper.js',
      function_name: 'GetPaymentModalityByIdHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_PAYMENT_MODALITY_FAILED', 500);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new payment modality record for the tenant.
 *
 * @param {Object} input - Payment modality fields (name, payment_methods, installments, modality_fee, currency)
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Created payment modality document
 */
async function CreatePaymentModalityHelper(input, tenant_id) {
  try {
    const paymentModality = await PaymentModalityModel.create({ ...input, tenant_id });
    return paymentModality.toObject();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/financial_settings/payment_modalities/payment_modality.helper.js',
      function_name: 'CreatePaymentModalityHelper',
      parameter_input: JSON.stringify({ input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    if (error.code === 11000) {
      throw new AppError('A payment modality with this name already exists.', 'PAYMENT_MODALITY_DUPLICATE', 409);
    }
    throw new AppError(error.message, 'CREATE_PAYMENT_MODALITY_FAILED', 500);
  }
}

/**
 * Updates an existing payment modality by ID.
 *
 * @param {string} id - Payment modality document ID
 * @param {Object} input - Fields to update
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Updated payment modality document
 */
async function UpdatePaymentModalityHelper(id, input, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const paymentModality = await PaymentModalityModel.findOneAndUpdate(query, { $set: input }, { new: true }).lean();
    if (!paymentModality) throw new AppError('Payment modality not found.', 'PAYMENT_MODALITY_NOT_FOUND', 404);
    return paymentModality;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/financial_settings/payment_modalities/payment_modality.helper.js',
      function_name: 'UpdatePaymentModalityHelper',
      parameter_input: JSON.stringify({ id, input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'UPDATE_PAYMENT_MODALITY_FAILED', 500);
  }
}

/**
 * Soft-deletes a payment modality by setting deleted_at.
 *
 * @param {string} id - Payment modality document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<boolean>}
 */
async function DeletePaymentModalityHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const result = await PaymentModalityModel.findOneAndUpdate(query, { $set: { deleted_at: new Date() } }).lean();
    if (!result) throw new AppError('Payment modality not found.', 'PAYMENT_MODALITY_NOT_FOUND', 404);
    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/financial_settings/payment_modalities/payment_modality.helper.js',
      function_name: 'DeletePaymentModalityHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'DELETE_PAYMENT_MODALITY_FAILED', 500);
  }
}

// *************** EXPORT MODULE ***************
module.exports = { GetPaymentModalitiesHelper, GetPaymentModalityByIdHelper, CreatePaymentModalityHelper, UpdatePaymentModalityHelper, DeletePaymentModalityHelper };
