// *************** IMPORT LIBRARY ***************
const { gql } = require('graphql-tag');

// *************** TYPE DEFINITIONS ***************

const tenantTypeDefs = gql`
  type Tenant {
    _id: ID!
    name: String!
    slug: String!
    status: String!
    settings: TenantSettings
    created_at: String
    updated_at: String
  }

  type TenantSettings {
    logo_s3_key: String
    primary_color: String
    custom_domain: String
  }

  input CreateTenantInput {
    name: String!
    slug: String!
    status: String
    settings: TenantSettingsInput
  }

  input UpdateTenantInput {
    name: String
    status: String
    settings: TenantSettingsInput
  }

  input TenantSettingsInput {
    logo_s3_key: String
    primary_color: String
    custom_domain: String
  }

  extend type Query {
    getTenant(id: ID!): Tenant
    getTenants(page: Int, limit: Int): TenantListResult!
  }

  extend type Mutation {
    createTenant(input: CreateTenantInput!): Tenant!
    updateTenant(id: ID!, input: UpdateTenantInput!): Tenant!
    deactivateTenant(id: ID!): Tenant!
  }

  type TenantListResult {
    data: [Tenant!]!
    total: Int!
    page: Int!
    limit: Int!
  }
`;

// *************** EXPORT MODULE ***************
module.exports = tenantTypeDefs;
