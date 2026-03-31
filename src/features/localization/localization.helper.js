// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODEL ***************
const LocalizationModel = require('./localization.model');
const ErrorLogModel = require('../../core/error_log.model');

// *************** IMPORT UTILITIES ***************
const { AppError } = require('../../core/error');
const { buildTenantQuery } = require('../../shared/utils/tenant_guard');

// *************** QUERY ***************

/**
 * Retrieves a paginated list of localization entries scoped to the tenant.
 *
 * @param {Object} args - { page, limit }
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} { data, total, page, limit }
 */
async function GetLocalizationsHelper(args, tenant_id) {
  try {
    const { page = 1, limit = 20 } = args;
    const query = buildTenantQuery(tenant_id);
    const [data, total] = await Promise.all([
      LocalizationModel.find(query).lean().sort({ key: 1 }).skip((page - 1) * limit).limit(limit),
      LocalizationModel.countDocuments(query),
    ]);
    return { data, total, page, limit };
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/localization/localization.helper.js',
      function_name: 'GetLocalizationsHelper',
      parameter_input: JSON.stringify({ args, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_LOCALIZATIONS_FAILED', 500);
  }
}

/**
 * Retrieves a single localization entry by its unique key scoped to the tenant.
 *
 * @param {string} key - The localization key (e.g. 'student.first_name')
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object|null>} Localization document or null
 */
async function GetLocalizationByKeyHelper(key, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { key });
    return await LocalizationModel.findOne(query).lean();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/localization/localization.helper.js',
      function_name: 'GetLocalizationByKeyHelper',
      parameter_input: JSON.stringify({ key, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_LOCALIZATION_FAILED', 500);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new localization entry for the tenant.
 *
 * @param {Object} input - { key, translations }
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Created localization document
 */
async function CreateLocalizationHelper(input, tenant_id) {
  try {
    const localization = await LocalizationModel.create({ ...input, tenant_id });
    return localization.toObject();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/localization/localization.helper.js',
      function_name: 'CreateLocalizationHelper',
      parameter_input: JSON.stringify({ input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    if (error.code === 11000) {
      throw new AppError('A localization entry with this key already exists.', 'LOCALIZATION_DUPLICATE', 409);
    }
    throw new AppError(error.message, 'CREATE_LOCALIZATION_FAILED', 500);
  }
}

/**
 * Updates an existing localization entry by its key.
 *
 * @param {string} key - The localization key to update
 * @param {Object} input - Fields to update (translations, etc.)
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Updated localization document
 */
async function UpdateLocalizationHelper(key, input, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { key });
    const localization = await LocalizationModel.findOneAndUpdate(query, { $set: input }, { new: true }).lean();
    if (!localization) throw new AppError('Localization entry not found.', 'LOCALIZATION_NOT_FOUND', 404);
    return localization;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/localization/localization.helper.js',
      function_name: 'UpdateLocalizationHelper',
      parameter_input: JSON.stringify({ key, input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'UPDATE_LOCALIZATION_FAILED', 500);
  }
}

/**
 * Soft-deletes a localization entry by key.
 *
 * @param {string} key - The localization key to delete
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<boolean>}
 */
async function DeleteLocalizationHelper(key, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { key });
    const result = await LocalizationModel.findOneAndUpdate(query, { $set: { deleted_at: new Date() } }).lean();
    if (!result) throw new AppError('Localization entry not found.', 'LOCALIZATION_NOT_FOUND', 404);
    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/localization/localization.helper.js',
      function_name: 'DeleteLocalizationHelper',
      parameter_input: JSON.stringify({ key, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'DELETE_LOCALIZATION_FAILED', 500);
  }
}

/**
 * Upserts multiple localization entries in bulk for the tenant.
 * Each item is matched by key; existing entries are updated, missing ones are created.
 *
 * @param {Array<Object>} items - Array of { key, translations } objects
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<boolean>} True on success
 */
async function BatchSaveLocalizationsHelper(items, tenant_id) {
  try {
    // *************** Build bulk upsert operations keyed by tenant_id + key
    const operations = items.map((item) => ({
      updateOne: {
        filter: { tenant_id, key: item.key, deleted_at: null },
        update: { $set: { ...item, tenant_id } },
        upsert: true,
      },
    }));
    await LocalizationModel.bulkWrite(operations, { ordered: false });
    return true;
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/localization/localization.helper.js',
      function_name: 'BatchSaveLocalizationsHelper',
      parameter_input: JSON.stringify({ items_count: items.length, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'BATCH_SAVE_LOCALIZATIONS_FAILED', 500);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  GetLocalizationsHelper,
  GetLocalizationByKeyHelper,
  CreateLocalizationHelper,
  UpdateLocalizationHelper,
  DeleteLocalizationHelper,
  BatchSaveLocalizationsHelper,
};
