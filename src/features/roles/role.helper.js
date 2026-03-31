// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODEL ***************
const RoleModel = require('./role.model');
const ErrorLogModel = require('../../core/error_log.model');

// *************** IMPORT UTILITIES ***************
const { AppError } = require('../../core/error');
const { buildTenantQuery } = require('../../shared/utils/tenant_guard');

// *************** QUERY ***************

/**
 * Retrieves a paginated list of roles scoped to the tenant.
 *
 * @param {Object} args - { page, limit }
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} { data, total, page, limit }
 */
async function GetRolesHelper(args, tenant_id) {
  try {
    const { page = 1, limit = 20 } = args;
    const query = buildTenantQuery(tenant_id);
    const [data, total] = await Promise.all([
      RoleModel.find(query).lean().sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit),
      RoleModel.countDocuments(query),
    ]);
    // *************** Convert Map permissions to plain object for GraphQL
    return {
      data: data.map((r) => ({
        ...r,
        permissions: r.permissions instanceof Map ? Object.fromEntries(r.permissions) : r.permissions || {},
      })),
      total,
      page,
      limit,
    };
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/roles/role.helper.js',
      function_name: 'GetRolesHelper',
      parameter_input: JSON.stringify({ args, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_ROLES_FAILED', 500);
  }
}

/**
 * Retrieves a single role by ID scoped to the tenant.
 *
 * @param {string} id - Role document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object|null>} Role document or null
 */
async function GetRoleByIdHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const role = await RoleModel.findOne(query).lean();
    if (!role) return null;
    return {
      ...role,
      permissions: role.permissions instanceof Map ? Object.fromEntries(role.permissions) : role.permissions || {},
    };
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/roles/role.helper.js',
      function_name: 'GetRoleByIdHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_ROLE_FAILED', 500);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new role for the tenant.
 * New roles default to no permissions — must be explicitly granted.
 *
 * @param {Object} input - { name, slug, description }
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Created role document
 */
async function CreateRoleHelper(input, tenant_id) {
  try {
    const role = await RoleModel.create({
      ...input,
      tenant_id,
      permissions: {},
      is_system: false,
    });
    const result = role.toObject();
    return {
      ...result,
      permissions: result.permissions instanceof Map ? Object.fromEntries(result.permissions) : result.permissions || {},
    };
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('A role with this slug already exists in this tenant.', 'ROLE_SLUG_DUPLICATE', 409);
    }
    await ErrorLogModel.create({
      path: 'features/roles/role.helper.js',
      function_name: 'CreateRoleHelper',
      parameter_input: JSON.stringify({ input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'CREATE_ROLE_FAILED', 500);
  }
}

/**
 * Updates a role's display fields (name, description).
 * Does not update permissions — use UpdateRolePermissionsHelper for that.
 *
 * @param {string} id - Role document ID
 * @param {Object} input - { name, description }
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Updated role document
 */
async function UpdateRoleHelper(id, input, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id), is_system: false });
    const role = await RoleModel.findOneAndUpdate(query, { $set: input }, { new: true }).lean();
    if (!role) throw new AppError('Role not found or is a system role that cannot be modified.', 'ROLE_NOT_FOUND', 404);
    return {
      ...role,
      permissions: role.permissions instanceof Map ? Object.fromEntries(role.permissions) : role.permissions || {},
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/roles/role.helper.js',
      function_name: 'UpdateRoleHelper',
      parameter_input: JSON.stringify({ id, input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'UPDATE_ROLE_FAILED', 500);
  }
}

/**
 * Updates the permissions map of a role.
 * Permissions are module-based: { [module]: ['view', 'edit'] }
 *
 * @param {string} id - Role document ID
 * @param {Object} permissions - The full new permissions map
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Updated role document
 */
async function UpdateRolePermissionsHelper(id, permissions, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const role = await RoleModel.findOneAndUpdate(
      query,
      { $set: { permissions } },
      { new: true }
    ).lean();
    if (!role) throw new AppError('Role not found.', 'ROLE_NOT_FOUND', 404);
    return {
      ...role,
      permissions: role.permissions instanceof Map ? Object.fromEntries(role.permissions) : role.permissions || {},
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/roles/role.helper.js',
      function_name: 'UpdateRolePermissionsHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'UPDATE_ROLE_PERMISSIONS_FAILED', 500);
  }
}

/**
 * Soft-deletes a role. System roles cannot be deleted.
 *
 * @param {string} id - Role document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<boolean>}
 */
async function DeleteRoleHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id), is_system: false });
    const result = await RoleModel.findOneAndUpdate(query, { $set: { deleted_at: new Date() } }).lean();
    if (!result) throw new AppError('Role not found or cannot be deleted.', 'ROLE_NOT_FOUND', 404);
    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/roles/role.helper.js',
      function_name: 'DeleteRoleHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'DELETE_ROLE_FAILED', 500);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  GetRolesHelper,
  GetRoleByIdHelper,
  CreateRoleHelper,
  UpdateRoleHelper,
  UpdateRolePermissionsHelper,
  DeleteRoleHelper,
};
