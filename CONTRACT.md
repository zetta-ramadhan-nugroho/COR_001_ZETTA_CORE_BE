# CONTRACT.md — COR_001 ZETTA_CORE Backend Integration Contract

> **Version:** 1.0  
> **Status:** Active  
> **Owner:** Zetta Core BE  
> **Audience:** ZETTA_CORE FE, SAT_001 BE, and all downstream ecosystem apps  
>
> This document is the authoritative integration reference for all consumers of the Zetta Core backend.
> Downstream apps MUST NOT couple to the Core database schema directly.
> All integration must happen through the GraphQL APIs and events described here.

---

## 1. Connection Details

| Property | Value |
|---|---|
| API Type | GraphQL (Apollo Server) |
| Endpoint (Public) | `POST /graphql` |
| Health Check | `GET /health` |
| Authentication | Bearer JWT (user auth) or X-Service-Token (service-to-service) |

---

## 2. Authentication

### 2.1 User Auth (JWT)

All public queries and mutations (except `login`, `resetPasswordRequest`, `resetPasswordConfirm`) require:

```
Authorization: Bearer <token>
```

The token is obtained from the `login` mutation and contains:
- `userId` — authenticated user ID
- `tenantId` — active tenant scope
- `role` — tenant-scoped role slug
- `permissions` — `{ [module]: ['view', 'edit'] }` map

Tokens expire as configured by `JWT_EXPIRES_IN` (default: 7 days).

### 2.2 Service-to-Service Auth (Internal API)

All `internal_*` queries and mutations require two additional headers:

```
X-Service-Token: <INTERNAL_SERVICE_TOKEN>
X-Source-App: <source_app_identifier>   # e.g. SAT_001
```

The `X-Source-App` value is logged in all audit entries for cross-app traceability.

---

## 3. Public GraphQL Queries

### 3.1 User & Auth

| Query | Arguments | Returns | Auth Required |
|---|---|---|---|
| `getMe` | — | `User` | Yes |
| `getUsers` | `search: String, page: Int, limit: Int` | `UserListResult` | Yes + `users.view` |
| `getUser` | `id: ID!` | `User` | Yes + `users.view` |

### 3.2 Students

| Query | Arguments | Returns | Auth Required |
|---|---|---|---|
| `getStudents` | `filters: StudentFiltersInput, page: Int, limit: Int` | `StudentListResult` | Yes + `students.view` |
| `getStudent` | `id: ID!` | `Student` | Yes + `students.view` |
| `checkStudentEmail` | `email: String!, exclude_id: ID` | `Boolean` | Yes |

### 3.3 Roles

| Query | Arguments | Returns | Auth Required |
|---|---|---|---|
| `getRoles` | `page: Int, limit: Int` | `RoleListResult` | Yes + `roles.view` |
| `getRole` | `id: ID!` | `Role` | Yes + `roles.view` |

### 3.4 Programs

| Query | Arguments | Returns | Auth Required |
|---|---|---|---|
| `getPrograms` | `filters: ProgramFiltersInput, page: Int, limit: Int` | `ProgramListResult` | Yes + `programs.view` |
| `getProgram` | `id: ID!` | `Program` | Yes + `programs.view` |

### 3.5 Foundational Data

| Query | Arguments | Returns | Auth Required |
|---|---|---|---|
| `getSchools` | `page: Int, limit: Int` | `SchoolListResult` | Yes + `foundational_data.view` |
| `getSchool` | `id: ID!` | `School` | Yes + `foundational_data.view` |
| `getCampuses` | `page: Int, limit: Int` | `CampusListResult` | Yes + `foundational_data.view` |
| `getCampus` | `id: ID!` | `Campus` | Yes + `foundational_data.view` |
| `getPeriods` | `page: Int, limit: Int` | `PeriodListResult` | Yes + `foundational_data.view` |
| `getPeriod` | `id: ID!` | `Period` | Yes + `foundational_data.view` |
| `getLevels` | `page: Int, limit: Int` | `LevelListResult` | Yes + `foundational_data.view` |
| `getLevel` | `id: ID!` | `Level` | Yes + `foundational_data.view` |
| `getSectors` | `page: Int, limit: Int` | `SectorListResult` | Yes + `foundational_data.view` |
| `getSector` | `id: ID!` | `Sector` | Yes + `foundational_data.view` |
| `getSpecialities` | `page: Int, limit: Int` | `SpecialityListResult` | Yes + `foundational_data.view` |
| `getSpeciality` | `id: ID!` | `Speciality` | Yes + `foundational_data.view` |
| `getLegalEntities` | `page: Int, limit: Int` | `LegalEntityListResult` | Yes + `foundational_data.view` |
| `getLegalEntity` | `id: ID!` | `LegalEntity` | Yes + `foundational_data.view` |
| `getFormationTypes` | `page: Int, limit: Int` | `FormationTypeListResult` | Yes + `foundational_data.view` |
| `getFormationType` | `id: ID!` | `FormationType` | Yes + `foundational_data.view` |
| `getRncpTitles` | `page: Int, limit: Int` | `RncpTitleListResult` | Yes + `foundational_data.view` |
| `getRncpTitle` | `id: ID!` | `RncpTitle` | Yes + `foundational_data.view` |

