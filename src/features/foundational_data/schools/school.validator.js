// *************** IMPORT LIBRARY ***************
const { Joi, validateOrThrow } = require('../../../shared/validators/common.validator');

// *************** VALIDATORS ***************

/**
 * Validates input for creating a school.
 *
 * @param {Object} input - CreateSchoolInput
 */
function ValidateCreateSchoolInput(input) {
  const schema = Joi.object({
    name: Joi.string().required(),
    code: Joi.string().allow('', null).optional(),
    address: Joi.object({
      street: Joi.string().allow('', null).optional(),
      zip_code: Joi.string().allow('', null).optional(),
      city: Joi.string().allow('', null).optional(),
      country: Joi.string().allow('', null).optional(),
    }).optional(),
  });
  validateOrThrow(input, schema, 'CreateSchoolInput');
}

/**
 * Validates input for updating a school.
 *
 * @param {Object} input - UpdateSchoolInput
 */
function ValidateUpdateSchoolInput(input) {
  const schema = Joi.object({
    name: Joi.string().optional(),
    code: Joi.string().allow('', null).optional(),
    address: Joi.object({
      street: Joi.string().allow('', null).optional(),
      zip_code: Joi.string().allow('', null).optional(),
      city: Joi.string().allow('', null).optional(),
      country: Joi.string().allow('', null).optional(),
    }).optional(),
    logo_s3_key: Joi.string().allow('', null).optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
  });
  validateOrThrow(input, schema, 'UpdateSchoolInput');
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateCreateSchoolInput, ValidateUpdateSchoolInput };
