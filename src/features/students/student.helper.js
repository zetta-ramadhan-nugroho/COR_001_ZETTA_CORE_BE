// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODEL ***************
const StudentModel = require('./student.model');
const ErrorLogModel = require('../../core/error_log.model');

// *************** IMPORT UTILITIES ***************
const { AppError } = require('../../core/error');
const { buildTenantQuery } = require('../../shared/utils/tenant_guard');

// *************** CONSTANTS ***************
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

// *************** INTERNAL HELPERS ***************

/**
 * Generates the next sequential student number for a tenant.
 * Format: A + 6 zero-padded digits (e.g. A000001).
 * Scoped per tenant — each tenant has its own sequence.
 *
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<string>} Next student number
 */
async function generateNextStudentNumber(tenant_id) {
  const latest = await StudentModel.findOne({
    tenant_id,
    student_number: { $exists: true, $ne: null },
  })
    .sort({ student_number: -1 })
    .select('student_number')
    .lean();

  if (!latest || !latest.student_number) {
    return 'A000001';
  }
  const current = parseInt(latest.student_number.substring(1), 10);
  return `A${String(current + 1).padStart(6, '0')}`;
}

/**
 * Builds a MongoDB query filter for students based on optional filters.
 *
 * @param {string} tenant_id
 * @param {Object} filters - { status, search }
 * @returns {Object} MongoDB query filter
 */
function buildStudentQuery(tenant_id, filters = {}) {
  const base = buildTenantQuery(tenant_id);
  if (filters.status) base.status = filters.status;
  if (filters.search) {
    const regex = new RegExp(filters.search, 'i');
    base.$or = [
      { first_name: regex },
      { last_name: regex },
      { email: regex },
      { student_number: regex },
    ];
  }
  return base;
}

// *************** QUERY ***************

/**
 * Retrieves a paginated list of students scoped to the tenant.
 *
 * @param {Object} args - { filters, page, limit }
 * @param {string} tenant_id - Tenant scope from context
 * @returns {Promise<Object>} { data, total, page, limit }
 */
