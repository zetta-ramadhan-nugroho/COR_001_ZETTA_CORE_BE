// *************** IMPORT LIBRARY ***************
const { Joi, validateOrThrow, mongoIdSchema } = require('../../shared/validators/common.validator');

// *************** VALIDATORS ***************

/**
 * Validates input for creating a program.
 *
 * @param {Object} input - CreateProgramInput
 */
function ValidateCreateProgramInput(input) {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow('', null).optional(),
    formation_type_id: mongoIdSchema.allow(null).optional(),
    period_id: mongoIdSchema.allow(null).optional(),
    school_id: mongoIdSchema.allow(null).optional(),
    campus_id: mongoIdSchema.allow(null).optional(),
    level_id: mongoIdSchema.allow(null).optional(),
    sector_id: mongoIdSchema.allow(null).optional(),
    speciality_id: mongoIdSchema.allow(null).optional(),
    legal_entity_id: mongoIdSchema.allow(null).optional(),
    rncp_title_id: mongoIdSchema.allow(null).optional(),
    registration_profile_ids: Joi.array().items(mongoIdSchema).optional(),
    status: Joi.string().valid('draft', 'published', 'archived').optional(),
    down_payment_internal: Joi.number().min(0).allow(null).optional(),
    down_payment_external: Joi.number().min(0).allow(null).optional(),
    full_rate_internal: Joi.number().min(0).allow(null).optional(),
    full_rate_external: Joi.number().min(0).allow(null).optional(),
  });
  validateOrThrow(input, schema, 'CreateProgramInput');
}

/**
 * Validates input for updating a program.
 *
 * @param {Object} input - UpdateProgramInput
 */
function ValidateUpdateProgramInput(input) {
  const schema = Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().allow('', null).optional(),
    formation_type_id: mongoIdSchema.allow(null).optional(),
    period_id: mongoIdSchema.allow(null).optional(),
    school_id: mongoIdSchema.allow(null).optional(),
    campus_id: mongoIdSchema.allow(null).optional(),
    level_id: mongoIdSchema.allow(null).optional(),
    sector_id: mongoIdSchema.allow(null).optional(),
    speciality_id: mongoIdSchema.allow(null).optional(),
    legal_entity_id: mongoIdSchema.allow(null).optional(),
    rncp_title_id: mongoIdSchema.allow(null).optional(),
    registration_profile_ids: Joi.array().items(mongoIdSchema).optional(),
    status: Joi.string().valid('draft', 'published', 'archived').optional(),
    cgv_s3_key: Joi.string().allow('', null).optional(),
    down_payment_internal: Joi.number().min(0).allow(null).optional(),
    down_payment_external: Joi.number().min(0).allow(null).optional(),
    full_rate_internal: Joi.number().min(0).allow(null).optional(),
    full_rate_external: Joi.number().min(0).allow(null).optional(),
  });
  validateOrThrow(input, schema, 'UpdateProgramInput');
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateCreateProgramInput, ValidateUpdateProgramInput };
