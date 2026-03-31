// *************** IMPORT HELPER FUNCTION ***************
const {
  LoginHelper,
  GetMeHelper,
  GetUsersHelper,
  GetUserByIdHelper,
  CreateUserHelper,
  UpdateUserHelper,
  DeactivateUserHelper,
  ResetPasswordRequestHelper,
  ResetPasswordConfirmHelper,
  SwitchTenantHelper,
} = require('./user.helper');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateLoginInput,
  ValidateCreateUserInput,
  ValidateUpdateUserInput,
  ValidateResetPasswordRequest,
  ValidateResetPasswordConfirm,
} = require('./user.validator');

// *************** IMPORT UTILITIES ***************
const { HandleGraphQLError, AppError } = require('../../core/error');
const { CheckPermission } = require('../../shared/utils/permission_check');
const config = require('../../core/config');

// *************** QUERY ***************

/**
 * Returns the currently authenticated user's profile.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - (none)
 * @param {Object} context - { user_id }
 * @returns {Promise<Object>} User document
 */
async function GetMe(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    return await GetMeHelper(context.user_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Fetches a paginated list of users in the current tenant.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { search, page, limit }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Paginated user list
 */
async function GetUsers(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'users', 'view');
    return await GetUsersHelper(args, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Fetches a single user by ID.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object|null>} User document
 */
async function GetUser(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'users', 'view');
    return await GetUserByIdHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** MUTATION ***************

/**
 * Authenticates a user and returns a JWT token.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { input: LoginInput }
 * @param {Object} context - { tenant_id }
 * @returns {Promise<Object>} { token, user }
 */
async function Login(_, args, context) {
  try {
    if (!context.tenant_id) throw new AppError('Tenant context is required.', 'MISSING_TENANT_CONTEXT', 400);
    ValidateLoginInput(args.input);
    return await LoginHelper(args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Logs out the current user. (Token invalidation handled client-side.)
 *
 * @returns {Promise<boolean>}
 */
async function Logout() {
  return true;
}

/**
 * Initiates a password reset request.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { email }
 * @returns {Promise<boolean>}
 */
async function ResetPasswordRequest(_, args) {
  try {
    ValidateResetPasswordRequest({ email: args.email });
    return await ResetPasswordRequestHelper(args.email, config.app_base_url);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Confirms a password reset using the token from email.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { token, password }
 * @returns {Promise<boolean>}
 */
async function ResetPasswordConfirm(_, args) {
  try {
    ValidateResetPasswordConfirm({ token: args.token, password: args.password });
    return await ResetPasswordConfirmHelper(args.token, args.password);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Creates a new user and adds them to the current tenant.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { input: CreateUserInput }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Created user document
 */
async function CreateUser(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'users', 'edit');
    ValidateCreateUserInput(args.input);
    return await CreateUserHelper(args.input, context.tenant_id, config.app_base_url);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Updates a user's profile.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id, input: UpdateUserInput }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Updated user document
 */
async function UpdateUser(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'users', 'edit');
    ValidateUpdateUserInput(args.input);
    return await UpdateUserHelper(args.id, args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Deactivates a user's membership in the current tenant.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Updated user document
 */
async function DeactivateUser(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'users', 'edit');
    return await DeactivateUserHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Switches the authenticated user to a different tenant context.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { tenant_id }
 * @param {Object} context - { user_id }
 * @returns {Promise<Object>} { token, user }
 */
async function SwitchTenant(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    return await SwitchTenantHelper(context.user_id, args.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: { getMe: GetMe, getUsers: GetUsers, getUser: GetUser },
  Mutation: {
    login: Login,
    logout: Logout,
    resetPasswordRequest: ResetPasswordRequest,
    resetPasswordConfirm: ResetPasswordConfirm,
    createUser: CreateUser,
    updateUser: UpdateUser,
    deactivateUser: DeactivateUser,
    switchTenant: SwitchTenant,
  },
};
