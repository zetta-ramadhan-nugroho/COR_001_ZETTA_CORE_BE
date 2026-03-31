// *************** IMPORT HELPER FUNCTION ***************
const { GetPeriodsHelper, GetPeriodByIdHelper, CreatePeriodHelper, UpdatePeriodHelper, DeletePeriodHelper } = require('./period.helper');

// *************** IMPORT VALIDATOR ***************
const { ValidateCreatePeriodInput, ValidateUpdatePeriodInput } = require('./period.validator');

// *************** IMPORT UTILITIES ***************
const { HandleGraphQLError } = require('../../../core/error');
const { CheckPermission } = require('../../../shared/utils/permission_check');

// *************** QUERY ***************

/**
 * Fetches a paginated list of periods for the current tenant.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { page, limit }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Paginated period list
 */
async function GetPeriods(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'view');
    const result = await GetPeriodsHelper(args, context.tenant_id);
    return result;
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Fetches a single period by ID.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object|null>} Period document
 */
async function GetPeriod(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'view');
    return await GetPeriodByIdHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new period.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { input }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object>} Created period
 */
async function CreatePeriod(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'edit');
    ValidateCreatePeriodInput(args.input);
    return await CreatePeriodHelper(args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Updates an existing period.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id, input }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object>} Updated period
 */
async function UpdatePeriod(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'edit');
    ValidateUpdatePeriodInput(args.input);
    return await UpdatePeriodHelper(args.id, args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Soft-deletes a period.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<boolean>}
 */
async function DeletePeriod(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'edit');
    return await DeletePeriodHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: { getPeriod: GetPeriod, getPeriods: GetPeriods },
  Mutation: { createPeriod: CreatePeriod, updatePeriod: UpdatePeriod, deletePeriod: DeletePeriod },
};