### 3.6 Financial Settings

| Query | Arguments | Returns | Auth Required |
|---|---|---|---|
| `getPaymentModalities` | `page: Int, limit: Int` | `PaymentModalityListResult` | Yes + `financial_settings.view` |
| `getPaymentModality` | `id: ID!` | `PaymentModality` | Yes + `financial_settings.view` |
| `getAdditionalFees` | `page: Int, limit: Int` | `AdditionalFeeListResult` | Yes + `financial_settings.view` |
| `getAdditionalFee` | `id: ID!` | `AdditionalFee` | Yes + `financial_settings.view` |
| `getRegistrationProfiles` | `page: Int, limit: Int` | `RegistrationProfileListResult` | Yes + `financial_settings.view` |
| `getRegistrationProfile` | `id: ID!` | `RegistrationProfile` | Yes + `financial_settings.view` |

### 3.7 Localization

| Query | Arguments | Returns | Auth Required |
|---|---|---|---|
| `getLocalizations` | `page: Int, limit: Int` | `LocalizationListResult` | Yes |
| `getLocalization` | `key: String!` | `Localization` | Yes |

---

## 4. Public GraphQL Mutations

### 4.1 Auth

| Mutation | Arguments | Returns | Auth Required |
|---|---|---|---|
| `login` | `input: LoginInput!` | `AuthPayload!` | No (public) |
| `logout` | — | `Boolean!` | No |
| `resetPasswordRequest` | `email: String!` | `Boolean!` | No (public) |
| `resetPasswordConfirm` | `token: String!, password: String!` | `Boolean!` | No (public) |
| `switchTenant` | `tenant_id: ID!` | `AuthPayload!` | Yes |

### 4.2 Users

| Mutation | Arguments | Returns | Auth Required |
|---|---|---|---|
| `createUser` | `input: CreateUserInput!` | `User!` | Yes + `users.edit` |
| `updateUser` | `id: ID!, input: UpdateUserInput!` | `User!` | Yes + `users.edit` |
| `deactivateUser` | `id: ID!` | `User!` | Yes + `users.edit` |

### 4.3 Students

| Mutation | Arguments | Returns | Auth Required |
|---|---|---|---|
| `createStudent` | `input: CreateStudentInput!` | `Student!` | Yes + `students.edit` |
| `updateStudent` | `id: ID!, input: UpdateStudentInput!` | `Student!` | Yes + `students.edit` |
| `deactivateStudent` | `id: ID!` | `Student!` | Yes + `students.edit` |
| `reactivateStudent` | `id: ID!` | `Student!` | Yes + `students.edit` |
| `importStudents` | `students: [ImportStudentInput!]!` | `ImportStudentsResult!` | Yes + `students.edit` |

### 4.4 Roles

| Mutation | Arguments | Returns | Auth Required |
|---|---|---|---|
| `createRole` | `input: CreateRoleInput!` | `Role!` | Yes + `roles.edit` |
| `updateRole` | `id: ID!, input: UpdateRoleInput!` | `Role!` | Yes + `roles.edit` |
| `updateRolePermissions` | `id: ID!, input: UpdateRolePermissionsInput!` | `Role!` | Yes + `roles.edit` |
| `deleteRole` | `id: ID!` | `Boolean!` | Yes + `roles.edit` |

### 4.5 Programs

| Mutation | Arguments | Returns | Auth Required |
|---|---|---|---|
| `createProgram` | `input: CreateProgramInput!` | `Program!` | Yes + `programs.edit` |
| `updateProgram` | `id: ID!, input: UpdateProgramInput!` | `Program!` | Yes + `programs.edit` |
| `deactivateProgram` | `id: ID!` | `Program!` | Yes + `programs.edit` |
| `assignProgramToStudent` | `student_id: ID!, program_id: ID!, member_of_admission_id: ID` | `Boolean!` | Yes + `programs.edit` |

### 4.6 Foundational Data

All foundational data mutations follow the pattern `create[Entity]`, `update[Entity]`, `delete[Entity]`.
All require `foundational_data.edit` permission.

Entities: `School`, `Campus`, `Period`, `Level`, `Sector`, `Speciality`, `LegalEntity`, `FormationType`, `RncpTitle`

### 4.7 Financial Settings

