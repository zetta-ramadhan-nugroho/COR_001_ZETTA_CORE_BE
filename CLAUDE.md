# CLAUDE.md — COR_001 ZETTA_CORE (Backend)

## Project Identity

- **App:** COR_001 — Zetta Core
- **Stack:** Node.js, Apollo Server (GraphQL), MongoDB (Mongoose), JWT Auth
- **Role of this repo:** Backend only. No frontend code lives here.
- **Primary reference:** PRD 1 — COR_001_ZETTA_CORE
- **Integration role:** Source of truth for master data. Exposes internal GraphQL APIs consumed by downstream apps (e.g., SAT_001_ZETTA_ADMISSION).

---

## What This App Does

Zetta Core is the central multi-tenant platform governing the educational ecosystem. It:
- Manages tenant master data: students, users, schools, campuses, programs, financials
- Governs identity, roles, and permissions
- Exposes internal GraphQL APIs for downstream apps
- Triggers downstream workflows (e.g., admission creation) via internal events/contracts
- Receives controlled mutation commands from downstream apps
- Owns file storage for all Core-governed assets (student photos, program CGV, user avatars)

---

## Folder Structure

All source code lives inside `/src`. Do not place any logic outside `/src`.

```
/src
├── /features
│   ├── /students
│   │   ├── student.model.js
│   │   ├── student.resolver.js
│   │   ├── student.helper.js
│   │   ├── student.validator.js
│   │   └── student.typedef.js
│   ├── /users
│   │   ├── user.model.js
│   │   ├── user.resolver.js
│   │   ├── user.helper.js
│   │   ├── user.validator.js
│   │   └── user.typedef.js
│   ├── /tenants
│   │   ├── tenant.model.js
│   │   ├── tenant.resolver.js
│   │   ├── tenant.helper.js
│   │   └── tenant.typedef.js
│   ├── /tenant_members
│   │   ├── tenant_member.model.js
│   │   ├── tenant_member.resolver.js
│   │   ├── tenant_member.helper.js
│   │   └── tenant_member.typedef.js
│   ├── /roles
│   │   ├── role.model.js
│   │   ├── role.resolver.js
│   │   ├── role.helper.js
│   │   ├── role.validator.js
│   │   └── role.typedef.js
│   ├── /foundational_data
│   │   ├── /schools
│   │   │   ├── school.model.js
│   │   │   ├── school.resolver.js
│   │   │   ├── school.helper.js
│   │   │   └── school.typedef.js
│   │   ├── /campuses
│   │   │   ├── campus.model.js
│   │   │   ├── campus.resolver.js
│   │   │   ├── campus.helper.js
│   │   │   └── campus.typedef.js
│   │   ├── /periods
│   │   │   └── ... (same pattern)
│   │   ├── /levels
│   │   │   └── ...
│   │   ├── /sectors
│   │   │   └── ...
│   │   ├── /specialities
│   │   │   └── ...
│   │   ├── /legal_entities
│   │   │   └── ...
│   │   ├── /formation_types
│   │   │   └── ...
│   │   └── /rncp_titles
│   │       └── ...
│   ├── /programs
│   │   ├── program.model.js
│   │   ├── program.resolver.js
│   │   ├── program.helper.js
│   │   ├── program.validator.js
│   │   └── program.typedef.js
│   ├── /financial_settings
│   │   ├── /payment_modalities
│   │   │   └── ...
│   │   ├── /additional_fees
│   │   │   └── ...
│   │   └── /registration_profiles
│   │       ├── registration_profile.model.js
│   │       ├── registration_profile.resolver.js
│   │       ├── registration_profile.helper.js
│   │       ├── registration_profile.validator.js
│   │       └── registration_profile.typedef.js
│   └── /localization
│       ├── localization.model.js
│       ├── localization.resolver.js
│       ├── localization.helper.js
│       └── localization.typedef.js
│
├── /internal_api
│   ├── /read
│   │   ├── student_internal.resolver.js
│   │   ├── program_internal.resolver.js
│   │   ├── user_internal.resolver.js
│   │   └── financial_internal.resolver.js
│   └── /commands
│       ├── student_update_command.resolver.js
│       └── file_access_command.resolver.js
│
├── /middlewares
│   ├── /auth
│   │   ├── auth_request.middleware.js
│   │   └── service_auth.middleware.js
│   └── index.js
│
├── /shared
│   ├── /services
│   │   ├── s3_uploader.service.js
│   │   └── mailer.service.js
│   ├── /utils
│   │   ├── tenant_guard.js
│   │   ├── permission_check.js
│   │   └── presigned_url.js
│   └── /validators
│       └── common.validator.js
│
├── /core
│   ├── db.js
│   ├── config.js
│   ├── error.js
│   └── audit_logger.js
│
├── /schema
│   └── index.js
│
└── index.js
```

