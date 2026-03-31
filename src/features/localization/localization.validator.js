// *************** IMPORT LIBRARY ***************
const { Joi, validateOrThrow } = require('../../shared/validators/common.validator');

// *************** VALIDATORS ***************

/**
 * Validates input for creating a localization entry.
 *
 * @param {Object} input - { key, translations }
 */
function ValidateCreateLocalizationInput(input) {
  const schema = Joi.object({
    key: Joi.string().required(),
    translations: Joi.object().pattern(Joi.string(), Joi.string().allow('', null)).optional(),
  });
  validateOrThrow(input, schema, 'CreateLocalizationInput');
}

/**
 * Validates input for updating a localization entry.
 *
 * @param {Object} input - { translations }
 */
function ValidateUpdateLocalizationInput(input) {
  const schema = Joi.object({
    translations: Joi.object().pattern(Joi.string(), Joi.string().allow('', null)).optional(),
  });
  validateOrThrow(input, schema, 'UpdateLocalizationInput');
}

/**
 * Validates the array of items for batch save.
 *
 * @param {Array<Object>} items - Array of { key, translations }
 */
function ValidateBatchSaveLocalizationsInput(items) {
  const schema = Joi.array().items(
    Joi.object({
      key: Joi.string().required(),
      translations: Joi.object().pattern(Joi.string(), Joi.string().allow('', null)).optional(),
    })
  ).min(1).required();
  validateOrThrow(items, schema, 'BatchSaveLocalizationsInput');
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateCreateLocalizationInput, ValidateUpdateLocalizationInput, ValidateBatchSaveLocalizationsInput };
