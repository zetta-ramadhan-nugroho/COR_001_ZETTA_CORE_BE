// *************** IMPORT LIBRARY ***************
const { Joi, validateOrThrow } = require('../../../shared/validators/common.validator');

// *************** VALIDATORS ***************

/**
 * Validates input for creating a legal entity.
 *
 * @param {Object} input - { name, siret, registration_number, iban, bic, account_holder_name, address }
 */
function ValidateCreateLegalEntityInput(input) {
  const schema = Joi.object({
    name: Joi.string().required(),
    siret: Joi.string().allow('', null).optional(),
    registration_number: Joi.string().allow('', null).optional(),
    iban: Joi.string().allow('', null).optional(),
    bic: Joi.string().allow('', null).optional(),
    account_holder_name: Joi.string().allow('', null).optional(),
    address: Joi.object({
      street: Joi.string().allow('', null).optional(),
      zip_code: Joi.string().allow('', null).optional(),
      city: Joi.string().allow('', null).optional(),
      country: Joi.string().allow('', null).optional(),
    }).optional(),
  });
  validateOrThrow(input, schema, 'CreateLegalEntityInput');
}

/**
 * Validates input for updating a legal entity.
 *
 * @param {Object} input - Partial legal entity fields
 */
function ValidateUpdateLegalEntityInput(input) {
  const schema = Joi.object({
    name: Joi.string().optional(),
    siret: Joi.string().allow('', null).optional(),
    registration_number: Joi.string().allow('', null).optional(),
    iban: Joi.string().allow('', null).optional(),
    bic: Joi.string().allow('', null).optional(),
    account_holder_name: Joi.string().allow('', null).optional(),
    address: Joi.object({
      street: Joi.string().allow('', null).optional(),
      zip_code: Joi.string().allow('', null).optional(),
      city: Joi.string().allow('', null).optional(),
      country: Joi.string().allow('', null).optional(),
    }).optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
  });
  validateOrThrow(input, schema, 'UpdateLegalEntityInput');
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateCreateLegalEntityInput, ValidateUpdateLegalEntityInput };
