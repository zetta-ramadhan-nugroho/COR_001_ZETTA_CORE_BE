// *************** IMPORT LIBRARY ***************
const { gql } = require('graphql-tag');

const legalEntityTypeDefs = gql`
  type LegalEntity {
    _id: ID!
    tenant_id: String!
    name: String!
    siret: String
    registration_number: String
    iban: String
    bic: String
    account_holder_name: String
    address: FoundationalAddress
    status: String!
    deleted_at: String
    created_at: String
    updated_at: String
  }

  type LegalEntityListResult {
    data: [LegalEntity!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input CreateLegalEntityInput {
    name: String!
    siret: String
    registration_number: String
    iban: String
    bic: String
    account_holder_name: String
    address: FoundationalAddressInput
  }

  input UpdateLegalEntityInput {
    name: String
    siret: String
    registration_number: String
    iban: String
    bic: String
    account_holder_name: String
    address: FoundationalAddressInput
    status: String
  }

  extend type Query {
    getLegalEntity(id: ID!): LegalEntity
    getLegalEntities(page: Int, limit: Int): LegalEntityListResult!
  }

  extend type Mutation {
    createLegalEntity(input: CreateLegalEntityInput!): LegalEntity!
    updateLegalEntity(id: ID!, input: UpdateLegalEntityInput!): LegalEntity!
    deleteLegalEntity(id: ID!): Boolean!
  }
`;

module.exports = legalEntityTypeDefs;
