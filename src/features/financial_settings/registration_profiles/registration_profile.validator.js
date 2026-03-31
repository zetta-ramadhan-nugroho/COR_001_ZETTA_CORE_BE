// *************** IMPORT LIBRARY ***************
const { Joi, validateOrThrow } = require('../../../shared/validators/common.validator');

// *************** VALIDATORS ***************

/**
 * Validates input for creating a registration profile.
 *
 * @param {Object} input - Registration profile fields
 */
function ValidateCreateRegistrationProfileInput(input) {
  const schema = Joi.object({
    name: Joi.string().required(),
    payment_modality_ids: Joi.array().items(Joi.string().hex().length(24)).optional(),
    additional_fee_ids: Joi.array().items(Joi.string().hex().length(24)).optional(),
    perimeters: Joi.array().items(
      Joi.object({
        campus_id: Joi.string().hex().length(24).allow(null).optional(),
        level_id: Joi.string().hex().length(24).allow(null).optional(),
        sector_id: Joi.string().hex().length(24).allow(null).optional(),
        speciality_id: Joi.string().hex().length(24).allow(null).optional(),
      })
    ).optional(),
    payment_methods: Joi.array().items(Joi.string()).optional(),
    full_rate_rule: Joi.object({
      amount: Joi.number().min(0).optional(),
      currency: Joi.string().allow('', null).optional(),
    }).optional(),
    down_payment_rule: Joi.object({
      percentage: Joi.number().min(0).max(100).optional(),
      amount: Joi.number().min(0).optional(),
      currency: Joi.string().allow('', null).optional(),
    }).optional(),
    cgv_document_rule: Joi.object({
      s3_key: Joi.string().allow('', null).optional(),
      is_required: Joi.boolean().optional(),
    }).optional(),
  });
  validateOrThrow(input, schema, 'CreateRegistrationProfileInput');
}

/**
 * Validates input for updating a registration profile.
 *
 * @param {Object} input - Partial registration profile fields
 */
function ValidateUpdateRegistrationProfileInput(input) {
  const schema = Joi.object({
    name: Joi.string().optional(),
    payment_modality_ids: Joi.array().items(Joi.string().hex().length(24)).optional(),
    additional_fee_ids: Joi.array().items(Joi.string().hex().length(24)).optional(),
    perimeters: Joi.array().items(
      Joi.object({
        campus_id: Joi.string().hex().length(24).allow(null).optional(),
        level_id: Joi.string().hex().length(24).allow(null).optional(),
        sector_id: Joi.string().hex().length(24).allow(null).optional(),
        speciality_id: Joi.string().hex().length(24).allow(null).optional(),
      })
    ).optional(),
    payment_methods: Joi.array().items(Joi.string()).optional(),
    full_rate_rule: Joi.object({
      amount: Joi.number().min(0).optional(),
      currency: Joi.string().allow('', null).optional(),
    }).optional(),
    down_payment_rule: Joi.object({
      percentage: Joi.number().min(0).max(100).optional(),
      amount: Joi.number().min(0).optional(),
      currency: Joi.string().allow('', null).optional(),
    }).optional(),
    cgv_document_rule: Joi.object({
      s3_key: Joi.string().allow('', null).optional(),
      is_required: Joi.boolean().optional(),
    }).optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
  });
  validateOrThrow(input, schema, 'UpdateRegistrationProfileInput');
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateCreateRegistrationProfileInput, ValidateUpdateRegistrationProfileInput };
