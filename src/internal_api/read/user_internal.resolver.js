// *************** IMPORT MODEL ***************
const UserModel = require('../../features/users/user.model');
const TenantMemberModel = require('../../features/tenant_members/tenant_member.model');
const RoleModel = require('../../features/roles/role.model');

// *************** IMPORT UTILITIES ***************
const { HandleGraphQLError, AppError } = require('../../core/error');
const { VerifyServiceAuth } = require('../../middlewares/auth/service_auth.middleware');
const mongoose = require('mongoose');

// *************** INTERNAL QUERY ***************

/**
 * Returns user scope (role, permissions, status) for a given user in a tenant.
 * Used by downstream apps to verify user access context.
 * SERVICE-AUTH REQUIRED.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { user_id, tenant_id }
 * @param {Object} context - GraphQL context
 * @returns {Promise<Object|null>} UserScope
 */
async function internal_getUserScope(_, args, context) {
  try {
    VerifyServiceAuth(context);

    const membership = await TenantMemberModel.findOne({
      user_id: new mongoose.Types.ObjectId(args.user_id),
      tenant_id: args.tenant_id,
      deleted_at: null,
    }).lean();

    if (!membership) return null;

    const user = await UserModel.findOne({
      _id: new mongoose.Types.ObjectId(args.user_id),
      deleted_at: null,
    })
      .select('status email')
      .lean();

    if (!user) return null;

    const role = await RoleModel.findOne({
      tenant_id: args.tenant_id,
      _id: membership.role_id || null,
      deleted_at: null,
    }).lean();

    const roleSlug = role?.slug || 'member';
    const permissions = role
      ? Object.fromEntries(role.permissions instanceof Map ? role.permissions : new Map(Object.entries(role.permissions || {})))
      : {};

    return {
      user_id: args.user_id,
      tenant_id: args.tenant_id,
      role: roleSlug,
      permissions,
      status: membership.status,
    };
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: { internal_getUserScope },
};
