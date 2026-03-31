// *************** IMPORT LIBRARY ***************
const { Joi, validateOrThrow } = require('../../../shared/validators/common.validator');

// *************** VALIDATORS ***************

/**
 * Validates input for creating a campus.
 *
 * @param {Object} input - { name, school_id, address, status }
 */
function ValidateCreateCampusInput(input) {
  const schema = Joi.object({
    name: Joi.string().required(),
    school_id: Joi.string().hex().length(24).allow(null).optional(),
    address: Joi.object({
      street: Joi.string().allow('', null).optional(),
      zip_code: Joi.string().allow('', null).optional(),
      city: Joi.string().allow('', null).optional(),
      country: Joi.string().allow('', null).optional(),
    }).optional(),
  });
  validateOrThrow(input, schema, 'CreateCampusInput');
}

/**
 * Validates input for updating a campus.
 *
 * @param {Object} input - Partial campus fields
 */
function ValidateUpdateCampusInput(input) {
  const schema = Joi.object({
    name: Joi.string().optional(),
    school_id: Joi.string().hex().length(24).allow(null).optional(),
    address: Joi.object({
      street: Joi.string().allow('', null).optional(),
      zip_code: Joi.string().allow('', null).optional(),
      city: Joi.string().allow('', null).optional(),
      country: Joi.string().allow('', null).optional(),
    }).optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
  });
  validateOrThrow(input, schema, 'UpdateCampusInput');
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateCreateCampusInput, ValidateUpdateCampusInput };