async function GetStudentsHelper(args, tenant_id) {
  try {
    const { filters = {}, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = args;
    const query = buildStudentQuery(tenant_id, filters);
    const [data, total] = await Promise.all([
      StudentModel.find(query)
        .lean()
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      StudentModel.countDocuments(query),
    ]);
    return { data, total, page, limit };
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/students/student.helper.js',
      function_name: 'GetStudentsHelper',
      parameter_input: JSON.stringify({ args, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_STUDENTS_FAILED', 500);
  }
}

/**
 * Retrieves a single student by ID scoped to the tenant.
 *
 * @param {string} id - Student document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object|null>} Student document or null
 */
async function GetStudentByIdHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    return await StudentModel.findOne(query).lean();
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/students/student.helper.js',
      function_name: 'GetStudentByIdHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'GET_STUDENT_FAILED', 500);
  }
}

/**
 * Checks if an email is already used by another student in the tenant.
 *
 * @param {string} email - Email address to check
 * @param {string} tenant_id - Tenant scope
 * @param {string|null} [exclude_id=null] - Student ID to exclude from the check (for updates)
 * @returns {Promise<boolean>} True if the email is already taken
 */
async function CheckStudentEmailHelper(email, tenant_id, exclude_id = null) {
  try {
    const query = buildTenantQuery(tenant_id, { email: email.toLowerCase().trim() });
    if (exclude_id) {
      query._id = { $ne: new mongoose.Types.ObjectId(exclude_id) };
    }
    const existing = await StudentModel.findOne(query).select('_id').lean();
    return !!existing;
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/students/student.helper.js',
      function_name: 'CheckStudentEmailHelper',
      parameter_input: JSON.stringify({ email, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'CHECK_EMAIL_FAILED', 500);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new student record for the tenant.
 * Auto-generates an immutable student_number.
 *
 * @param {Object} input - CreateStudentInput
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Created student document
 */
async function CreateStudentHelper(input, tenant_id) {
  try {
    // *************** Pre-check for duplicate email within this tenant
    const emailTaken = await CheckStudentEmailHelper(input.email, tenant_id);
    if (emailTaken) {
      throw new AppError(
        'A student with this email address already exists.',
        'STUDENT_EMAIL_DUPLICATE',
        409
      );
    }

    // *************** Student number is auto-generated and immutable
    const student_number = await generateNextStudentNumber(tenant_id);

    const student = await StudentModel.create({
      ...input,
      email: input.email.toLowerCase().trim(),
      student_number,
      tenant_id,
    });

    return student.toObject();
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error.code === 11000) {
      throw new AppError(
        'A student with this email already exists.',
        'STUDENT_EMAIL_DUPLICATE',
        409
      );
    }
    await ErrorLogModel.create({
      path: 'features/students/student.helper.js',
      function_name: 'CreateStudentHelper',
      parameter_input: JSON.stringify({ input: { ...input, email: input.email }, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'CREATE_STUDENT_FAILED', 500);
  }
}

/**
 * Updates an existing student record.
 * student_number and email are not directly editable after creation.
 *
 * @param {string} id - Student document ID
 * @param {Object} input - UpdateStudentInput
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Updated student document
 */
async function UpdateStudentHelper(id, input, tenant_id) {
  try {
    // *************** student_number is permanently immutable — strip it if present
    const { student_number: _ignored, ...safeInput } = input;

    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const student = await StudentModel.findOneAndUpdate(
      query,
      { $set: safeInput },
      { new: true }
    ).lean();

    if (!student) throw new AppError('Student not found.', 'STUDENT_NOT_FOUND', 404);
    return student;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/students/student.helper.js',
      function_name: 'UpdateStudentHelper',
      parameter_input: JSON.stringify({ id, input, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'UPDATE_STUDENT_FAILED', 500);
  }
}

/**
 * Deactivates a student by setting status to 'inactive'.
 *
 * @param {string} id - Student document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Updated student document
 */
async function DeactivateStudentHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const student = await StudentModel.findOneAndUpdate(
      query,
      { $set: { status: 'inactive' } },
      { new: true }
    ).lean();
    if (!student) throw new AppError('Student not found.', 'STUDENT_NOT_FOUND', 404);
    return student;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/students/student.helper.js',
      function_name: 'DeactivateStudentHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'DEACTIVATE_STUDENT_FAILED', 500);
  }
}

/**
 * Reactivates a previously deactivated student.
 *
 * @param {string} id - Student document ID
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} Updated student document
 */
async function ReactivateStudentHelper(id, tenant_id) {
  try {
    const query = buildTenantQuery(tenant_id, { _id: new mongoose.Types.ObjectId(id) });
    const student = await StudentModel.findOneAndUpdate(
      query,
      { $set: { status: 'active' } },
      { new: true }
    ).lean();
    if (!student) throw new AppError('Student not found.', 'STUDENT_NOT_FOUND', 404);
    return student;
  } catch (error) {
    if (error instanceof AppError) throw error;
    await ErrorLogModel.create({
      path: 'features/students/student.helper.js',
      function_name: 'ReactivateStudentHelper',
      parameter_input: JSON.stringify({ id, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'REACTIVATE_STUDENT_FAILED', 500);
  }
}

/**
 * Imports multiple students in batch with per-row validation and duplicate detection.
 * Partial success is supported — failed rows are reported without aborting the import.
 *
 * @param {Array<Object>} students - Array of student input objects
 * @param {string} tenant_id - Tenant scope
 * @returns {Promise<Object>} { imported, failed, errors }
 */
async function ImportStudentsHelper(students, tenant_id) {
  try {
    // *************** START: Bulk student import with partial success support ***************
    const errors = [];
    let imported = 0;

    // *************** Pre-fetch all existing emails in this tenant to avoid per-row DB calls
    const incomingEmails = students.map((s) => s.email?.toLowerCase()?.trim()).filter(Boolean);
    const existingStudents = await StudentModel.find({
      tenant_id,
      deleted_at: null,
      email: { $in: incomingEmails },
    })
      .select('email')
      .lean();

    const existingEmailSet = new Set(existingStudents.map((s) => s.email));

    // *************** Track emails seen in this batch to catch intra-batch duplicates
    const batchEmailSet = new Set();

    for (let i = 0; i < students.length; i++) {
      const row = students[i];
      const email = row.email?.toLowerCase()?.trim();

      if (!email) {
        errors.push({ row: i + 1, email: null, reason: 'Email is required.' });
        continue;
      }

      if (existingEmailSet.has(email)) {
        errors.push({ row: i + 1, email, reason: 'Email already exists in this tenant.' });
        continue;
      }

      if (batchEmailSet.has(email)) {
        errors.push({ row: i + 1, email, reason: 'Duplicate email in the same import batch.' });
        continue;
      }

      if (!row.first_name || !row.last_name) {
        errors.push({ row: i + 1, email, reason: 'First name and last name are required.' });
        continue;
      }

      try {
        const student_number = await generateNextStudentNumber(tenant_id);
        await StudentModel.create({ ...row, email, student_number, tenant_id });
        batchEmailSet.add(email);
        existingEmailSet.add(email); // *************** Prevent duplicates for subsequent rows
        imported++;
      } catch (rowError) {
        errors.push({ row: i + 1, email, reason: rowError.message });
      }
    }

    return { imported, failed: errors.length, errors };
    // *************** END: Bulk student import with partial success support ***************
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/students/student.helper.js',
      function_name: 'ImportStudentsHelper',
      parameter_input: JSON.stringify({ count: students.length, tenant_id }),
      error: String(error.stack),
      tenant_id,
    });
    throw new AppError(error.message, 'IMPORT_STUDENTS_FAILED', 500);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  GetStudentsHelper,
  GetStudentByIdHelper,
  CheckStudentEmailHelper,
  CreateStudentHelper,
  UpdateStudentHelper,
  DeactivateStudentHelper,
  ReactivateStudentHelper,
  ImportStudentsHelper,
};
