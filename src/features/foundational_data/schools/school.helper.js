// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODEL ***************
const SchoolModel = require('./school.model');
const ErrorLogModel = require('../../../core/error_log.model');

// *************** IMPORT UTILITIES ***************
const { AppError } = require('../../../core/error');
const { buildTenantQuery } = require('../../../shared/utils/tenant_guard');

// *************** QUERY ***************

/**
 * Retrieves a paginated list of schools scoped to the tenant.
 *
 * @param {Object} args - { page, limit }
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} { data, total, page, limit }
 */
async function GetSchoolsHelper(args, tenant_id) {
  try {
    const { page = 1, limit = 20 } = args;
    const query = buildTenantQuery(tenant_id);
    const [data, total] = await Promise.all([
      SchoolModel.find(query).lean().sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit),
      SchoolModel.countDocuments(query),
    ]);
    return { data, total, page, limit };
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/schools/school.helper.js',
      function_name: 'GetSchoolsHelper',
      parameter_input: JSON.stringify({ args, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_SCHOOLS_FAILED', 500);
  }
}

/**
 * Retrieves a single school by ID scoped to the tenant.
 *
 * @param {string} id - School document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object|null>} School document or null
 */
async function GetSchoolByIdHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    return await SchoolModel.findOne(query).lean();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/foundational_data/schools/school.helper.js',
      function_name: 'GetSchoolByIdHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_SCHOOL_FAILED', 500);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new school record for the tenant.
 *
 * @param {Object} input - School fields
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Created school document
 */
async function CreateSchoolHelper(input, tenant_id) {
  try {
    const school = await SchoolModel.create({ ...input, tenant_id });
    return school.toObject();
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('A school with this name already exists.', 'SCHOOL_DUPLICATE', 409);
    }
    await ErrorLogModel.create({
      path: 'features/foundational_data/schools/school.helper.js',
      function_name: 'CreateSchoolHelper',
      parameter_input: JSON.stringify({ input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'CREATE_SCHOOL_FAILED', 500);
  }
}

/**
 * Updates an existing school by ID.
 *
 * @param {string} id - School document ID
 * @param {Object} input - Fields to update
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Updated school document
 */
async function UpdateSchoolHelper(id, input, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const school = await SchoolModel.findOneAndUpdate(query, { $set: input }, { new: true }).lean();
    if (!school) throw new AppError('School not found.', 'SCHOOL_NOT_FOUND', 404);
    return school;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/foundational_data/schools/school.helper.js',
      function_name: 'UpdateSchoolHelper',
      parameter_input: JSON.stringify({ id, input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'UPDATE_SCHOOL_FAILED', 500);
  }
}

/**
 * Soft-deletes a school by setting deleted_at.
 *
 * @param {string} id - School document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<boolean>}
 */
async function DeleteSchoolHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const result = await SchoolModel.findOneAndUpdate(query, { $set: { deleted_at: new Date() } }).lean();
    if (!result) throw new AppError('School not found.', 'SCHOOL_NOT_FOUND', 404);
    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/foundational_data/schools/school.helper.js',
      function_name: 'DeleteSchoolHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'DELETE_SCHOOL_FAILED', 500);
  }
}

// *************** EXPORT MODULE ***************
module.exports = { GetSchoolsHelper, GetSchoolByIdHelper, CreateSchoolHelper, UpdateSchoolHelper, DeleteSchoolHelper };
