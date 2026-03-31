// *************** IMPORT LIBRARY ***************
const { Joi, validateOrThrow } = require('../../../shared/validators/common.validator');

// *************** VALIDATORS ***************

/**
 * Validates input for creating a speciality.
 *
 * @param {Object} input - { name, code, sector_id, status }
 */
function ValidateCreateSpecialityInput(input) {
  const schema = Joi.object({
    name: Joi.string().required(),
    code: Joi.string().allow('', null).optional(),
    sector_id: Joi.string().hex().length(24).allow(null).optional(),
  });
  validateOrThrow(input, schema, 'CreateSpecialityInput');
}

/**
 * Validates input for updating a speciality.
 *
 * @param {Object} input - Partial speciality fields
 */
function ValidateUpdateSpecialityInput(input) {
  const schema = Joi.object({
    name: Joi.string().optional(),
    code: Joi.string().allow('', null).optional(),
    sector_id: Joi.string().hex().length(24).allow(null).optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
  });
  validateOrThrow(input, schema, 'UpdateSpecialityInput');
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateCreateSpecialityInput, ValidateUpdateSpecialityInput };
