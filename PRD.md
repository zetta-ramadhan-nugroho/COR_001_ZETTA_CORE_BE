# **PRD 1 — COR\_001\_ZETTA\_CORE**

## **1\. Document Control**

* **Product:** COR\_001\_ZETTA\_CORE  
* **Version:** 2.0  
* **Status:** Recreated Draft  
* **Owner:** Nugi  
* **Role in Ecosystem:** Core platform and source of truth for tenant master data, identity, governance, and internal downstream service contracts

---

## **2\. Executive Summary**

Zetta Core is the central multi-tenant platform that governs the educational ecosystem. It is the authoritative source of truth for tenant-scoped institutional master data, student master data, user identity access, program configuration, financial configuration, and platform access rules.

In addition to managing master data directly, Zetta Core also acts as the **platform authority and integration provider** for downstream applications such as Zetta Admission. Core is therefore responsible not only for storing the truth, but also for exposing controlled internal APIs, commands, file access flows, and assignment-trigger integration behavior needed by dependent apps.

Core is used primarily by Admin users and secondarily by configurable tenant users whose access depends entirely on tenant-scoped roles and permissions defined in Core.

---

## **3\. Problem Statement**

The ecosystem depends on shared master data and consistent governance across multiple apps. Without a strong Core platform:

* student and user identity can drift across apps  
* program and financial context can become inconsistent  
* downstream workflow apps can duplicate or mis-own master data  
* access control can become fragmented  
* file ownership and update responsibility can become unclear  
* cross-app workflows become fragile and difficult to audit

Zetta Core solves this by acting as:

1. **the source of truth for master data**  
2. **the source of truth for tenant access governance**  
3. **the internal contract provider for downstream app integration**

---

## **4\. Product Goals**

1. Centralize tenant-owned master data in one governed platform.  
2. Enforce tenant isolation and role-based access consistently.  
3. Provide stable internal contracts for downstream ecosystem apps.  
4. Ensure downstream apps can consume Core data without becoming DB-coupled.  
5. Keep master-data ownership, file ownership, and update responsibility aligned.  
6. Maintain auditability for both direct Core actions and cross-app actions routed through Core.

---

## **5\. Solution Principles**

1. **Single source of truth**  
   Core is the authoritative source for master entities and governance.  
2. **Logical tenant isolation**  
   Tenant-owned data is isolated by `tenant_id`.  
3. **Shared identity, tenant-scoped access**  
   User identity is global, but tenant access is granted through tenant membership and tenant-scoped roles.  
4. **Contract-first downstream integration**  
   Dependent applications must consume Core through internal APIs, commands, and integration contracts rather than direct DB dependency as the intended architecture.  
5. **Selective projection allowed downstream**  
   Downstream apps may keep synced projections or immutable snapshots for operational purposes, but those projections do not replace Core ownership.  
6. **File ownership follows business ownership**  
   If a file belongs to a Core-owned entity, the final file must be stored and governed by Core-owned storage even if the action starts in another app.  
7. **Soft deactivation by default**  
   Records are deactivated instead of hard-deleted unless explicitly stated otherwise.

---

## **6\. User Personas**

### **Persona 1: Zetta Core Admin (Primary)**

**Role:** Admin  
**Needs:** Configure foundational data, manage students and users, govern programs and financial settings, maintain roles and permissions, and support downstream apps through correct master data and controlled workflows.  
**Usage Pattern:** Daily operational and governance usage.

### **Persona 2: Tenant Member User (Secondary)**

**Role:** Configurable tenant-scoped role assigned by Admin  
**Needs:** Access only allowed modules and perform permitted actions within tenant scope.  
**Usage Pattern:** Depends on role assignment.

---

## **7\. Core Data Ownership**

Core owns the following master entities in v1:

* student  
* user  
* tenant  
* tenant\_member  
* school  
* campus  
* level  
* period  
* sector  
* speciality  
* legal\_entity  
* formation\_type  
* rncp\_title  
* program  
* registration\_profile  
* additional\_fee  
* payment\_modality  
* role  
* permission configuration  
* localization base keys and tenant translation values

Core also owns file storage for Core-owned master assets such as:

