// *************** IMPORT LIBRARY ***************
const { gql } = require('graphql-tag');

const campusTypeDefs = gql`
  type Campus {
    _id: ID!
    tenant_id: String!
    name: String!
    school_id: ID
    address: FoundationalAddress
    status: String!
    deleted_at: String
    created_at: String
    updated_at: String
  }

  type CampusListResult {
    data: [Campus!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input CreateCampusInput {
    name: String!
    school_id: ID
    address: FoundationalAddressInput
  }

  input UpdateCampusInput {
    name: String
    school_id: ID
    address: FoundationalAddressInput
    status: String
  }

  extend type Query {
    getCampus(id: ID!): Campus
    getCampuses(page: Int, limit: Int): CampusListResult!
  }

  extend type Mutation {
    createCampus(input: CreateCampusInput!): Campus!
    updateCampus(id: ID!, input: UpdateCampusInput!): Campus!
    deleteCampus(id: ID!): Boolean!
  }
`;

module.exports = campusTypeDefs;
