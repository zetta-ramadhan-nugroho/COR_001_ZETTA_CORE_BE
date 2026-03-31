// *************** IMPORT LIBRARY ***************
const { gql } = require('graphql-tag');

// *************** INTERNAL READ TYPE DEFINITIONS ***************
// *************** All internal_ queries require service-auth (X-Service-Token header)

const internalReadTypeDefs = gql`
  type StudentSummary {
    _id: ID!
    student_number: String
    civility: String
    first_name: String!
    last_name: String!
    email: String!
    photo_s3_key: String
    status: String!
    tenant_id: String!
  }

  type StudentDetail {
    _id: ID!
    student_number: String
    civility: String
    first_name: String!
    last_name: String!
    email: String!
    photo_s3_key: String
    date_of_birth: String
    place_of_birth: String
    nationality: String
    phone_number: String
    phone_country_code: String
    iban: String
    bic: String
    account_holder_name: String
    address: StudentAddress
    status: String!
    tenant_id: String!
  }

  type ProgramSummary {
    _id: ID!
    name: String!
    status: String!
    tenant_id: String!
    level_id: ID
    school_id: ID
    campus_id: ID
  }

  type ProgramReadiness {
    program_id: ID!
    is_ready: Boolean!
    missing_fields: [String!]!
  }

  type RegistrationProfileSummary {
    _id: ID!
    name: String!
    status: String!
    perimeters: [String!]
    payment_methods: [String!]
  }

  type FinancialContext {
    program_id: ID!
    full_rate_internal: Float
    full_rate_external: Float
    down_payment_internal: Float
    down_payment_external: Float
    registration_profiles: [RegistrationProfileSummary!]!
  }

  type UserScope {
    user_id: ID!
    tenant_id: String!
    role: String
    permissions: JSON
    status: String!
  }

  type FoundationalDataBundle {
    schools: [School!]!
    campuses: [Campus!]!
    periods: [Period!]!
    levels: [Level!]!
    sectors: [Sector!]!
    specialities: [Speciality!]!
    legal_entities: [LegalEntity!]!
    formation_types: [FormationType!]!
    rncp_titles: [RncpTitle!]!
  }

  extend type Query {
    internal_getStudentSummary(student_id: ID!): StudentSummary
    internal_getStudentDetail(student_id: ID!): StudentDetail
    internal_getProgramSummary(program_id: ID!): ProgramSummary
    internal_getProgramReadiness(program_id: ID!): ProgramReadiness!
    internal_getRegistrationProfile(profile_id: ID!): RegistrationProfileSummary
    internal_getFinancialContext(program_id: ID!): FinancialContext
    internal_getUserScope(user_id: ID!, tenant_id: String!): UserScope
    internal_getFoundationalData(tenant_id: String!): FoundationalDataBundle!
  }
`;

// *************** EXPORT MODULE ***************
module.exports = internalReadTypeDefs;
