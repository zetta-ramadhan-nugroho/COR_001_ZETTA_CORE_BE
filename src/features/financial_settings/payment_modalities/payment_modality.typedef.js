// *************** IMPORT LIBRARY ***************
const { gql } = require('graphql-tag');

const paymentModalityTypeDefs = gql`
  type PaymentModality {
    _id: ID!
    tenant_id: String!
    name: String!
    payment_methods: [String!]
    installments: [Installment!]
    modality_fee: Float
    currency: String!
    status: String!
    deleted_at: String
    created_at: String
    updated_at: String
  }

  type Installment {
    percentage: Float!
    due_days: Int
  }

  type PaymentModalityListResult {
    data: [PaymentModality!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input CreatePaymentModalityInput {
    name: String!
    payment_methods: [String!]
    installments: [InstallmentInput!]
    modality_fee: Float
    currency: String
  }

  input UpdatePaymentModalityInput {
    name: String
    payment_methods: [String!]
    installments: [InstallmentInput!]
    modality_fee: Float
    currency: String
    status: String
  }

  input InstallmentInput {
    percentage: Float!
    due_days: Int
  }

  extend type Query {
    getPaymentModality(id: ID!): PaymentModality
    getPaymentModalities(page: Int, limit: Int): PaymentModalityListResult!
  }

  extend type Mutation {
    createPaymentModality(input: CreatePaymentModalityInput!): PaymentModality!
    updatePaymentModality(id: ID!, input: UpdatePaymentModalityInput!): PaymentModality!
    deletePaymentModality(id: ID!): Boolean!
  }
`;

module.exports = paymentModalityTypeDefs;
