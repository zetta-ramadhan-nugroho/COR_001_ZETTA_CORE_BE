// *************** IMPORT LIBRARY ***************
const { gql } = require('graphql-tag');

// *************** TYPE DEFINITIONS ***************

const programTypeDefs = gql`
  type Program {
    _id: ID!
    tenant_id: String!
    name: String!
    description: String
    formation_type_id: ID
    period_id: ID
    school_id: ID
    campus_id: ID
    level_id: ID
    sector_id: ID
    speciality_id: ID
    legal_entity_id: ID
    rncp_title_id: ID
    registration_profile_ids: [ID!]
    status: String!
    cgv_s3_key: String
    down_payment_internal: Float
    down_payment_external: Float
    full_rate_internal: Float
    full_rate_external: Float
    created_by: ID
    deleted_at: String
    created_at: String
    updated_at: String
  }

  type ProgramListResult {
    data: [Program!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input ProgramFiltersInput {
    status: String
    school_id: ID
    period_id: ID
    search: String
  }

  input CreateProgramInput {
    name: String!
    description: String
    formation_type_id: ID
    period_id: ID
    school_id: ID
    campus_id: ID
    level_id: ID
    sector_id: ID
    speciality_id: ID
    legal_entity_id: ID
    rncp_title_id: ID
    registration_profile_ids: [ID!]
    status: String
    down_payment_internal: Float
    down_payment_external: Float
    full_rate_internal: Float
    full_rate_external: Float
  }

  input UpdateProgramInput {
    name: String
    description: String
    formation_type_id: ID
    period_id: ID
    school_id: ID
    campus_id: ID
    level_id: ID
    sector_id: ID
    speciality_id: ID
    legal_entity_id: ID
    rncp_title_id: ID
    registration_profile_ids: [ID!]
    status: String
    cgv_s3_key: String
    down_payment_internal: Float
    down_payment_external: Float
    full_rate_internal: Float
    full_rate_external: Float
  }

  extend type Query {
    getProgram(id: ID!): Program
    getPrograms(filters: ProgramFiltersInput, page: Int, limit: Int): ProgramListResult!
  }

  extend type Mutation {
    createProgram(input: CreateProgramInput!): Program!
    updateProgram(id: ID!, input: UpdateProgramInput!): Program!
    deactivateProgram(id: ID!): Program!
    assignProgramToStudent(student_id: ID!, program_id: ID!, member_of_admission_id: ID): Boolean!
  }
`;

// *************** EXPORT MODULE ***************
module.exports = programTypeDefs;
