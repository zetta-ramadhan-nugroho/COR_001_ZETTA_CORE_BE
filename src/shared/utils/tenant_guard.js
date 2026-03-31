// *************** IMPORT UTILITIES ***************
const { AppError } = require('../../core/error');

// *************** TENANT GUARD ***************

/**
 * Asserts that the requesting tenant matches the resource's tenant.
 * Throws an AppError if there is a mismatch, preventing cross-tenant data leakage.
 *
 * @param {string} requesting_tenant_id - The tenant_id from the GraphQL context
 * @param {string} resource_tenant_id - The tenant_id on the resource being accessed
 * @returns {void}
 * @throws {AppError} If tenant IDs do not match
 */
function assertTenantScope(requesting_tenant_id, resource_tenant_id) {
  if (!requesting_tenant_id) {
    throw new AppError('Tenant context is required.', 'MISSING_TENANT_CONTEXT', 401);
  }

  if (!resource_tenant_id) {
    throw new AppError('Resource has no tenant scope.', 'MISSING_RESOURCE_TENANT', 500);
  }

  if (requesting_tenant_id.toString() !== resource_tenant_id.toString()) {
    throw new AppError(
      'Access denied: resource does not belong to your tenant.',
      'TENANT_SCOPE_VIOLATION',
      403
    );
  }
}

/**
 * Returns a MongoDB query filter with tenant_id scoping and soft-delete guard.
 * Use this as the base filter for all DB queries.
 *
 * @param {string} tenant_id - Tenant ID from context
 * @param {Object} [extra={}] - Additional query filters to merge
 * @returns {Object} Query filter with tenant_id and deleted_at: null
 */
function buildTenantQuery(tenant_id, extra = {}) {
  if (!tenant_id) {
    throw new AppError('Tenant context is required.', 'MISSING_TENANT_CONTEXT', 401);
  }

  return {
    tenant_id,
    deleted_at: null,
    ...extra,
  };
}

// *************** EXPORT MODULE ***************
module.exports = { assertTenantScope, buildTenantQuery };