All financial mutations follow the pattern `create[Entity]`, `update[Entity]`, `delete[Entity]`.
All require `financial_settings.edit` permission.

Entities: `PaymentModality`, `AdditionalFee`, `RegistrationProfile`

### 4.8 Localization

| Mutation | Arguments | Returns | Auth Required |
|---|---|---|---|
| `createLocalization` | `input: CreateLocalizationInput!` | `Localization!` | Yes |
| `updateLocalization` | `key: String!, input: UpdateLocalizationInput!` | `Localization!` | Yes |
| `batchSaveLocalizations` | `items: [BatchSaveLocalizationInput!]!` | `Boolean!` | Yes |
| `deleteLocalization` | `key: String!` | `Boolean!` | Yes |

---

## 5. Internal GraphQL Queries (Service-Auth Required)

All `internal_*` queries require `X-Service-Token` and `X-Source-App` headers.
The `tenant_id` must be provided in context (via the JWT or explicit param).

| Query | Arguments | Returns | Description |
|---|---|---|---|
| `internal_getStudentSummary` | `student_id: ID!` | `StudentSummary` | Student identity for downstream display |
| `internal_getStudentDetail` | `student_id: ID!` | `StudentDetail` | Full student detail composition base |
| `internal_getProgramSummary` | `program_id: ID!` | `ProgramSummary` | Program data for downstream workflow |
| `internal_getProgramReadiness` | `program_id: ID!` | `ProgramReadiness!` | Readiness status check for admission creation |
| `internal_getRegistrationProfile` | `profile_id: ID!` | `RegistrationProfileSummary` | Financial profile for admission |
| `internal_getFinancialContext` | `program_id: ID!` | `FinancialContext` | Rates and fees for program |
| `internal_getUserScope` | `user_id: ID!, tenant_id: String!` | `UserScope` | User membership and role scope |
| `internal_getFoundationalData` | `tenant_id: String!` | `FoundationalDataBundle!` | All reference data for downstream forms |

---

## 6. Internal GraphQL Mutations (Service-Auth Required)

| Mutation | Arguments | Returns | Description |
|---|---|---|---|
| `internal_updateStudentFromAdmission` | `student_id: ID!, input: AdmissionStudentUpdateInput!` | `Student!` | Apply allowed student field updates from SAT |
| `internal_updateStudentPhotoRef` | `student_id: ID!, file_id: String!` | `Student!` | Update Core-owned photo reference |
| `internal_resolveFileAccessUrl` | `file_id: String!` | `FileAccessResult!` | Return time-limited presigned URL for Core-owned file |

### Allowed Fields in `AdmissionStudentUpdateInput`

```graphql
input AdmissionStudentUpdateInput {
  civility: String
  first_name: String
  last_name: String
  date_of_birth: String
  place_of_birth: String
  nationality: String
  phone_number: String
  phone_country_code: String
  iban: String
  bic: String
  account_holder_name: String
  address: StudentAddressInput
}
```

**Immutable fields (Core owns these — NOT writable by downstream):**
- `student_number` — auto-generated and permanent
- `email` — tenant-unique identifier

---

## 7. Internal Trigger Events

When the following actions occur in Core, downstream apps MUST be notified.
Implementation: direct internal HTTP call, pub/sub, or message queue (see `program.helper.js`).

| Event | Trigger Condition | Payload Shape |
|---|---|---|
| `PROGRAM_ASSIGNED` | Admin assigns a program to a student in Core | `{ student_id, program_id, member_of_admission_id, tenant_id, acting_user_id }` |
| `PROGRAM_ASSIGNMENT_CHANGED` | Admin changes an existing program assignment | `{ student_id, old_program_id, new_program_id, tenant_id, acting_user_id }` |
| `ADMISSION_MEMBER_CHANGED` | Member of admission assignment changes | `{ student_id, program_id, old_member_id, new_member_id, tenant_id }` |
| `STUDENT_SUMMARY_CHANGED` | Student core fields (name, email, photo) updated | `{ student_id, tenant_id, changed_fields: string[] }` |
| `PROGRAM_READINESS_CHANGED` | Program readiness status transitions | `{ program_id, tenant_id, is_ready: boolean, missing_fields: string[] }` |

---

## 8. MongoDB Collections

