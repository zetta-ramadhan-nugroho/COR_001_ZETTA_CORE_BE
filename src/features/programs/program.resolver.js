// *************** IMPORT HELPER FUNCTION ***************
const {
  GetProgramsHelper,
  GetProgramByIdHelper,
  CreateProgramHelper,
  UpdateProgramHelper,
  DeactivateProgramHelper,
  AssignProgramToStudentHelper,
} = require('./program.helper');

// *************** IMPORT VALIDATOR ***************
const { ValidateCreateProgramInput, ValidateUpdateProgramInput } = require('./program.validator');

// *************** IMPORT UTILITIES ***************
const { HandleGraphQLError, AppError } = require('../../core/error');
const { CheckPermission } = require('../../shared/utils/permission_check');

// *************** QUERY ***************

/**
 * Fetches a paginated list of programs for the current tenant.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { filters, page, limit }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Paginated program list
 */
async function GetPrograms(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'programs', 'view');
    return await GetProgramsHelper(args, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Fetches a single program by ID.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object|null>} Program document
 */
async function GetProgram(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'programs', 'view');
    return await GetProgramByIdHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** MUTATION ***************

/**
 * Creates a new program.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { input: CreateProgramInput }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Created program document
 */
async function CreateProgram(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'programs', 'edit');
    ValidateCreateProgramInput(args.input);
    return await CreateProgramHelper(args.input, context.tenant_id, context.user_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Updates an existing program.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id, input: UpdateProgramInput }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Updated program document
 */
async function UpdateProgram(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'programs', 'edit');
    ValidateUpdateProgramInput(args.input);
    return await UpdateProgramHelper(args.id, args.input, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Deactivates (archives) a program.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { id }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Updated program document
 */
async function DeactivateProgram(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'programs', 'edit');
    return await DeactivateProgramHelper(args.id, context.tenant_id);
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

/**
 * Assigns a program to a student and optionally sets the member of admission.
 * Triggers a downstream PROGRAM_ASSIGNED event.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { student_id, program_id, member_of_admission_id }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<boolean>}
 */
async function AssignProgramToStudent(_, args, context) {
  try {
    if (!context.user_id) throw new AppError('Authentication required.', 'UNAUTHENTICATED', 401);
    CheckPermission(context.role, context.permissions, 'programs', 'edit');
    return await AssignProgramToStudentHelper(
      args.student_id,
      args.program_id,
      args.member_of_admission_id || null,
      context.tenant_id,
      context.user_id
    );
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: { getPrograms: GetPrograms, getProgram: GetProgram },
  Mutation: {
    createProgram: CreateProgram,
    updateProgram: UpdateProgram,
    deactivateProgram: DeactivateProgram,
    assignProgramToStudent: AssignProgramToStudent,
  },
};
