// *************** IMPORT LIBRARY ***************
const { gql } = require('graphql-tag');

const levelTypeDefs = gql`
  type Level {
    _id: ID!
    tenant_id: String!
    name: String!
    rank: Int
    status: String!
    deleted_at: String
    created_at: String
    updated_at: String
  }

  type LevelListResult {
    data: [Level!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input CreateLevelInput {
    name: String!
    rank: Int
  }

  input UpdateLevelInput {
    name: String
    rank: Int
    status: String
  }

  extend type Query {
    getLevel(id: ID!): Level
    getLevels(page: Int, limit: Int): LevelListResult!
  }

  extend type Mutation {
    createLevel(input: CreateLevelInput!): Level!
    updateLevel(id: ID!, input: UpdateLevelInput!): Level!
    deleteLevel(id: ID!): Boolean!
  }
`;

module.exports = levelTypeDefs;
