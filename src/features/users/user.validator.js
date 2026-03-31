// *************** IMPORT LIBRARY ***************
const { Joi, validateOrThrow, emailSchema } = require('../../shared/validators/common.validator');

// *************** VALIDATORS ***************

/**
 * Validates login input.
 *
 * @param {Object} input - { email, password }
 */
function ValidateLoginInput(input) {
  const schema = Joi.object({
    email: emailSchema.required(),
    password: Joi.string().min(6).required(),
  });
  validateOrThrow(input, schema, 'LoginInput');
}

/**
 * Validates input for creating a user.
 *
 * @param {Object} input - CreateUserInput
 */
function ValidateCreateUserInput(input) {
  const schema = Joi.object({
    email: emailSchema.required(),
    first_name: Joi.string().allow('', null).optional(),
    last_name: Joi.string().allow('', null).optional(),
    phone_number: Joi.string().allow('', null).optional(),
    phone_country_code: Joi.string().allow('', null).optional(),
    position: Joi.string().allow('', null).optional(),
    role_id: Joi.string().hex().length(24).allow(null).optional(),
  });
  validateOrThrow(input, schema, 'CreateUserInput');
}

/**
 * Validates input for updating a user profile.
 *
 * @param {Object} input - UpdateUserInput
 */
function ValidateUpdateUserInput(input) {
  const schema = Joi.object({
    first_name: Joi.string().allow('', null).optional(),
    last_name: Joi.string().allow('', null).optional(),
    phone_number: Joi.string().allow('', null).optional(),
    phone_country_code: Joi.string().allow('', null).optional(),
    position: Joi.string().allow('', null).optional(),
    avatar_s3_key: Joi.string().allow('', null).optional(),
    status: Joi.string().valid('active', 'inactive', 'pending').optional(),
    address: Joi.object({
      street: Joi.string().allow('', null).optional(),
      zip_code: Joi.string().allow('', null).optional(),
      city: Joi.string().allow('', null).optional(),
      department: Joi.string().allow('', null).optional(),
      region: Joi.string().allow('', null).optional(),
    }).optional(),
  });
  validateOrThrow(input, schema, 'UpdateUserInput');
}

/**
 * Validates reset password request.
 *
 * @param {Object} input - { email }
 */
function ValidateResetPasswordRequest(input) {
  const schema = Joi.object({
    email: emailSchema.required(),
  });
  validateOrThrow(input, schema, 'ResetPasswordRequest');
}

/**
 * Validates reset password confirmation.
 *
 * @param {Object} input - { token, password }
 */
function ValidateResetPasswordConfirm(input) {
  const schema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).required(),
  });
  validateOrThrow(input, schema, 'ResetPasswordConfirm');
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateLoginInput,
  ValidateCreateUserInput,
  ValidateUpdateUserInput,
  ValidateResetPasswordRequest,
  ValidateResetPasswordConfirm,
};
