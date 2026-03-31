// *************** IMPORT HELPER FUNCTION ***************
const { GetLevelsHelper, GetLevelByIdHelper, CreateLevelHelper, UpdateLevelHelper, DeleteLevelHelper } = require('./level.helper');

// *************** IMPORT VALIDATOR ***************
const { ValidateCreateLevelInput, ValidateUpdateLevelInput } = require('./level.validator');

// *************** IMPORT UTILITIES ***************
const { HandleGraphQLError } = require('../../../core/error');
const { CheckPermission } = require('../../../shared/utils/permission_check');

// *************** QUERY ***************

/**
 * Fetches a paginated list of levels for the current tenant.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { page, limit }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Paginated level list
 */
async function GetLevels(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'view');
    const result = await GetLevelsHelper(args, context.tenant_id);
    return result;
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Fetches a single level by ID.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object|null>} Level document
 */
async function GetLevel(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'view');
    return await GetLevelByIdHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new level.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { input }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object>} Created level
 */
async function CreateLevel(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'edit');
    ValidateCreateLevelInput(args.input);
    return await CreateLevelHelper(args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Updates an existing level.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id, input }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object>} Updated level
 */
async function UpdateLevel(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'edit');
    ValidateUpdateLevelInput(args.input);
    return await UpdateLevelHelper(args.id, args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Soft-deletes a level.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<boolean>}
 */
async function DeleteLevel(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'edit');
    return await DeleteLevelHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: { getLevel: GetLevel, getLevels: GetLevels },
  Mutation: { createLevel: CreateLevel, updateLevel: UpdateLevel, deleteLevel: DeleteLevel },
};
