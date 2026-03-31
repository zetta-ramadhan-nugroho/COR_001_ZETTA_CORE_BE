// *************** IMPORT LIBRARY ***************
const { Joi, validateOrThrow } = require('../../../shared/validators/common.validator');

// *************** VALIDATORS ***************

/**
 * Validates input for creating an RNCP title.
 *
 * @param {Object} input - { name, code, eqf_level, registration_date, expiry_date, official_url }
 */
function ValidateCreateRncpTitleInput(input) {
  const schema = Joi.object({
    name: Joi.string().required(),
    code: Joi.string().allow('', null).optional(),
    eqf_level: Joi.number().integer().min(1).max(8).allow(null).optional(),
    registration_date: Joi.date().iso().allow(null).optional(),
    expiry_date: Joi.date().iso().allow(null).optional(),
    official_url: Joi.string().uri().allow('', null).optional(),
  });
  validateOrThrow(input, schema, 'CreateRncpTitleInput');
}

/**
 * Validates input for updating an RNCP title.
 *
 * @param {Object} input - Partial RNCP title fields
 */
function ValidateUpdateRncpTitleInput(input) {
  const schema = Joi.object({
    name: Joi.string().optional(),
    code: Joi.string().allow('', null).optional(),
    eqf_level: Joi.number().integer().min(1).max(8).allow(null).optional(),
    registration_date: Joi.date().iso().allow(null).optional(),
    expiry_date: Joi.date().iso().allow(null).optional(),
    official_url: Joi.string().uri().allow('', null).optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
  });
  validateOrThrow(input, schema, 'UpdateRncpTitleInput');
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateCreateRncpTitleInput, ValidateUpdateRncpTitleInput };