* student profile photo  
* user avatar  
* program CGV / governed master documents

---

## **8\. Feature Scope**

### **F1. Home**

Purpose: lightweight landing page for permitted users.

Scope in v1:

* quick navigation cards

Not included:

* setup completeness widgets  
* activity widgets  
* audit widgets

### **F2. Students**

Purpose: centralized student master data management.

Core student record includes:

* `student_number`  
* `photo_file_id`  
* civility  
* last\_name  
* first\_name  
* date\_of\_birth  
* place\_of\_birth  
* nationality  
* phone\_number  
* phone\_country\_code  
* email  
* address  
* status  
* iban  
* bic  
* account\_holder\_name  
* `tenant_id`  
* `created_at`  
* `updated_at`

Rules:

* student number is auto-generated and immutable  
* same-tenant uniqueness enforced on student number and email  
* create, edit, deactivate, reactivate, import, and export supported

### **F3. Users**

Purpose: manage platform users and tenant membership.

User/business fields include:

* `email`  
* `first_name`  
* `last_name`  
* `phone_number`  
* `phone_country_code`  
* `position`  
* `avatar_file_id`  
* address fields  
* status

Rules:

* email is globally unique  
* user can belong to multiple tenants  
* user access depends on tenant membership and assigned tenant-scoped roles

### **F4. Roles & Permissions**

Purpose: manage tenant-scoped roles and module permissions.

Rules:

* roles are tenant-scoped  
* permissions are role-based only  
* no user-level override in v1  
* new roles default to no access  
* supported permission values: `view`, `edit`

### **F5. Foundational Data**

Core maintains tenant-scoped foundational master data for:

* school  
* campus  
* period  
* formation\_type  
* level  
* sector  
* speciality  
* legal\_entity  
* rncp\_title

### **F6. Program Settings**

Core maintains Programs including:

* master program data  
* linked legal entity  
* linked RNCP title  
* linked registration profiles  
* internal/external rates  
* governed CGV file  
* program readiness status

### **F7. Financial Settings**

Core maintains:

* payment modality  
* additional fee  
* registration profile

Registration profile configuration includes:

* name  
* description  
* status  
* payment modalities  
* additional fees  
* perimeters  
* payment methods  
* full rate rule  
* down payment rule  
* cgv document rule

### **F8. Localization**

Tenant-scoped translation management with English as fallback.

---

## **9\. Downstream Integration Scope**

Core v1 explicitly supports internal downstream apps such as Zetta Admission.

### **9.1 Supported Internal Integration Responsibilities**

Core must support:

* assignment-trigger integration when program assignment creates downstream workflow  
* internal master-data read APIs for downstream apps  
* internal command APIs for controlled master-data updates requested by downstream apps  
* internal file upload-init / confirm / read access for Core-owned assets  
* downstream scope resolution for tenant users and program assignments  
* audit trace of cross-app actions

### **9.2 Integration Model**

The intended integration model is:

* downstream apps do **not** become source of truth for Core entities  
* downstream apps may consume Core through internal APIs and/or integration events  
* downstream apps may keep projections and snapshots for operational reads  
* downstream apps must not treat Core DB structure as the long-term contract

### **9.3 Internal Read APIs**

Core should expose internal APIs for downstream use cases such as:

* student summary / detail read  
* user summary / scope read  
* program summary / readiness / assignment read  
* registration profile read  
* financial context read  
* foundational reference data read  
* student detail composition base data read

### **9.4 Internal Command APIs**

Core should expose controlled commands for downstream apps such as:

* update mapped editable student fields after validated downstream submission  
* update Core-owned profile photo reference  
* resolve file access URLs for Core-owned files

### **9.5 Internal Events / Triggers**

Core should support internal trigger/event patterns such as:

* program assigned to student  
* program assignment changed  
* member of admission assignment changed  
* student summary changed  
* program readiness changed

---

## **10\. Shared Student Detail Consumption**

Core provides the master identity layer for a reusable student detail popup used across SAT apps.

### **Rule**

The popup is a shared read surface, not a shared source of truth.

### **Core Responsibilities**

Core must support a composition-friendly student detail contract that exposes:

