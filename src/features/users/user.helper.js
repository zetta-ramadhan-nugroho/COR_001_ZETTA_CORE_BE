// *************** IMPORT LIBRARY ***************
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoose = require('mongoose');

// *************** IMPORT MODEL ***************
const UserModel = require('./user.model');
const TenantMemberModel = require('../tenant_members/tenant_member.model');
const RoleModel = require('../roles/role.model');
const ErrorLogModel = require('../../core/error_log.model');

// *************** IMPORT CORE ***************
const config = require('../../core/config');
const { AppError } = require('../../core/error');

// *************** IMPORT SERVICES ***************
const { SendEmail } = require('../../shared/services/mailer.service');

// *************** QUERY ***************

/**
 * Authenticates a user against the given tenant context.
 * Verifies membership, password, and active status.
 * Returns a signed JWT and user profile on success.
 *
 * @param {Object} input - { email, password }
 * @param {string} tenant_id - Tenant scope from request context
 * @returns {Promise<Object>} { token, user }
 */
async function LoginHelper(input, tenant_id) {
  try {
    const { email, password } = input;

    // *************** Find user globally by email
    const user = await UserModel.findOne({ email: email.toLowerCase().trim(), deleted_at: null });
    if (!user) {
      throw new AppError('Invalid email or password.', 'INVALID_CREDENTIALS', 401);
    }

    // *************** Verify tenant membership
    const membership = await TenantMemberModel.findOne({
      user_id: user._id,
      tenant_id,
      status: 'active',
      deleted_at: null,
    });
    if (!membership) {
      throw new AppError('You do not have access to this tenant.', 'TENANT_ACCESS_DENIED', 403);
    }

    // *************** Verify user is active
    if (user.status !== 'active') {
      throw new AppError('User account is inactive.', 'USER_INACTIVE', 403);
    }

    // *************** Verify password
    if (!user.password_hash) {
      throw new AppError('Password not set. Please use the reset link.', 'PASSWORD_NOT_SET', 403);
    }
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new AppError('Invalid email or password.', 'INVALID_CREDENTIALS', 401);
    }

    // *************** Resolve role and permissions from tenant-scoped role
    const role = await RoleModel.findOne({ tenant_id, deleted_at: null, _id: membership.role_id || null });
    const roleSlug = role?.slug || 'member';
    const permissions = role ? Object.fromEntries(role.permissions || new Map()) : {};

    // *************** Sign JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        tenantId: tenant_id,
        role: roleSlug,
        permissions,
      },
      config.jwt_secret,
      { expiresIn: config.jwt_expires_in }
    );

    return {
      token,
      user: {
        _id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_s3_key: user.avatar_s3_key,
        position: user.position,
        status: user.status,
        role: roleSlug,
      },
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/users/user.helper.js',
      function_name: 'LoginHelper',
      parameter_input: JSON.stringify({ email: input.email, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'LOGIN_FAILED', 500);
  }
}

/**
 * Returns the current authenticated user's profile.
 *
 * @param {string} user_id - Authenticated user ID from context
 * @returns {Promise<Object>} User document (without password_hash)
 */
async function GetMeHelper(user_id) {
  try {
    const user = await UserModel.findOne({ _id: new mongoose.Types.ObjectId(user_id), deleted_at: null })
      .select('-password_hash -reset_key -reset_key_expires')
      .lean();
    if (!user) throw new AppError('User not found.', 'USER_NOT_FOUND', 404);
    return user;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/users/user.helper.js',
      function_name: 'GetMeHelper',
      parameter_input: JSON.stringify({ user_id }),
      error: String(error.stack),
    });
    throw new AppError(error.message, 'GET_ME_FAILED', 500);
  }
}

/**
 * Retrieves a paginated list of users who are active members of the tenant.
 *
 * @param {Object} args - { search, page, limit }
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} { data, total, page, limit }
 */
