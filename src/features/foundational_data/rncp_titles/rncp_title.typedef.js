// *************** IMPORT LIBRARY ***************
const { gql } = require('graphql-tag');

const rncpTitleTypeDefs = gql`
  type RncpTitle {
    _id: ID!
    tenant_id: String!
    name: String!
    code: String
    eqf_level: Int
    registration_date: String
    expiry_date: String
    official_url: String
    status: String!
    deleted_at: String
    created_at: String
    updated_at: String
  }

  type RncpTitleListResult {
    data: [RncpTitle!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input CreateRncpTitleInput {
    name: String!
    code: String
    eqf_level: Int
    registration_date: String
    expiry_date: String
    official_url: String
  }

  input UpdateRncpTitleInput {
    name: String
    code: String
    eqf_level: Int
    registration_date: String
    expiry_date: String
    official_url: String
    status: String
  }

  extend type Query {
    getRncpTitle(id: ID!): RncpTitle
    getRncpTitles(page: Int, limit: Int): RncpTitleListResult!
  }

  extend type Mutation {
    createRncpTitle(input: CreateRncpTitleInput!): RncpTitle!
    updateRncpTitle(id: ID!, input: UpdateRncpTitleInput!): RncpTitle!
    deleteRncpTitle(id: ID!): Boolean!
  }
`;

module.exports = rncpTitleTypeDefs;
