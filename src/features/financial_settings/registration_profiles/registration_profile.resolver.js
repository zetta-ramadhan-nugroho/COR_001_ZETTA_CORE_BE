// *************** IMPORT HELPER FUNCTION ***************
const { GetRegistrationProfilesHelper, GetRegistrationProfileByIdHelper, CreateRegistrationProfileHelper, UpdateRegistrationProfileHelper, DeleteRegistrationProfileHelper } = require('./registration_profile.helper');

// *************** IMPORT VALIDATOR ***************
const { ValidateCreateRegistrationProfileInput, ValidateUpdateRegistrationProfileInput } = require('./registration_profile.validator');

// *************** IMPORT UTILITIES ***************
const { HandleGraphQLError } = require('../../../core/error');
const { CheckPermission } = require('../../../shared/utils/permission_check');

// *************** QUERY ***************

/**
 * Fetches a paginated list of registration profiles for the current tenant.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { page, limit }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Paginated registration profile list
 */
async function GetRegistrationProfiles(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'financial_settings', 'view');
    const result = await GetRegistrationProfilesHelper(args, context.tenant_id);
    return result;
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Fetches a single registration profile by ID.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object|null>} Registration profile document
 */
async function GetRegistrationProfile(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'financial_settings', 'view');
    return await GetRegistrationProfileByIdHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new registration profile.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { input }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object>} Created registration profile
 */
async function CreateRegistrationProfile(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'financial_settings', 'edit');
    ValidateCreateRegistrationProfileInput(args.input);
    return await CreateRegistrationProfileHelper(args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Updates an existing registration profile.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id, input }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object>} Updated registration profile
 */
async function UpdateRegistrationProfile(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'financial_settings', 'edit');
    ValidateUpdateRegistrationProfileInput(args.input);
    return await UpdateRegistrationProfileHelper(args.id, args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Soft-deletes a registration profile.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<boolean>}
 */
async function DeleteRegistrationProfile(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'financial_settings', 'edit');
    return await DeleteRegistrationProfileHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: { getRegistrationProfile: GetRegistrationProfile, getRegistrationProfiles: GetRegistrationProfiles },
  Mutation: { createRegistrationProfile: CreateRegistrationProfile, updateRegistrationProfile: UpdateRegistrationProfile, deleteRegistrationProfile: DeleteRegistrationProfile },
};
