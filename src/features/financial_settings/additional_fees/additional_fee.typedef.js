// *************** IMPORT LIBRARY ***************
const { gql } = require('graphql-tag');

const additionalFeeTypeDefs = gql`
  type AdditionalFee {
    _id: ID!
    tenant_id: String!
    name: String!
    amount: Float!
    currency: String!
    description: String
    status: String!
    deleted_at: String
    created_at: String
    updated_at: String
  }

  type AdditionalFeeListResult {
    data: [AdditionalFee!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input CreateAdditionalFeeInput {
    name: String!
    amount: Float!
    currency: String
    description: String
  }

  input UpdateAdditionalFeeInput {
    name: String
    amount: Float
    currency: String
    description: String
    status: String
  }

  extend type Query {
    getAdditionalFee(id: ID!): AdditionalFee
    getAdditionalFees(page: Int, limit: Int): AdditionalFeeListResult!
  }

  extend type Mutation {
    createAdditionalFee(input: CreateAdditionalFeeInput!): AdditionalFee!
    updateAdditionalFee(id: ID!, input: UpdateAdditionalFeeInput!): AdditionalFee!
    deleteAdditionalFee(id: ID!): Boolean!
  }
`;

module.exports = additionalFeeTypeDefs;
