// *************** IMPORT LIBRARY ***************
const { Joi, validateOrThrow } = require('../../../shared/validators/common.validator');

// *************** VALIDATORS ***************

/**
 * Validates input for creating a formation type.
 *
 * @param {Object} input - { name, code, status }
 */
function ValidateCreateFormationTypeInput(input) {
  const schema = Joi.object({
    name: Joi.string().required(),
    code: Joi.string().allow('', null).optional(),
  });
  validateOrThrow(input, schema, 'CreateFormationTypeInput');
}

/**
 * Validates input for updating a formation type.
 *
 * @param {Object} input - Partial formation type fields
 */
function ValidateUpdateFormationTypeInput(input) {
  const schema = Joi.object({
    name: Joi.string().optional(),
    code: Joi.string().allow('', null).optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
  });
  validateOrThrow(input, schema, 'UpdateFormationTypeInput');
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateCreateFormationTypeInput, ValidateUpdateFormationTypeInput };
