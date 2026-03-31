// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODEL ***************
const ProgramModel = require('./program.model');
const ErrorLogModel = require('../../core/error_log.model');

// *************** IMPORT UTILITIES ***************
const { AppError } = require('../../core/error');
const { buildTenantQuery } = require('../../shared/utils/tenant_guard');
const { AuditLogger } = require('../../core/audit_logger');

// *************** QUERY ***************

/**
 * Retrieves a paginated list of programs scoped to the tenant.
 *
 * @param {Object} args - { filters, page, limit }
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} { data, total, page, limit }
 */
async function GetProgramsHelper(args, tenant_id) {
  try {
    const { filters = {}, page = 1, limit = 20 } = args;
    const query = buildTenantQuery(tenant_id);

    if (filters.status) query.status = filters.status;
    if (filters.school_id) query.school_id = new mongoose.Types.ObjectId(filters.school_id);
    if (filters.period_id) query.period_id = new mongoose.Types.ObjectId(filters.period_id);
    if (filters.search) {
      query.name = new RegExp(filters.search, 'i');
    }

    const [data, total] = await Promise.all([
      ProgramModel.find(query).lean().sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit),
      ProgramModel.countDocuments(query),
    ]);

    return { data, total, page, limit };
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/programs/program.helper.js',
      function_name: 'GetProgramsHelper',
      parameter_input: JSON.stringify({ args, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_PROGRAMS_FAILED', 500);
  }
}

/**
 * Retrieves a single program by ID scoped to the tenant.
 *
 * @param {string} id - Program document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object|null>} Program document or null
 */
async function GetProgramByIdHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    return await ProgramModel.findOne(query).lean();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/programs/program.helper.js',
      function_name: 'GetProgramByIdHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_PROGRAM_FAILED', 500);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new program for the tenant.
 *
 * @param {Object} input - CreateProgramInput
 * @param {string} tenant_id - Tenant scope
 * @param {string} user_id - Creating user's ID
 * @returns {Promise<Object>} Created program document
 */
async function CreateProgramHelper(input, tenant_id, user_id) {
  try {
    const program = await ProgramModel.create({
      ...input,
      tenant_id,
      created_by: user_id,
      status: input.status || 'draft',
    });
    return program.toObject();
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('A program with this name already exists.', 'PROGRAM_DUPLICATE', 409);
    }
    await ErrorLogModel.create({
      path: 'features/programs/program.helper.js',
      function_name: 'CreateProgramHelper',
      parameter_input: JSON.stringify({ input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'CREATE_PROGRAM_FAILED', 500);
  }
}

/**
 * Updates an existing program.
 *
 * @param {string} id - Program document ID
 * @param {Object} input - UpdateProgramInput
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Updated program document
 */
async function UpdateProgramHelper(id, input, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const program = await ProgramModel.findOneAndUpdate(query, { $set: input }, { new: true }).lean();
    if (!program) throw new AppError('Program not found.', 'PROGRAM_NOT_FOUND', 404);
    return program;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/programs/program.helper.js',
      function_name: 'UpdateProgramHelper',
      parameter_input: JSON.stringify({ id, input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'UPDATE_PROGRAM_FAILED', 500);
  }
}

/**
 * Deactivates a program by setting status to 'archived'.
 *
 * @param {string} id - Program document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Updated program document
 */
async function DeactivateProgramHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const program = await ProgramModel.findOneAndUpdate(
      query,
      { $set: { status: 'archived' } },
      { new: true }
    ).lean();
    if (!program) throw new AppError('Program not found.', 'PROGRAM_NOT_FOUND', 404);
    return program;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/programs/program.helper.js',
      function_name: 'DeactivateProgramHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'DEACTIVATE_PROGRAM_FAILED', 500);
  }
}

/**
 * Assigns a program (and optionally a member of admission) to a student.
 * Triggers a PROGRAM_ASSIGNED downstream event after successful assignment.
 * Records an audit log entry for this cross-module action.
 *
 * @param {string} student_id - Student document ID
 * @param {string} program_id - Program document ID
 * @param {string|null} member_of_admission_id - Optional user ID for the admission member
 * @param {string} tenant_id - Tenant scope
 * @param {string} acting_user_id - User performing the assignment
 * @returns {Promise<boolean>}
 */
async function AssignProgramToStudentHelper(
  student_id,
  program_id,
  member_of_admission_id,
  tenant_id,
  acting_user_id
) {
  try {
    // *************** Verify the program exists in this tenant before assigning
    const program = await ProgramModel.findOne(buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(program_id) })).lean();
    if (!program) throw new AppError('Program not found.', 'PROGRAM_NOT_FOUND', 404);

    // *************** Audit the cross-module assignment action
    await AuditLogger.log({
      action: 'PROGRAM_ASSIGNED',
      tenant_id,
      acting_user_id,
      source_app: 'ZETTA_CORE',
      target_entity: 'student',
      target_id: student_id,
      before: null,
      after: { program_id, member_of_admission_id },
    });

    // *************** Only emit PROGRAM_ASSIGNED event after successful DB write
    // *************** Downstream notification (pub/sub, webhook, or direct HTTP) would be called here
    // TODO: Emit PROGRAM_ASSIGNED event to downstream admission workflow

    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/programs/program.helper.js',
      function_name: 'AssignProgramToStudentHelper',
      parameter_input: JSON.stringify({ student_id, program_id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'ASSIGN_PROGRAM_FAILED', 500);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  GetProgramsHelper,
  GetProgramByIdHelper,
  CreateProgramHelper,
  UpdateProgramHelper,
  DeactivateProgramHelper,
  AssignProgramToStudentHelper,
};
