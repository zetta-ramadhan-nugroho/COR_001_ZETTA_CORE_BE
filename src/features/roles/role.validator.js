// *************** IMPORT LIBRARY ***************
const { Joi, validateOrThrow } = require('../../shared/validators/common.validator');

// *************** VALIDATORS ***************

/**
 * Validates input for creating a role.
 *
 * @param {Object} input - CreateRoleInput
 */
function ValidateCreateRoleInput(input) {
  const schema = Joi.object({
    name: Joi.string().required(),
    slug: Joi.string().lowercase().replace(/\s+/g, '_').required(),
    description: Joi.string().allow('', null).optional(),
  });
  validateOrThrow(input, schema, 'CreateRoleInput');
}

/**
 * Validates input for updating a role's display fields.
 *
 * @param {Object} input - UpdateRoleInput
 */
function ValidateUpdateRoleInput(input) {
  const schema = Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().allow('', null).optional(),
  });
  validateOrThrow(input, schema, 'UpdateRoleInput');
}

/**
 * Validates the permissions map for a role update.
 * Each key is a module name, value is an array of actions ('view', 'edit').
 *
 * @param {Object} input - { permissions: { [module]: string[] } }
 */
function ValidateUpdateRolePermissionsInput(input) {
  const schema = Joi.object({
    permissions: Joi.object()
      .pattern(
        Joi.string(),
        Joi.array().items(Joi.string().valid('view', 'edit'))
      )
      .required(),
  });
  validateOrThrow(input, schema, 'UpdateRolePermissionsInput');
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateCreateRoleInput,
  ValidateUpdateRoleInput,
  ValidateUpdateRolePermissionsInput,
};
