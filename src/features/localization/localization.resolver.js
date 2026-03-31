// *************** IMPORT HELPER FUNCTION ***************
const {
  GetLocalizationsHelper,
  GetLocalizationByKeyHelper,
  CreateLocalizationHelper,
  UpdateLocalizationHelper,
  DeleteLocalizationHelper,
  BatchSaveLocalizationsHelper,
} = require('./localization.helper');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateCreateLocalizationInput,
  ValidateUpdateLocalizationInput,
  ValidateBatchSaveLocalizationsInput,
} = require('./localization.validator');

// *************** IMPORT UTILITIES ***************
const { HandleGraphQLError } = require('../../core/error');
const { CheckPermission } = require('../../shared/utils/permission_check');

// *************** QUERY ***************

/**
 * Fetches a paginated list of localization entries for the current tenant.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { page, limit }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Paginated localization list
 */
async function GetLocalizations(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'localization', 'view');
    const result = await GetLocalizationsHelper(args, context.tenant_id);
    return result;
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Fetches a single localization entry by its unique key.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { key }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object|null>} Localization document
 */
async function GetLocalizationByKey(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'localization', 'view');
    return await GetLocalizationByKeyHelper(args.key, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new localization entry.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { input }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object>} Created localization entry
 */
async function CreateLocalization(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'localization', 'edit');
    ValidateCreateLocalizationInput(args.input);
    return await CreateLocalizationHelper(args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Updates an existing localization entry by its key.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { key, input }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<Object>} Updated localization entry
 */
async function UpdateLocalization(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'localization', 'edit');
    ValidateUpdateLocalizationInput(args.input);
    return await UpdateLocalizationHelper(args.key, args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Soft-deletes a localization entry by its key.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { key }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<boolean>}
 */
async function DeleteLocalization(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'localization', 'edit');
    return await DeleteLocalizationHelper(args.key, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Upserts multiple localization entries in a single batch operation.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { items }
 * @param {Object} context - { tenant_id, role, permissions }
 * @returns {Promise<boolean>} True on success
 */
async function BatchSaveLocalizations(_, args, context) {
  try {
    CheckPermission(context.role, context.permissions, 'localization', 'edit');
    ValidateBatchSaveLocalizationsInput(args.items);
    return await BatchSaveLocalizationsHelper(args.items, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: { getLocalization: GetLocalizationByKey, getLocalizations: GetLocalizations },
  Mutation: {
    createLocalization: CreateLocalization,
    updateLocalization: UpdateLocalization,
    deleteLocalization: DeleteLocalization,
    batchSaveLocalizations: BatchSaveLocalizations,
  },
};