async function GetUsersHelper(args, tenant_id) {
  try {
    const { search, page = 1, limit = 20 } = args;

    // *************** Find all active members of this tenant
    const memberships = await TenantMemberModel.find({ tenant_id, status: 'active', deleted_at: null }).lean();
    const memberUserIds = memberships.map((m) => m.user_id);

    // *************** Build user query with optional search
    const userQuery = { _id: { $in: memberUserIds }, deleted_at: null };
    if (search) {
      const regex = new RegExp(search, 'i');
      userQuery.$or = [{ first_name: regex }, { last_name: regex }, { email: regex }];
    }

    const [data, total] = await Promise.all([
      UserModel.find(userQuery)
        .select('-password_hash -reset_key -reset_key_expires')
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(userQuery),
    ]);

    return { data, total, page, limit };
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/users/user.helper.js',
      function_name: 'GetUsersHelper',
      parameter_input: JSON.stringify({ args, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_USERS_FAILED', 500);
  }
}

/**
 * Retrieves a single user by ID, only if they are a member of the tenant.
 *
 * @param {string} id - User document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object|null>} User document
 */
async function GetUserByIdHelper(id, tenant_id) {
  try {
    // *************** Verify user is a member of this tenant
    const membership = await TenantMemberModel.findOne({
      user_id: new mongoose.Types.ObjectId(id),
      tenant_id,
      deleted_at: null,
    });
    if (!membership) return null;

    return await UserModel.findOne({ _id: new mongoose.Types.ObjectId(id), deleted_at: null })
      .select('-password_hash -reset_key -reset_key_expires')
      .lean();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/users/user.helper.js',
      function_name: 'GetUserByIdHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_USER_FAILED', 500);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new platform user and adds them to the tenant.
 * If the user already exists globally, adds them to the tenant.
 * Sends a welcome email with a setup link for new users.
 *
 * @param {Object} input - { email, first_name, last_name, role_id, ... }
 * @param {string} tenant_id - Tenant scope
 * @param {string} base_url - App base URL for the setup link
 * @returns {Promise<Object>} Created or existing user document
 */
async function CreateUserHelper(input, tenant_id, base_url) {
  try {
    const email = input.email.toLowerCase().trim();

    // *************** Check if user already exists globally
    let user = await UserModel.findOne({ email, deleted_at: null });

    if (user) {
      // *************** User exists globally — check if already in this tenant
      const existingMember = await TenantMemberModel.findOne({ user_id: user._id, tenant_id, deleted_at: null });
      if (existingMember) {
        throw new AppError('This user is already a member of the tenant.', 'USER_ALREADY_MEMBER', 409);
      }
    } else {
      // *************** Create new global user with pending status and reset key for password setup
      const reset_key = crypto.randomBytes(32).toString('hex');
      const reset_key_expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      user = await UserModel.create({
        email,
        first_name: input.first_name,
        last_name: input.last_name,
        phone_number: input.phone_number,
        phone_country_code: input.phone_country_code,
        position: input.position,
        status: 'pending',
        reset_key,
        reset_key_expires,
      });

      // *************** Send welcome email with password setup link
      const setupLink = `${base_url}/reset-password?token=${reset_key}&type=welcome`;
      await SendEmail({
        to: user.email,
        subject: 'Welcome to Zetta Core — Set Your Password',
        html: `
          <h1>Welcome to Zetta Core!</h1>
          <p>You have been invited to join the platform.</p>
          <p>Please click the link below to set your password and activate your account:</p>
          <a href="${setupLink}">Set My Password</a>
          <p>This link expires in 24 hours.</p>
        `,
      });
    }

    // *************** Create tenant membership
    await TenantMemberModel.create({
      user_id: user._id,
      tenant_id,
      status: 'active',
      role_id: input.role_id || null,
    });

    return UserModel.findById(user._id).select('-password_hash -reset_key -reset_key_expires').lean();
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/users/user.helper.js',
      function_name: 'CreateUserHelper',
      parameter_input: JSON.stringify({ input: { ...input, email: input.email }, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'CREATE_USER_FAILED', 500);
  }
}

/**
 * Updates a user's profile fields.
 * Only updates the user's own global profile — tenant membership changes handled separately.
 *
 * @param {string} id - User document ID
 * @param {Object} input - Fields to update
 * @param {string} tenant_id - Tenant scope (for membership verification)
 * @returns {Promise<Object>} Updated user document
 */
async function UpdateUserHelper(id, input, tenant_id) {
  try {
    // *************** Verify the user is in this tenant before updating
    const membership = await TenantMemberModel.findOne({
      user_id: new mongoose.Types.ObjectId(id),
      tenant_id,
      deleted_at: null,
    });
    if (!membership) throw new AppError('User not found in this tenant.', 'USER_NOT_FOUND', 404);

    const user = await UserModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), deleted_at: null },
      { $set: input },
      { new: true }
    )
      .select('-password_hash -reset_key -reset_key_expires')
      .lean();

    if (!user) throw new AppError('User not found.', 'USER_NOT_FOUND', 404);
    return user;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/users/user.helper.js',
      function_name: 'UpdateUserHelper',
      parameter_input: JSON.stringify({ id, input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'UPDATE_USER_FAILED', 500);
  }
}

/**
 * Deactivates a user by setting their status to 'inactive'.
 * Soft operation — does not delete the user globally.
 *
 * @param {string} id - User document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Updated user document
 */
async function DeactivateUserHelper(id, tenant_id) {
  try {
    const membership = await TenantMemberModel.findOne({
      user_id: new mongoose.Types.ObjectId(id),
      tenant_id,
      deleted_at: null,
    });
    if (!membership) throw new AppError('User not found in this tenant.', 'USER_NOT_FOUND', 404);

    // *************** Set tenant membership to suspended
    await TenantMemberModel.findOneAndUpdate(
      { user_id: new mongoose.Types.ObjectId(id), tenant_id },
      { $set: { status: 'suspended' } }
    );

    return UserModel.findById(id).select('-password_hash -reset_key -reset_key_expires').lean();
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/users/user.helper.js',
      function_name: 'DeactivateUserHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'DEACTIVATE_USER_FAILED', 500);
  }
}

/**
 * Resets a user's password using their reset key.
 *
 * @param {string} token - The reset key sent by email
 * @param {string} new_password - The new password to set
 * @returns {Promise<boolean>}
 */
async function ResetPasswordConfirmHelper(token, new_password) {
  try {
    const user = await UserModel.findOne({
      reset_key: token,
      reset_key_expires: { $gt: new Date() },
      deleted_at: null,
    });
    if (!user) {
      throw new AppError('Invalid or expired reset token.', 'INVALID_RESET_TOKEN', 400);
    }

    const password_hash = await bcrypt.hash(new_password, 12);
    await UserModel.findByIdAndUpdate(user._id, {
      $set: { password_hash, status: 'active' },
      $unset: { reset_key: 1, reset_key_expires: 1 },
    });

    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/users/user.helper.js',
      function_name: 'ResetPasswordConfirmHelper',
      parameter_input: JSON.stringify({ token: '***' }),
      error: String(error.stack),
    });
    throw new AppError(error.message, 'RESET_PASSWORD_FAILED', 500);
  }
}