| Collection | Tenant-Scoped | Key Rules |
|---|---|---|
| `students` | Yes | `student_number` auto-generated, immutable. `email` + `tenant_id` unique. Soft delete via `deleted_at`. |
| `users` | No (global) | `email` globally unique. Users belong to multiple tenants via `tenant_members`. |
| `tenants` | — | Top-level org unit. `slug` globally unique. |
| `tenant_members` | Yes | Join between `user_id` and `tenant_id`. Carries role assignment. |
| `roles` | Yes | `slug` + `tenant_id` unique. `permissions` is a Map of `{ [module]: ['view', 'edit'] }`. |
| `schools` | Yes | `name` + `tenant_id` unique. Soft delete. |
| `campuses` | Yes | `name` + `tenant_id` unique. References `school`. Soft delete. |
| `periods` | Yes | `name` + `tenant_id` unique. Academic periods with dates. |
| `programs` | Yes | `name` + `tenant_id` unique. Includes CGV `s3_key`, readiness status. |
| `registration_profiles` | Yes | Linked to programs. Includes nested payment/CGV rules. |
| `payment_modalities` | Yes | Payment schedule installments. |
| `additional_fees` | Yes | Flat fee additions. |
| `legal_entities` | Yes | Banking + registration info. |
| `rncp_titles` | Yes | French regulatory certification titles. |
| `formation_types` | Yes | Formation type codes. |
| `levels` | Yes | Education levels with ranking. |
| `sectors` | Yes | Industry sectors. |
| `specialities` | Yes | Specialities under sectors. |
| `localizations` | Yes | Translation key-value store. `key` + `tenant_id` unique. English is fallback. |
| `error_logs` | No | System-wide error logging with stack traces. |
| `audit_logs` | Yes | Cross-app and sensitive action audit trail. |

---

## 9. Required Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing/verifying JWT tokens |
| `JWT_EXPIRES_IN` | No | Token expiry duration (default: `7d`) |
| `INTERNAL_SERVICE_TOKEN` | Yes | Shared secret for service-to-service auth |
| `AWS_REGION` | Yes | AWS region for S3 |
| `AWS_ACCESS_KEY_ID` | Yes | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Yes | AWS secret key |
| `S3_BUCKET_NAME` | Yes | S3 bucket for Core-owned files |
| `S3_PRESIGNED_URL_EXPIRY` | No | Presigned URL lifetime in seconds (default: `3600`) |
| `SMTP_HOST` | Yes | SMTP server hostname |
| `SMTP_PORT` | No | SMTP port (default: `587`) |
| `SMTP_SECURE` | No | Use TLS (default: `false`) |
| `SMTP_USER` | Yes | SMTP username |
| `SMTP_PASS` | Yes | SMTP password |
| `MAILER_FROM` | No | Sender address (default: `noreply@zettabyte.com`) |
| `APP_BASE_URL` | Yes | Frontend base URL (for email links) |
| `PORT` | No | Server port (default: `4000`) |
| `NODE_ENV` | No | `development` or `production` (affects error verbosity) |

---

## 10. Tenant Isolation Rules

1. **Every DB query is scoped to `tenant_id`** — no exceptions.
2. **No tenant may read or write another tenant's data.**
3. All tenant-scoped models include `tenant_id: { type: String, required: true, index: true }`.
4. `buildTenantQuery(tenant_id)` utility is used on every helper to enforce this.
5. `assertTenantScope(requesting_tenant_id, resource_tenant_id)` is used when accessing a specific resource.
6. Internal APIs that receive `tenant_id` as an argument still enforce it — downstream apps cannot access other tenants.

---

## 11. File Storage Rules

- All Core-owned files (student photos, user avatars, program CGV) are stored in AWS S3.
- **Only the stable `s3_key` is stored in the database — never a URL.**
- Presigned URLs are generated on demand via `internal_resolveFileAccessUrl` or `GeneratePresignedUrl`.
- Downstream apps must NOT store Core-owned files. They must call `internal_resolveFileAccessUrl` to get a time-limited access URL.
- Presigned URLs expire after `S3_PRESIGNED_URL_EXPIRY` seconds (default: 1 hour).

---

## 12. Permission Model

Roles are **tenant-scoped**. Permissions are **module-based** with two action levels:

```json
{
  "students": ["view", "edit"],
  "programs": ["view"],
  "foundational_data": ["view", "edit"],
  "financial_settings": ["view"],
  "users": ["view", "edit"],
  "roles": ["view", "edit"],
  "localization": ["view", "edit"]
}
```

- `view` — read access to the module
- `edit` — write/create/update/delete access to the module
- New roles default to **no permissions**
- No user-level permission overrides in v1
- `super_admin` role bypasses all permission checks

---

## 13. Audit Trail

All cross-app actions and sensitive direct actions are logged to `audit_logs` with:

```json
{
  "action": "STUDENT_UPDATED_FROM_ADMISSION",
  "tenant_id": "...",
  "acting_user_id": "...",
  "source_app": "SAT_001",
  "target_entity": "student",
  "target_id": "...",
  "before": { ... },
  "after": { ... },
  "created_at": "..."
}
```

---

*Generated by Claude Code — COR_001 ZETTA_CORE v1.0 — 2026-03-31*
