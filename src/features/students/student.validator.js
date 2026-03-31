// *************** IMPORT LIBRARY ***************
const { Joi, validateOrThrow, emailSchema } = require('../../shared/validators/common.validator');

// *************** ADDRESS SCHEMA ***************
const addressSchema = Joi.object({
  address: Joi.string().allow('', null).optional(),
  country: Joi.string().allow('', null).optional(),
  zip_code: Joi.string().allow('', null).optional(),
  city: Joi.string().allow('', null).optional(),
  department: Joi.string().allow('', null).optional(),
  region: Joi.string().allow('', null).optional(),
}).optional();

// *************** VALIDATORS ***************

/**
 * Validates input for creating a student.
 *
 * @param {Object} input - CreateStudentInput
 */
function ValidateCreateStudentInput(input) {
  const schema = Joi.object({
    civility: Joi.string().valid('MR', 'MRS').allow(null).optional(),
    last_name: Joi.string().required(),
    first_name: Joi.string().required(),
    email: emailSchema.required(),
    date_of_birth: Joi.string().isoDate().allow(null, '').optional(),
    place_of_birth: Joi.string().allow('', null).optional(),
    nationality: Joi.string().allow('', null).optional(),
    phone_number: Joi.string().allow('', null).optional(),
    phone_country_code: Joi.string().allow('', null).optional(),
    iban: Joi.string().allow('', null).optional(),
    bic: Joi.string().allow('', null).optional(),
    account_holder_name: Joi.string().allow('', null).optional(),
    address: addressSchema,
  });
  validateOrThrow(input, schema, 'CreateStudentInput');
}

/**
 * Validates input for updating a student.
 *
 * @param {Object} input - UpdateStudentInput
 */
function ValidateUpdateStudentInput(input) {
  const schema = Joi.object({
    civility: Joi.string().valid('MR', 'MRS').allow(null).optional(),
    last_name: Joi.string().optional(),
    first_name: Joi.string().optional(),
    date_of_birth: Joi.string().isoDate().allow(null, '').optional(),
    place_of_birth: Joi.string().allow('', null).optional(),
    nationality: Joi.string().allow('', null).optional(),
    phone_number: Joi.string().allow('', null).optional(),
    phone_country_code: Joi.string().allow('', null).optional(),
    iban: Joi.string().allow('', null).optional(),
    bic: Joi.string().allow('', null).optional(),
    account_holder_name: Joi.string().allow('', null).optional(),
    address: addressSchema,
    photo_s3_key: Joi.string().allow('', null).optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
  });
  validateOrThrow(input, schema, 'UpdateStudentInput');
}

/**
 * Validates a single student row for import.
 *
 * @param {Object} row - ImportStudentInput
 */
function ValidateImportStudentRow(row) {
  const schema = Joi.object({
    civility: Joi.string().valid('MR', 'MRS').allow(null, '').optional(),
    last_name: Joi.string().required(),
    first_name: Joi.string().required(),
    email: emailSchema.required(),
    date_of_birth: Joi.string().isoDate().allow(null, '').optional(),
    phone_number: Joi.string().allow('', null).optional(),
    phone_country_code: Joi.string().allow('', null).optional(),
  });
  validateOrThrow(row, schema, 'ImportStudentRow');
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateCreateStudentInput,
  ValidateUpdateStudentInput,
  ValidateImportStudentRow,
};
