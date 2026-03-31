// *************** IMPORT HELPER FUNCTION ***************
const { GetAdditionalFeesHelper, GetAdditionalFeeByIdHelper, CreateAdditionalFeeHelper, UpdateAdditionalFeeHelper, DeleteAdditionalFeeHelper } = require('./additional_fee.helper');

// *************** IMPORT VALIDATOR ***************
const { ValidateCreateAdditionalFeeInput, ValidateUpdateAdditionalFeeInput } = require('./additional_fee.validator');

// *************** IMPORT UTILITIES ***************
const { HandleGraphQLError } = require('../../../core/error');
const { CheckPermission } = require('../../../shared/utils/permission_check');

// *************** QUERY ***************

/**
 * Fetches a paginated list of additional fees for the current tenant.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { page, limit }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Paginated additional fee list
 */
async function GetAdditionalFees(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'financial_settings', 'view');
    const result = await GetAdditionalFeesHelper(args, context.tenant_id);
    return result;
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Fetches a single additional fee by ID.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object|null>} Additional fee document
 */
async function GetAdditionalFee(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'financial_settings', 'view');
    return await GetAdditionalFeeByIdHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new additional fee.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { input }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object>} Created additional fee
 */
async function CreateAdditionalFee(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'financial_settings', 'edit');
    ValidateCreateAdditionalFeeInput(args.input);
    return await CreateAdditionalFeeHelper(args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Updates an existing additional fee.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id, input }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object>} Updated additional fee
 */
async function UpdateAdditionalFee(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'financial_settings', 'edit');
    ValidateUpdateAdditionalFeeInput(args.input);
    return await UpdateAdditionalFeeHelper(args.id, args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Soft-deletes an additional fee.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<boolean>}
 */
async function DeleteAdditionalFee(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'financial_settings', 'edit');
    return await DeleteAdditionalFeeHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: { getAdditionalFee: GetAdditionalFee, getAdditionalFees: GetAdditionalFees },
  Mutation: { createAdditionalFee: CreateAdditionalFee, updateAdditionalFee: UpdateAdditionalFee, deleteAdditionalFee: DeleteAdditionalFee },
};
