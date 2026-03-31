// *************** IMPORT UTILITIES ***************
const { AppError } = require('../../core/error');

// *************** PERMISSION CHECK ***************

/**
 * Checks whether the user's role has the required permission on a given module.
 * Throws an AppError if the permission is not satisfied.
 *
 * Permissions are stored in context as: { [module]: ['view', 'edit'] }
 *
 * @param {string} role - The user's role slug
 * @param {Object} permissions - The user's permissions map from context
 * @param {string} module - The module to check (e.g. 'students', 'programs')
 * @param {string} action - The required action: 'view' or 'edit'
 * @returns {void}
 * @throws {AppError} If permission is not granted
 */
function CheckPermission(role, permissions, module, action) {
  // *************** Super admin / system roles bypass all checks
  if (role === 'super_admin') return;

  if (!permissions || typeof permissions !== 'object') {
    throw new AppError(
      `Access denied: no permissions found.`,
      'PERMISSION_DENIED',
      403
    );
  }

  const allowedActions = permissions[module];

  if (!allowedActions || !Array.isArray(allowedActions) || !allowedActions.includes(action)) {
    throw new AppError(
      `Access denied: you do not have '${action}' permission on '${module}'.`,
      'PERMISSION_DENIED',
      403,
      { module, action }
    );
  }
}

/**
 * Returns true if the user has the given permission on a module, false otherwise.
 * Use this for conditional logic rather than guard throws.
 *
 * @param {string} role - The user's role slug
 * @param {Object} permissions - The user's permissions map
 * @param {string} module - The module to check
 * @param {string} action - The action to check: 'view' or 'edit'
 * @returns {boolean}
 */
function HasPermission(role, permissions, module, action) {
  if (role === 'super_admin') return true;

  if (!permissions || typeof permissions !== 'object') return false;

  const allowedActions = permissions[module];
  return Array.isArray(allowedActions) && allowedActions.includes(action);
}

// *************** EXPORT MODULE ***************
module.exports = { CheckPermission, HasPermission };
