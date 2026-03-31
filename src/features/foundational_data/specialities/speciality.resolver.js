// *************** IMPORT HELPER FUNCTION ***************
const { GetSpecialitiesHelper, GetSpecialityByIdHelper, CreateSpecialityHelper, UpdateSpecialityHelper, DeleteSpecialityHelper } = require('./speciality.helper');

// *************** IMPORT VALIDATOR ***************
const { ValidateCreateSpecialityInput, ValidateUpdateSpecialityInput } = require('./speciality.validator');

// *************** IMPORT UTILITIES ***************
const { HandleGraphQLError } = require('../../../core/error');
const { CheckPermission } = require('../../../shared/utils/permission_check');

// *************** QUERY ***************

/**
 * Fetches a paginated list of specialities for the current tenant.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { page, limit }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Paginated speciality list
 */
async function GetSpecialities(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'view');
    const result = await GetSpecialitiesHelper(args, context.tenant_id);
    return result;
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Fetches a single speciality by ID.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object|null>} Speciality document
 */
async function GetSpeciality(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'view');
    return await GetSpecialityByIdHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new speciality.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { input }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object>} Created speciality
 */
async function CreateSpeciality(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'edit');
    ValidateCreateSpecialityInput(args.input);
    return await CreateSpecialityHelper(args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Updates an existing speciality.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id, input }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object>} Updated speciality
 */
async function UpdateSpeciality(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'edit');
    ValidateUpdateSpecialityInput(args.input);
    return await UpdateSpecialityHelper(args.id, args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Soft-deletes a speciality.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<boolean>}
 */
async function DeleteSpeciality(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'edit');
    return await DeleteSpecialityHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: { getSpeciality: GetSpeciality, getSpecialities: GetSpecialities },
  Mutation: { createSpeciality: CreateSpeciality, updateSpeciality: UpdateSpeciality, deleteSpeciality: DeleteSpeciality },
};
