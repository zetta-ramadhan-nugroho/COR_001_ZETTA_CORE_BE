// *************** IMPORT HELPER FUNCTION ***************
const {
  GetRolesHelper,
  GetRoleByIdHelper,
  CreateRoleHelper,
  UpdateRoleHelper,
  UpdateRolePermissionsHelper,
  DeleteRoleHelper,
} = require('./role.helper');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateCreateRoleInput,
  ValidateUpdateRoleInput,
  ValidateUpdateRolePermissionsInput,
} = require('./role.validator');

// *************** IMPORT UTILITIES ***************
const { HandleGraphQLError, AppError } = require('../../core/error');
const { CheckPermission } = require('../../shared/utils/permission_check');

// *************** QUERY ***************

/**
 * Fetches a paginated list of roles for the current tenant.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { page, limit }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Paginated role list
 */
async function GetRoles(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'roles', 'view');
    return await GetRolesHelper(args, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Fetches a single role by ID.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object|null>} Role document
 */
async function GetRole(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'roles', 'view');
    return await GetRoleByIdHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new tenant-scoped role with no permissions.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { input: CreateRoleInput }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Created role document
 */
async function CreateRole(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'roles', 'edit');
    ValidateCreateRoleInput(args.input);
    return await CreateRoleHelper(args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Updates a role's display fields.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id, input: UpdateRoleInput }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Updated role document
 */
async function UpdateRole(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'roles', 'edit');
    ValidateUpdateRoleInput(args.input);
    return await UpdateRoleHelper(args.id, args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Updates the permissions map of a role.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id, input: UpdateRolePermissionsInput }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Updated role document
 */
async function UpdateRolePermissions(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'roles', 'edit');
    ValidateUpdateRolePermissionsInput(args.input);
    return await UpdateRolePermissionsHelper(args.id, args.input.permissions, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Soft-deletes a role.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<boolean>}
 */
async function DeleteRole(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'roles', 'edit');
    return await DeleteRoleHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: { getRole: GetRole, getRoles: GetRoles },
  Mutation: {
    createRole: CreateRole,
    updateRole: UpdateRole,
    updateRolePermissions: UpdateRolePermissions,
    deleteRole: DeleteRole,
  },
};
