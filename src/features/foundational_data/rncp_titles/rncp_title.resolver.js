// *************** IMPORT HELPER FUNCTION ***************
const { GetRncpTitlesHelper, GetRncpTitleByIdHelper, CreateRncpTitleHelper, UpdateRncpTitleHelper, DeleteRncpTitleHelper } = require('./rncp_title.helper');

// *************** IMPORT VALIDATOR ***************
const { ValidateCreateRncpTitleInput, ValidateUpdateRncpTitleInput } = require('./rncp_title.validator');

// *************** IMPORT UTILITIES ***************
const { HandleGraphQLError } = require('../../../core/error');
const { CheckPermission } = require('../../../shared/utils/permission_check');

// *************** QUERY ***************

/**
 * Fetches a paginated list of RNCP titles for the current tenant.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { page, limit }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Paginated RNCP title list
 */
async function GetRncpTitles(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'view');
    const result = await GetRncpTitlesHelper(args, context.tenant_id);
    return result;
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Fetches a single RNCP title by ID.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object|null>} RNCP title document
 */
async function GetRncpTitle(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'view');
    return await GetRncpTitleByIdHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new RNCP title.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { input }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object>} Created RNCP title
 */
async function CreateRncpTitle(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'edit');
    ValidateCreateRncpTitleInput(args.input);
    return await CreateRncpTitleHelper(args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Updates an existing RNCP title.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id, input }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object>} Updated RNCP title
 */
async function UpdateRncpTitle(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'edit');
    ValidateUpdateRncpTitleInput(args.input);
    return await UpdateRncpTitleHelper(args.id, args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Soft-deletes an RNCP title.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<boolean>}
 */
async function DeleteRncpTitle(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'edit');
    return await DeleteRncpTitleHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: { getRncpTitle: GetRncpTitle, getRncpTitles: GetRncpTitles },
  Mutation: { createRncpTitle: CreateRncpTitle, updateRncpTitle: UpdateRncpTitle, deleteRncpTitle: DeleteRncpTitle },
};
