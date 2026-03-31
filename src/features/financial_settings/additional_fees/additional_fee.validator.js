// *************** IMPORT LIBRARY ***************
const { Joi, validateOrThrow } = require('../../../shared/validators/common.validator');

// *************** VALIDATORS ***************

/**
 * Validates input for creating an additional fee.
 *
 * @param {Object} input - { name, amount, currency, description }
 */
function ValidateCreateAdditionalFeeInput(input) {
  const schema = Joi.object({
    name: Joi.string().required(),
    amount: Joi.number().min(0).required(),
    currency: Joi.string().allow('', null).optional(),
    description: Joi.string().allow('', null).optional(),
  });
  validateOrThrow(input, schema, 'CreateAdditionalFeeInput');
}

/**
 * Validates input for updating an additional fee.
 *
 * @param {Object} input - Partial additional fee fields
 */
function ValidateUpdateAdditionalFeeInput(input) {
  const schema = Joi.object({
    name: Joi.string().optional(),
    amount: Joi.number().min(0).optional(),
    currency: Joi.string().allow('', null).optional(),
    description: Joi.string().allow('', null).optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
  });
  validateOrThrow(input, schema, 'UpdateAdditionalFeeInput');
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateCreateAdditionalFeeInput, ValidateUpdateAdditionalFeeInput };