---

## Responsibility Rules (Strict — Do Not Deviate)

### Resolver = Orchestrator Only
- Receives GraphQL `(parent, args, context)`
- Calls validator → calls helper → returns result
- No DB queries, no business logic, no calculations
- Always wraps in `try/catch` and calls `HandleGraphQLError(error)` in catch

```js
// *************** QUERY ***************

/**
 * Fetches a paginated list of students for the current tenant.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - Query arguments (filters, pagination)
 * @param {Object} context - GraphQL context (user, tenant_id)
 * @returns {Promise<Object>} Paginated student list
 */
async function GetStudents(_, args, context) {
  try {
    ValidateGetStudentsInput(args);
    const result = await GetStudentsHelper(args, context.tenant_id);
    return result;
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}
```

### Helper = All Business Logic
- All DB access lives here (`Model.find`, `Model.create`, etc.)
- All conditional logic, loops, calculations
- Enforces tenant isolation on every DB call using `tenant_id`
- Throws `AppError` for business rule violations
- Always logs to `ErrorLogModel` in catch block, then rethrows

```js
/**
 * Retrieves paginated students scoped to a tenant.
 *
 * @param {Object} args - Filters and pagination args
 * @param {string} tenant_id - Tenant scope from context
 * @returns {Promise<Object>} { data, total, page, limit }
 */
async function GetStudentsHelper(args, tenant_id) {
  try {
    const { page = 1, limit = 20, ...filters } = args;
    const query = { tenant_id, deleted_at: null, ...filters };
    const [data, total] = await Promise.all([
      StudentModel.find(query).lean().skip((page - 1) * limit).limit(limit),
      StudentModel.countDocuments(query),
    ]);
    return { data, total, page, limit };
  } catch (error) {
    await ErrorLogModel.create({
      path: 'features/students/student.helper.js',
      function_name: 'GetStudentsHelper',
      parameter_input: JSON.stringify({ args, tenant_id }),
      error: String(error.stack),
    });
    throw new AppError(error.message, 'GET_STUDENTS_FAILED', 500);
  }
}
```

### Validator = Input Guard
- Joi for static shape/type/format validation
- Manual validation for cross-field logic
- Never accesses DB inside validator
- Throws `AppError` with clear code and HTTP-equivalent status

### Model = Schema Only
- Mongoose schema definition only
- No hooks, no methods, no statics
- Every field must have an inline comment explaining its purpose
- Always enable `timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }`
- Always set `collection:` name explicitly
- Every multi-tenant model must include `tenant_id` as a required indexed field

---

## GraphQL Schema Rules

- Type definitions live in `*.typedef.js` files per feature
- All typedef files are merged in `/schema/index.js`
- Use `extend type Query` and `extend type Mutation` per feature
- Internal-only resolvers (consumed by downstream services via service auth) are prefixed `internal_`
- Never expose internal resolvers to the public schema without service-auth guard

```graphql
# student.typedef.js

extend type Query {
  getStudents(filters: StudentFiltersInput, page: Int, limit: Int): StudentListResult!
  getStudent(id: ID!): Student
  internal_getStudentSummary(student_id: ID!): StudentSummary  # service-auth only
}

extend type Mutation {
  createStudent(input: CreateStudentInput!): Student!
  updateStudent(id: ID!, input: UpdateStudentInput!): Student!
  deactivateStudent(id: ID!): Student!
  internal_updateStudentFromAdmission(student_id: ID!, input: AdmissionStudentUpdateInput!): Student!  # service-auth only
}
```

---

## Error Handling

### AppError Class (lives in `/core/error.js`)
```js
class AppError extends Error {
  constructor(message, code, httpStatus, meta = {}) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
    this.meta = meta;
  }
}
```

### HandleGraphQLError (lives in `/core/error.js`)
```js
const { GraphQLError } = require('graphql');

function HandleGraphQLError(error) {
  if (error instanceof AppError) {
    return new GraphQLError(error.message, {
      extensions: {
        code: error.code,
        httpStatus: error.httpStatus,
        meta: error.meta,
      },
    });
  }
  return new GraphQLError('An internal server error occurred.', {
    extensions: { code: 'INTERNAL_SERVER_ERROR', httpStatus: 500 },
  });
}
```

### ErrorLogModel
Every helper catch block must log to `ErrorLogModel` before rethrowing.
Fields: `path`, `function_name`, `parameter_input` (JSON.stringify), `error` (String(error.stack)), `tenant_id`

---

## Authentication & Authorization

### User Auth
- JWT is used for user login
- Auth middleware extracts JWT → injects `context.user_id`, `context.role`, `context.tenant_id`
- All resolvers must validate tenant context from `context.tenant_id`

