Read PRD.md in this repo fully before doing anything else, then read CLAUDE.md.

PRD.md defines WHAT to build — features, business rules, data ownership, integration contracts.
CLAUDE.md defines HOW to build it — stack, folder structure, code patterns, naming conventions.
Both must be fully understood before writing a single line of code.

You are scaffolding and migrating the ZETTA_CORE backend.

## Phase 1 — Scaffold
Set up the full project structure exactly as defined in CLAUDE.md:
- Initialize a Node.js project with Apollo Server, Mongoose, and JWT
- Create every folder and file stub listed in the folder structure
- Set up /core/error.js with AppError and HandleGraphQLError
- Set up /core/db.js for MongoDB connection
- Set up /core/config.js for environment variables
- Set up /core/audit_logger.js
- Set up /schema/index.js that merges all typedef files
- Set up /middlewares/auth/auth_request.middleware.js and service_auth.middleware.js
- Set up /shared/utils/tenant_guard.js, permission_check.js, and presigned_url.js
- Set up /shared/services/s3_uploader.service.js and mailer.service.js
- Create a working index.js that boots Apollo Server

## Phase 2 — Migrate
Look at all existing files in the NEXTJS/ folder one level up. For each one:
- Mongoose model → move to correct feature folder as *.model.js, apply model rules from CLAUDE.md (snake_case fields, explicit collection name, timestamps, tenant_id, inline field comments)
- API route or handler → convert into a resolver + helper pair in the correct feature folder, following resolver/helper responsibility rules from CLAUDE.md exactly
- Validation function → move to correct *.validator.js, convert to Joi
- Business logic mixed with API handling → separate it: business logic to helper, orchestration to resolver
- Do not keep any Next.js-specific patterns (getServerSideProps, API route handlers, etc.)

## Phase 3 — Internal API
Scaffold /internal_api with stub resolvers for all internal read queries and command mutations listed in CLAUDE.md under "Internal API Contracts". Mark each stub as service-auth protected with a comment.

## Phase 4 — CONTRACT.md
After all features are implemented, generate CONTRACT.md at the root of this repo covering:
- All public GraphQL queries and mutations with full type signatures
- All internal GraphQL queries and mutations with service-auth requirement noted
- All internal trigger events with payload shapes and trigger conditions
- All MongoDB collection names
- All required environment variables

## Non-Negotiable Rules
- Follow CLAUDE.md comment format on every single file without exception
- Every helper catch block must log to ErrorLogModel before rethrowing
- Every DB query must include tenant_id scoping — no exceptions
- No business logic in resolvers
- No DB calls in validators
- Store only stable file references — never presigned URLs
- JSDoc required on every function that has params or a return value
- Do not proceed to the next phase until the current phase compiles without errors
