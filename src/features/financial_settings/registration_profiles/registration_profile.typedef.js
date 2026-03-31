// *************** IMPORT LIBRARY ***************
const { gql } = require('graphql-tag');

const registrationProfileTypeDefs = gql`
  type RegistrationProfile {
    _id: ID!
    tenant_id: String!
    name: String!
    description: String
    status: String!
    payment_modality_ids: [ID!]
    additional_fee_ids: [ID!]
    perimeters: [String!]
    payment_methods: [String!]
    full_rate_rule: FullRateRule
    down_payment_rule: DownPaymentRule
    cgv_document_rule: CgvDocumentRule
    deleted_at: String
    created_at: String
    updated_at: String
  }

  type FullRateRule {
    type: String
    adjustment_type: String
    adjustment_method: String
    adjustment_value: Float
    new_rate_value: Float
  }

  type DownPaymentRule {
    type: String
    adjustment_type: String
    adjustment_method: String
    adjustment_value: Float
    new_payment_value: Float
  }

  type CgvDocumentRule {
    type: String
    profile_cgv_s3_key: String
  }

  type RegistrationProfileListResult {
    data: [RegistrationProfile!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input CreateRegistrationProfileInput {
    name: String!
    description: String
    payment_modality_ids: [ID!]
    additional_fee_ids: [ID!]
    perimeters: [String!]
    payment_methods: [String!]
    full_rate_rule: FullRateRuleInput
    down_payment_rule: DownPaymentRuleInput
    cgv_document_rule: CgvDocumentRuleInput
  }

  input UpdateRegistrationProfileInput {
    name: String
    description: String
    status: String
    payment_modality_ids: [ID!]
    additional_fee_ids: [ID!]
    perimeters: [String!]
    payment_methods: [String!]
    full_rate_rule: FullRateRuleInput
    down_payment_rule: DownPaymentRuleInput
    cgv_document_rule: CgvDocumentRuleInput
  }

  input FullRateRuleInput {
    type: String
    adjustment_type: String
    adjustment_method: String
    adjustment_value: Float
    new_rate_value: Float
  }

  input DownPaymentRuleInput {
    type: String
    adjustment_type: String
    adjustment_method: String
    adjustment_value: Float
    new_payment_value: Float
  }

  input CgvDocumentRuleInput {
    type: String
    profile_cgv_s3_key: String
  }

  extend type Query {
    getRegistrationProfile(id: ID!): RegistrationProfile
    getRegistrationProfiles(page: Int, limit: Int): RegistrationProfileListResult!
  }

  extend type Mutation {
    createRegistrationProfile(input: CreateRegistrationProfileInput!): RegistrationProfile!
    updateRegistrationProfile(id: ID!, input: UpdateRegistrationProfileInput!): RegistrationProfile!
    deleteRegistrationProfile(id: ID!): Boolean!
  }
`;

module.exports = registrationProfileTypeDefs;