### Service-to-Service Auth
- Downstream apps (e.g., SAT_001) authenticate using internal service tokens
- `service_auth.middleware.js` verifies the service token and injects `context.source_app`
- Internal resolvers check `context.source_app` before executing

### Tenant Isolation Rule (CRITICAL)
- Every DB query in every helper MUST include `tenant_id` scoping
- No query may return data outside the requesting tenant's scope
- Use `tenant_guard.js` utility to enforce and verify tenant scope before any DB operation

```js
// *************** IMPORT UTILITIES ***************
const { assertTenantScope } = require('../../../shared/utils/tenant_guard');

// *************** Inside helper ***************
assertTenantScope(context.tenant_id, student.tenant_id);
```

### Permission Check
- Use `permission_check.js` utility — never hardcode role logic in resolvers or helpers
- Permissions are module-based: `view`, `edit`
- No user-level overrides in v1

```js
// *************** IMPORT UTILITIES ***************
const { CheckPermission } = require('../../../shared/utils/permission_check');

// *************** Inside helper ***************
CheckPermission(context.role, context.permissions, 'students', 'edit');
```

---

## File Storage Rules

- All Core-owned files (student photos, user avatars, program CGV) go to AWS S3 via `s3_uploader.service.js`
- Store only stable file references (`file_id`, `s3_key`) in the DB — never store presigned URLs
- Generate presigned URLs on demand via `presigned_url.js` utility
- Downstream apps must request file access through Core's internal command API — they must not access S3 directly

---

## Internal API Contracts (for Downstream Apps)

Core exposes the following internal GraphQL resolvers, accessible only via service-auth:

### Internal Read Queries
- `internal_getStudentSummary(student_id)` — student identity for downstream display
- `internal_getStudentDetail(student_id)` — full student detail composition base
- `internal_getProgramSummary(program_id)` — program data for downstream workflow
- `internal_getProgramReadiness(program_id)` — readiness status check
- `internal_getRegistrationProfile(profile_id)` — financial profile for admission
- `internal_getFinancialContext(program_id)` — rates and fees
- `internal_getUserScope(user_id, tenant_id)` — user membership and role scope
- `internal_getFoundationalData(tenant_id)` — reference data for downstream forms

### Internal Command Mutations
- `internal_updateStudentFromAdmission(student_id, input)` — apply allowed student field updates from SAT
- `internal_updateStudentPhotoRef(student_id, file_id)` — update Core-owned photo reference
- `internal_resolveFileAccessUrl(file_id)` — return time-limited presigned URL for a Core-owned file

### Internal Trigger Events
When the following actions occur in Core, downstream apps must be notified:
- Program assigned to student → emit `PROGRAM_ASSIGNED` event
- Program assignment changed → emit `PROGRAM_ASSIGNMENT_CHANGED` event
- Member of admission assignment changed → emit `ADMISSION_MEMBER_CHANGED` event
- Student summary changed → emit `STUDENT_SUMMARY_CHANGED` event
- Program readiness changed → emit `PROGRAM_READINESS_CHANGED` event

Implement via internal event emission (pub/sub, message queue, or direct internal HTTP call). Document chosen approach in `CONTRACT.md`.

---

## Audit Logging

All cross-app actions and sensitive direct actions must be logged via `audit_logger.js`:

```js
await AuditLogger.log({
  action: 'STUDENT_UPDATED_FROM_ADMISSION',
  tenant_id: context.tenant_id,
  acting_user_id: context.user_id,
  source_app: context.source_app || 'ZETTA_CORE',
  target_entity: 'student',
  target_id: student_id,
  before: beforeSnapshot,
  after: afterSnapshot,
});
```

---

## MongoDB Collections & Key Rules

| Collection | Key Rules |
|---|---|
| `students` | `student_number` is auto-generated and immutable. Unique per tenant on `student_number` and `email`. Soft delete via `deleted_at`. |
| `users` | `email` is globally unique. Users can belong to multiple tenants via `tenant_members`. |
| `tenants` | Top-level org unit. All tenant-scoped data references `tenant_id`. |
| `tenant_members` | Join between user and tenant. Carries tenant-scoped role assignments. |
| `roles` | Tenant-scoped. No user-level overrides. Default to no access on creation. |
| `schools` | Tenant-scoped foundational data. |
| `campuses` | Tenant-scoped. References school. |
| `periods` | Tenant-scoped. Academic periods. |
| `programs` | Tenant-scoped. Includes CGV file reference, registration profile links, readiness status. |
| `registration_profiles` | Tenant-scoped. Includes payment modalities, additional fees, perimeters, payment methods. |
| `payment_modalities` | Tenant-scoped financial config. |
| `additional_fees` | Tenant-scoped financial config. |
| `legal_entities` | Tenant-scoped. |
| `rncp_titles` | Tenant-scoped. |
| `formation_types` | Tenant-scoped. |
| `levels` | Tenant-scoped. |
| `sectors` | Tenant-scoped. |
| `specialities` | Tenant-scoped. |
| `localizations` | Tenant-scoped translation values. English is fallback. |
| `error_logs` | System-wide error logging. |
| `audit_logs` | Cross-app and sensitive action audit trail. |

