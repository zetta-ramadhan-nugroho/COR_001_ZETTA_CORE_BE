// *************** IMPORT LIBRARY ***************
const { Joi, validateOrThrow } = require('../../../shared/validators/common.validator');

// *************** VALIDATORS ***************

/**
 * Validates input for creating a sector.
 *
 * @param {Object} input - { name, code, status }
 */
function ValidateCreateSectorInput(input) {
  const schema = Joi.object({
    name: Joi.string().required(),
    code: Joi.string().allow('', null).optional(),
  });
  validateOrThrow(input, schema, 'CreateSectorInput');
}

/**
 * Validates input for updating a sector.
 *
 * @param {Object} input - Partial sector fields
 */
function ValidateUpdateSectorInput(input) {
  const schema = Joi.object({
    name: Joi.string().optional(),
    code: Joi.string().allow('', null).optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
  });
  validateOrThrow(input, schema, 'UpdateSectorInput');
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateCreateSectorInput, ValidateUpdateSectorInput };
