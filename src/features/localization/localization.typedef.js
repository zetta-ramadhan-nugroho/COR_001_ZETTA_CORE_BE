// *************** IMPORT LIBRARY ***************
const { gql } = require('graphql-tag');

const localizationTypeDefs = gql`
  type Localization {
    _id: ID!
    tenant_id: String!
    key: String!
    en: String!
    fr: String
    translations: JSON
    deleted_at: String
    created_at: String
    updated_at: String
  }

  type LocalizationListResult {
    data: [Localization!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input CreateLocalizationInput {
    key: String!
    en: String!
    fr: String
    translations: JSON
  }

  input UpdateLocalizationInput {
    en: String
    fr: String
    translations: JSON
  }

  input BatchSaveLocalizationInput {
    key: String!
    en: String
    fr: String
    translations: JSON
  }

  extend type Query {
    getLocalization(key: String!): Localization
    getLocalizations(page: Int, limit: Int): LocalizationListResult!
  }

  extend type Mutation {
    createLocalization(input: CreateLocalizationInput!): Localization!
    updateLocalization(key: String!, input: UpdateLocalizationInput!): Localization!
    batchSaveLocalizations(items: [BatchSaveLocalizationInput!]!): Boolean!
    deleteLocalization(key: String!): Boolean!
  }
`;

module.exports = localizationTypeDefs;