### Field Naming
- All field names: `snake_case`
- Boolean fields prefix: `is_`, `has_`, `should_`
- Foreign keys: suffix `_id`
- Timestamps: `created_at`, `updated_at` via `timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }`
- Soft delete: `deleted_at: { type: Date, default: null }`
- Tenant scope: `tenant_id: { type: String, required: true, index: true }`

---

## Comment Format (Mandatory)

### Import Sections
```js
// *************** IMPORT LIBRARY ***************
const { GraphQLError } = require('graphql');

// *************** IMPORT MODEL ***************
const StudentModel = require('./student.model');

// *************** IMPORT HELPER FUNCTION ***************
const { GetStudentsHelper, CreateStudentHelper } = require('./student.helper');

// *************** IMPORT VALIDATOR ***************
const { ValidateCreateStudentInput } = require('./student.validator');

// *************** IMPORT UTILITIES ***************
const { HandleGraphQLError } = require('../../core/error');
const { CheckPermission } = require('../../shared/utils/permission_check');
```

### Function Sections
```js
// *************** QUERY ***************

// *************** MUTATION ***************

// *************** INTERNAL QUERY ***************

// *************** INTERNAL MUTATION ***************

// *************** EXPORT MODULE ***************
module.exports = { GetStudents, CreateStudent };
```

### JSDoc (Required on every function with params or return value)
```js
/**
 * Creates a new student record for the tenant.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { input: CreateStudentInput }
 * @param {Object} context - { user_id, tenant_id, role, permissions }
 * @returns {Promise<Object>} Created student document
 */
async function CreateStudent(_, args, context) { ... }
```

### Single-Line Comments
```js
// *************** Enforce tenant isolation before any DB operation
// *************** Student number is auto-generated and must not be editable
// *************** Only emit PROGRAM_ASSIGNED event after successful DB write
```

### START/END Blocks (for multi-stage logic)
```js
// *************** START: Build student registration profile composition ***************
...
// *************** END: Build student registration profile composition ***************
```

---

## Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Files | `snake_case` | `student.helper.js` |
| Folders | `snake_case` | `/foundational_data` |
| Collections | `snake_case`, plural | `tenant_members` |
| Fields | `snake_case` | `student_number` |
| Resolver functions (exported) | `PascalCase` | `GetStudents` |
| Helper functions (exported) | `PascalCase` + Helper suffix | `GetStudentsHelper` |
| Functions (internal) | `camelCase` | `buildStudentQuery` |
| Constants | `SCREAMING_SNAKE_CASE` | `DEFAULT_PAGE_LIMIT` |
| GraphQL types | `PascalCase` | `StudentListResult` |
| GraphQL inputs | `PascalCase` + Input suffix | `CreateStudentInput` |

---

## Key Business Rules (Absolute — Do Not Override)

1. `student_number` is auto-generated by Core and is permanently immutable.
2. `email` is unique per tenant for students; `email` is globally unique for users.
3. Every DB query must be scoped to `tenant_id` — no exceptions.
4. No tenant may read or write another tenant's data.
5. Roles are tenant-scoped. Permissions are module-based (`view`, `edit`). No user-level overrides in v1.
6. Core-owned files (photos, CGV) stay in Core-owned S3. Downstream apps do not store these files.
7. Store only stable file references (`s3_key`) in DB. Generate presigned URLs on demand.
8. Soft deactivation by default — use `deleted_at` or `status = inactive`, not hard delete.
9. Cross-app actions (from SAT or other downstream apps) must be audited with acting user, tenant, and source app.
10. Internal resolver commands from downstream apps must be validated and treated as untrusted until verified.
11. Program assignment to student must trigger a downstream workflow event.
12. Student `student_number` and global `email` must not be writable by downstream app commands.

---

## CONTRACT.md Output

When the backend implementation is complete, save a `CONTRACT.md` file at the root of this repo.

It must contain:
- All public GraphQL queries and mutations (type signatures + auth requirements)
- All internal GraphQL queries and mutations (type signatures + service-auth requirement)
- All internal trigger events (name, payload shape, trigger condition)
- All MongoDB collection names
- All environment variables required
- Tenant isolation and service auth rules summary

The frontend (ZETTA_CORE FE) and downstream backend (SAT_001 BE) will read `CONTRACT.md` as their primary integration reference.
