// *************** IMPORT HELPER FUNCTION ***************
const { GetSchoolsHelper, GetSchoolByIdHelper, CreateSchoolHelper, UpdateSchoolHelper, DeleteSchoolHelper } = require('./school.helper');

// *************** IMPORT VALIDATOR ***************
const { ValidateCreateSchoolInput, ValidateUpdateSchoolInput } = require('./school.validator');

// *************** IMPORT UTILITIES ***************
const { HandleGraphQLError } = require('../../../core/error');
const { CheckPermission } = require('../../../shared/utils/permission_check');

// *************** QUERY ***************

/**
 * Fetches a paginated list of schools for the current tenant.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { page, limit }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Paginated school list
 */
async function GetSchools(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'view');
    return await GetSchoolsHelper(args, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Fetches a single school by ID.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object|null>} School document
 */
async function GetSchool(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'view');
    return await GetSchoolByIdHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new school.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { input: CreateSchoolInput }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object>} Created school document
 */
async function CreateSchool(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'edit');
    ValidateCreateSchoolInput(args.input);
    return await CreateSchoolHelper(args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Updates an existing school.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id, input: UpdateSchoolInput }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object>} Updated school document
 */
async function UpdateSchool(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'edit');
    ValidateUpdateSchoolInput(args.input);
    return await UpdateSchoolHelper(args.id, args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Soft-deletes a school.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<boolean>}
 */
async function DeleteSchool(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'foundational_data', 'edit');
    return await DeleteSchoolHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: { getSchool: GetSchool, getSchools: GetSchools },
  Mutation: { createSchool: CreateSchool, updateSchool: UpdateSchool, deleteSchool: DeleteSchool },
};
