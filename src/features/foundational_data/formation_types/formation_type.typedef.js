// *************** IMPORT LIBRARY ***************
const { gql } = require('graphql-tag');

const formationTypeTypeDefs = gql`
  type FormationType {
    _id: ID!
    tenant_id: String!
    name: String!
    code: String
    status: String!
    deleted_at: String
    created_at: String
    updated_at: String
  }

  type FormationTypeListResult {
    data: [FormationType!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input CreateFormationTypeInput {
    name: String!
    code: String
  }

  input UpdateFormationTypeInput {
    name: String
    code: String
    status: String
  }

  extend type Query {
    getFormationType(id: ID!): FormationType
    getFormationTypes(page: Int, limit: Int): FormationTypeListResult!
  }

  extend type Mutation {
    createFormationType(input: CreateFormationTypeInput!): FormationType!
    updateFormationType(id: ID!, input: UpdateFormationTypeInput!): FormationType!
    deleteFormationType(id: ID!): Boolean!
  }
`;

module.exports = formationTypeTypeDefs;
