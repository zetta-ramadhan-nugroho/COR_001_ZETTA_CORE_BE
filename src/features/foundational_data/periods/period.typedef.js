// *************** IMPORT LIBRARY ***************
const { gql } = require('graphql-tag');

const periodTypeDefs = gql`
  type Period {
    _id: ID!
    tenant_id: String!
    name: String!
    start_date: String
    end_date: String
    status: String!
    deleted_at: String
    created_at: String
    updated_at: String
  }

  type PeriodListResult {
    data: [Period!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input CreatePeriodInput {
    name: String!
    start_date: String
    end_date: String
  }

  input UpdatePeriodInput {
    name: String
    start_date: String
    end_date: String
    status: String
  }

  extend type Query {
    getPeriod(id: ID!): Period
    getPeriods(page: Int, limit: Int): PeriodListResult!
  }

  extend type Mutation {
    createPeriod(input: CreatePeriodInput!): Period!
    updatePeriod(id: ID!, input: UpdatePeriodInput!): Period!
    deletePeriod(id: ID!): Boolean!
  }
`;

module.exports = periodTypeDefs;
