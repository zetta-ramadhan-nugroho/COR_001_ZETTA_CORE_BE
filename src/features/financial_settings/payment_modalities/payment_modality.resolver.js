// *************** IMPORT HELPER FUNCTION ***************
const { GetPaymentModalitiesHelper, GetPaymentModalityByIdHelper, CreatePaymentModalityHelper, UpdatePaymentModalityHelper, DeletePaymentModalityHelper } = require('./payment_modality.helper');

// *************** IMPORT VALIDATOR ***************
const { ValidateCreatePaymentModalityInput, ValidateUpdatePaymentModalityInput } = require('./payment_modality.validator');

// *************** IMPORT UTILITIES ***************
const { HandleGraphQLError } = require('../../../core/error');
const { CheckPermission } = require('../../../shared/utils/permission_check');

// *************** QUERY ***************

/**
 * Fetches a paginated list of payment modalities for the current tenant.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { page, limit }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Paginated payment modality list
 */
async function GetPaymentModalities(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'financial_settings', 'view');
    const result = await GetPaymentModalitiesHelper(args, context.tenant_id);
    return result;
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Fetches a single payment modality by ID.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object|null>} Payment modality document
 */
async function GetPaymentModality(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'financial_settings', 'view');
    return await GetPaymentModalityByIdHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new payment modality.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { input }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object>} Created payment modality
 */
async function CreatePaymentModality(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'financial_settings', 'edit');
    ValidateCreatePaymentModalityInput(args.input);
    return await CreatePaymentModalityHelper(args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Updates an existing payment modality.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id, input }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object>} Updated payment modality
 */
async function UpdatePaymentModality(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'financial_settings', 'edit');
    ValidateUpdatePaymentModalityInput(args.input);
    return await UpdatePaymentModalityHelper(args.id, args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Soft-deletes a payment modality.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<boolean>}
 */
async function DeletePaymentModality(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'financial_settings', 'edit');
    return await DeletePaymentModalityHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: { getPaymentModality: GetPaymentModality, getPaymentModalities: GetPaymentModalities },
  Mutation: { createPaymentModality: CreatePaymentModality, updatePaymentModality: UpdatePaymentModality, deletePaymentModality: DeletePaymentModality },
};
