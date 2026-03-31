// *************** IMPORT LIBRARY ***************
const Joi = require('joi');

// *************** IMPORT UTILITIES ***************
const { AppError } = require('../../core/error');

// *************** COMMON VALIDATORS ***************

// *************** Reusable Joi schemas for shared field patterns
const mongoIdSchema = Joi.string().hex().length(24).messages({
  'string.hex': 'ID must be a valid hex string.',
  'string.length': 'ID must be exactly 24 characters.',
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(20),
});

const emailSchema = Joi.string().email().lowercase().trim().messages({
  'string.email': 'Must be a valid email address.',
});

const phoneSchema = Joi.object({
  phone_number: Joi.string().allow('', null).optional(),
  phone_country_code: Joi.string().allow('', null).optional(),
});

/**
 * Validates a value against a Joi schema and throws an AppError on failure.
 *
 * @param {*} value - The value to validate
 * @param {import('joi').Schema} schema - The Joi schema to validate against
 * @param {string} [context='input'] - Descriptive context for error messages
 * @returns {*} The validated (and potentially coerced) value
 * @throws {AppError} If validation fails
 */
function validateOrThrow(value, schema, context = 'input') {
  const { error, value: validated } = schema.validate(value, { abortEarly: false });

  if (error) {
    const messages = error.details.map((d) => d.message).join('; ');
    throw new AppError(
      `Validation failed for ${context}: ${messages}`,
      'VALIDATION_ERROR',
      400,
      { fields: error.details.map((d) => d.path.join('.')) }
    );
  }

  return validated;
}

// *************** EXPORT MODULE ***************
module.exports = {
  mongoIdSchema,
  paginationSchema,
  emailSchema,
  phoneSchema,
  validateOrThrow,
  Joi,
};