/**
 * Initiates a password reset by sending an email with a reset link.
 *
 * @param {string} email - User email address
 * @param {string} base_url - App base URL for the reset link
 * @returns {Promise<boolean>} Always true (prevents email enumeration)
 */
async function ResetPasswordRequestHelper(email, base_url) {
  try {
    const user = await UserModel.findOne({ email: email.toLowerCase().trim(), deleted_at: null });
    if (!user) return true; // *************** Silently succeed to prevent enumeration

    const reset_key = crypto.randomBytes(32).toString('hex');
    const reset_key_expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await UserModel.findByIdAndUpdate(user._id, { $set: { reset_key, reset_key_expires } });

    const resetLink = `${base_url}/reset-password?token=${reset_key}`;
    await SendEmail({
      to: user.email,
      subject: 'Zetta Core — Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>A password reset was requested for your account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset My Password</a>
        <p>This link expires in 1 hour. If you did not request this, ignore this email.</p>
      `,
    });

    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/users/user.helper.js',
      function_name: 'ResetPasswordRequestHelper',
      parameter_input: JSON.stringify({ email }),
      error: String(error.stack),
    });
    throw new AppError(error.message, 'RESET_REQUEST_FAILED', 500);
  }
}

/**
 * Generates a switch token for tenant switching.
 *
 * @param {string} user_id - Current user ID
 * @param {string} target_tenant_id - Tenant to switch to
 * @returns {Promise<Object>} { token, user }
 */
async function SwitchTenantHelper(user_id, target_tenant_id) {
  try {
    // *************** Verify user has membership in target tenant
    const membership = await TenantMemberModel.findOne({
      user_id: new mongoose.Types.ObjectId(user_id),
      tenant_id: target_tenant_id,
      status: 'active',
      deleted_at: null,
    });
    if (!membership) {
      throw new AppError('You do not have access to this tenant.', 'TENANT_ACCESS_DENIED', 403);
    }

    const user = await UserModel.findById(user_id).select('-password_hash -reset_key -reset_key_expires').lean();
    if (!user) throw new AppError('User not found.', 'USER_NOT_FOUND', 404);

    const role = await RoleModel.findOne({ tenant_id: target_tenant_id, deleted_at: null, _id: membership.role_id || null });
    const roleSlug = role?.slug || 'member';
    const permissions = role ? Object.fromEntries(role.permissions || new Map()) : {};

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        tenantId: target_tenant_id,
        role: roleSlug,
        permissions,
      },
      config.jwt_secret,
      { expiresIn: config.jwt_expires_in }
    );

    return { token, user: { ...user, role: roleSlug } };
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/users/user.helper.js',
      function_name: 'SwitchTenantHelper',
      parameter_input: JSON.stringify({ user_id, target_tenant_id }),
      error: String(error.stack),
    });
    throw new AppError(error.message, 'SWITCH_TENANT_FAILED', 500);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
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
};
