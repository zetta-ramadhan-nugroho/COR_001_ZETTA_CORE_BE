// *************** IMPORT LIBRARY ***************
const { gql } = require('graphql-tag');

const schoolTypeDefs = gql`
  type School {
    _id: ID!
    tenant_id: String!
    name: String!
    code: String
    address: FoundationalAddress
    logo_s3_key: String
    status: String!
    deleted_at: String
    created_at: String
    updated_at: String
  }

  type FoundationalAddress {
    street: String
    zip_code: String
    city: String
    country: String
  }

  type SchoolListResult {
    data: [School!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input CreateSchoolInput {
    name: String!
    code: String
    address: FoundationalAddressInput
  }

  input UpdateSchoolInput {
    name: String
    code: String
    address: FoundationalAddressInput
    logo_s3_key: String
    status: String
  }

  input FoundationalAddressInput {
    street: String
    zip_code: String
    city: String
    country: String
  }

  extend type Query {
    getSchool(id: ID!): School
    getSchools(page: Int, limit: Int): SchoolListResult!
  }

  extend type Mutation {
    createSchool(input: CreateSchoolInput!): School!
    updateSchool(id: ID!, input: UpdateSchoolInput!): School!
    deleteSchool(id: ID!): Boolean!
  }
`;

module.exports = schoolTypeDefs;
