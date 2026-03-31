// *************** IMPORT HELPER FUNCTION ***************
const {
  GetStudentsHelper,
  GetStudentByIdHelper,
  CheckStudentEmailHelper,
  CreateStudentHelper,
  UpdateStudentHelper,
  DeactivateStudentHelper,
  ReactivateStudentHelper,
  ImportStudentsHelper,
} = require('./student.helper');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateCreateStudentInput,
  ValidateUpdateStudentInput,
} = require('./student.validator');

// *************** IMPORT UTILITIES ***************
const { HandleGraphQLError, AppError } = require('../../core/error');
const { CheckPermission } = require('../../shared/utils/permission_check');

// *************** QUERY ***************

/**
 * Fetches a paginated list of students for the current tenant.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { filters, page, limit }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Paginated student list
 */
async function GetStudents(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'students', 'view');
    return await GetStudentsHelper(args, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Fetches a single student by ID.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object|null>} Student document
 */
async function GetStudent(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'students', 'view');
    return await GetStudentByIdHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Checks if an email address is already used by a student in the current tenant.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { email, exclude_id }
 * @param {Object} context - { tenant_id }
 * @returns {Promise<boolean>}
 */
async function CheckStudentEmail(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    return await CheckStudentEmailHelper(args.email, context.tenant_id, args.exclude_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new student record.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { input: CreateStudentInput }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Created student document
 */
async function CreateStudent(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'students', 'edit');
    ValidateCreateStudentInput(args.input);
    return await CreateStudentHelper(args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Updates an existing student record.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id, input: UpdateStudentInput }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Updated student document
 */
async function UpdateStudent(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'students', 'edit');
    ValidateUpdateStudentInput(args.input);
    return await UpdateStudentHelper(args.id, args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Deactivates a student (sets status to 'inactive').
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Updated student document
 */
async function DeactivateStudent(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'students', 'edit');
    return await DeactivateStudentHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Reactivates a previously deactivated student.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Updated student document
 */
async function ReactivateStudent(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'students', 'edit');
    return await ReactivateStudentHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Imports multiple students in bulk with partial success.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { students: [ImportStudentInput] }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} { imported, failed, errors }
 */
async function ImportStudents(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'students', 'edit');
    return await ImportStudentsHelper(args.students, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    getStudents: GetStudents,
    getStudent: GetStudent,
    checkStudentEmail: CheckStudentEmail,
  },
  Mutation: {
    createStudent: CreateStudent,
    updateStudent: UpdateStudent,
    deactivateStudent: DeactivateStudent,
    reactivateStudent: ReactivateStudent,
    importStudents: ImportStudents,
  },
};
