// *************** IMPORT LIBRARY ***************
const { Joi, validateOrThrow } = require('../../../shared/validators/common.validator');

// *************** VALIDATORS ***************

/**
 * Validates input for creating a level.
 *
 * @param {Object} input - { name, rank, status }
 */
function ValidateCreateLevelInput(input) {
  const schema = Joi.object({
    name: Joi.string().required(),
    rank: Joi.number().integer().min(0).allow(null).optional(),
  });
  validateOrThrow(input, schema, 'CreateLevelInput');
}

/**
 * Validates input for updating a level.
 *
 * @param {Object} input - Partial level fields
 */
function ValidateUpdateLevelInput(input) {
  const schema = Joi.object({
    name: Joi.string().optional(),
    rank: Joi.number().integer().min(0).allow(null).optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
  });
  validateOrThrow(input, schema, 'UpdateLevelInput');
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateCreateLevelInput, ValidateUpdateLevelInput };
