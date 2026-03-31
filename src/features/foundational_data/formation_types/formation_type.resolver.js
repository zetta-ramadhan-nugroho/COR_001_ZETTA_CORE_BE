// *************** IMPORT HELPER FUNCTION ***************
const { GetFormationTypesHelper, GetFormationTypeByIdHelper, CreateFormationTypeHelper, UpdateFormationTypeHelper, DeleteFormationTypeHelper } = require('./formation_type.helper');

// *************** IMPORT VALIDATOR ***************
const { ValidateCreateFormationTypeInput, ValidateUpdateFormationTypeInput } = require('./formation_type.validator');

// *************** IMPORT UTILITIES ***************
const { HandleGraphQLError } = require('../../../core/error');
const { CheckPermission } = require('../../../shared/utils/permission_check');

// *************** QUERY ***************

/**
 * Fetches a paginated list of formation types for the current tenant.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { page, limit }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Paginated formation type list
 */
async function GetFormationTypes(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'view');
    const result = await GetFormationTypesHelper(args, context.tenant_id);
    return result;
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Fetches a single formation type by ID.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object|null>} Formation type document
 */
async function GetFormationType(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'view');
    return await GetFormationTypeByIdHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new formation type.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { input }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object>} Created formation type
 */
async function CreateFormationType(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'edit');
    ValidateCreateFormationTypeInput(args.input);
    return await CreateFormationTypeHelper(args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Updates an existing formation type.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id, input }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object>} Updated formation type
 */
async function UpdateFormationType(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'edit');
    ValidateUpdateFormationTypeInput(args.input);
    return await UpdateFormationTypeHelper(args.id, args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Soft-deletes a formation type.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<boolean>}
 */
async function DeleteFormationType(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'edit');
    return await DeleteFormationTypeHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: { getFormationType: GetFormationType, getFormationTypes: GetFormationTypes },
  Mutation: { createFormationType: CreateFormationType, updateFormationType: UpdateFormationType, deleteFormationType: DeleteFormationType },
};
