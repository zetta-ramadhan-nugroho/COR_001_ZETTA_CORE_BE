// *************** IMPORT LIBRARY ***************
const { Joi, validateOrThrow } = require('../../../shared/validators/common.validator');

// *************** VALIDATORS ***************

/**
 * Validates input for creating a payment modality.
 *
 * @param {Object} input - { name, payment_methods, installments, modality_fee, currency }
 */
function ValidateCreatePaymentModalityInput(input) {
  const schema = Joi.object({
    name: Joi.string().required(),
    payment_methods: Joi.array().items(Joi.string()).optional(),
    installments: Joi.array().items(
      Joi.object({
        percentage: Joi.number().min(0).max(100).required(),
        due_days: Joi.number().integer().min(0).required(),
      })
    ).optional(),
    modality_fee: Joi.number().min(0).allow(null).optional(),
    currency: Joi.string().allow('', null).optional(),
  });
  validateOrThrow(input, schema, 'CreatePaymentModalityInput');
}

/**
 * Validates input for updating a payment modality.
 *
 * @param {Object} input - Partial payment modality fields
 */
function ValidateUpdatePaymentModalityInput(input) {
  const schema = Joi.object({
    name: Joi.string().optional(),
    payment_methods: Joi.array().items(Joi.string()).optional(),
    installments: Joi.array().items(
      Joi.object({
        percentage: Joi.number().min(0).max(100).required(),
        due_days: Joi.number().integer().min(0).required(),
      })
    ).optional(),
    modality_fee: Joi.number().min(0).allow(null).optional(),
    currency: Joi.string().allow('', null).optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
  });
  validateOrThrow(input, schema, 'UpdatePaymentModalityInput');
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateCreatePaymentModalityInput, ValidateUpdatePaymentModalityInput };
