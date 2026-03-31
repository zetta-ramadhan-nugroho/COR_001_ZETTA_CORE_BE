// *************** IMPORT LIBRARY ***************
const { Joi, validateOrThrow } = require('../../../shared/validators/common.validator');

// *************** VALIDATORS ***************

/**
 * Validates input for creating a period.
 *
 * @param {Object} input - { name, start_date, end_date, status }
 */
function ValidateCreatePeriodInput(input) {
  const schema = Joi.object({
    name: Joi.string().required(),
    start_date: Joi.date().iso().allow(null).optional(),
    end_date: Joi.date().iso().allow(null).optional(),
  });
  validateOrThrow(input, schema, 'CreatePeriodInput');
}

/**
 * Validates input for updating a period.
 *
 * @param {Object} input - Partial period fields
 */
function ValidateUpdatePeriodInput(input) {
  const schema = Joi.object({
    name: Joi.string().optional(),
    start_date: Joi.date().iso().allow(null).optional(),
    end_date: Joi.date().iso().allow(null).optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
  });
  validateOrThrow(input, schema, 'UpdatePeriodInput');
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateCreatePeriodInput, ValidateUpdatePeriodInput };