* student identity summary  
* Core-owned profile photo reference / access  
* optional linked summaries from downstream SAT apps through internal aggregation

### **Recommended Architecture**

Core owns the composition endpoint for student detail popup reads, while downstream apps expose section summaries such as admission follow-up summaries.

---

## **11\. Technical Constraints**

* internal web platform  
* JWT authentication for user login  
* backend-to-backend service authentication for downstream service calls  
* single MongoDB database with logical tenant isolation  
* AWS S3 for file storage  
* time-limited presigned URLs for file read/download  
* stable file references stored in data, not presigned URLs  
* tenant isolation is mandatory

---

## **12\. Security Requirements**

1. All tenant-scoped reads and writes must enforce tenant context.  
2. No tenant may access another tenant’s data.  
3. Role checks must be enforced consistently by module.  
4. Core-owned files must be private and served through time-limited access URLs.  
5. Downstream service calls must use internal service-to-service authentication.  
6. Cross-app commands must record acting user, tenant, and source application context in audit logs.  
7. Downstream apps must only update Core through allowed internal commands.

---

## **13\. Performance Targets**

1. Core list pages remain responsive for daily operational usage.  
2. Internal read APIs remain operationally usable for downstream consumption.  
3. Student import supports partial success with clear error reporting.  
4. File access and export delivery remain secure and tenant-scoped.  
5. Permission checks and tenant isolation must not create visible navigation delays.

---

## **14\. User Flows**

### **Flow 1: Prepare Tenant Core Configuration**

1. Admin logs in.  
2. Admin configures foundational data.  
3. Admin configures financial settings.  
4. Admin configures program settings.  
5. Admin configures roles and localization.  
6. Tenant becomes ready for downstream apps.

### **Flow 2: Create and Maintain Student Master Data**

1. Admin opens Students.  
2. Admin creates or imports student records.  
3. Core generates student number.  
4. Admin updates or deactivates student as needed.

### **Flow 3: Create and Invite Tenant User**

1. Admin opens Users.  
2. Admin creates user.  
3. Core attaches or creates global identity.  
4. Core sends invite.  
5. User sets password.

### **Flow 4: Assign Tenant Role and Access**

1. Admin creates a tenant-scoped role.  
2. Role starts with no access.  
3. Admin grants module permissions.  
4. Admin assigns roles to a tenant user.

### **Flow 5: Trigger Downstream Admission Creation**

1. Admin assigns a program and member of admission to a student in Core.  
2. Core validates assignment.  
3. Core triggers downstream Admission workflow creation through internal contract.  
4. Core records audit context for the cross-app action.

### **Flow 6: Core Receives Controlled Update from Admission**

1. Student completes an admission form in SAT.  
2. SAT submits allowed mapped editable student field updates to Core.  
3. Core validates the command.  
4. Core updates student master data and Core-owned file references where applicable.  
5. Core records audit context including source app and acting user.

---

## **15\. Risks & Mitigations**

| Risk | Impact | Mitigation |
| ----- | ----- | ----- |
| Downstream app becomes coupled to Core DB | High | Use internal APIs/events/contracts as intended integration boundary |
| Core-owned files are stored in downstream storage | High | Enforce file ownership by business owner entity |
| Cross-app actions lack audit clarity | High | Record acting user, tenant, source app, and action context |
| Tenant leakage through downstream integration | Critical | Enforce tenant context on every internal read/write |
| Role scope drift across apps | High | Core remains source of truth for user scope and assignments |
| Stored presigned URLs expire and break data | High | Store stable file references only |

---

## **16\. Decisions Locked**

1. Core is the source of truth for tenant master data and governance.  
2. Core also provides internal integration contracts for downstream apps in v1.  
3. Downstream apps may keep projections and snapshots, but do not own Core entities.  
4. Core-owned files remain in Core-owned storage.  
5. Stable file references are stored in data; presigned URLs are generated on demand.  
6. JWT is used for user login.  
7. Backend-to-backend auth is required for downstream service calls.  
8. Tenant isolation through `tenant_id` is mandatory.  
9. Roles are tenant-scoped and permission-driven.  
10. Cross-app actions must be auditable.

---

