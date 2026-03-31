// *************** IMPORT LIBRARY ***************
const { gql } = require('graphql-tag');

const tenantMemberTypeDefs = gql`
  type TenantMember {
    _id: ID!
    user_id: ID!
    tenant_id: String!
    status: String!
    created_at: String
    updated_at: String
  }

  extend type Query {
    getTenantMembers(page: Int, limit: Int): TenantMemberListResult!
  }

  type TenantMemberListResult {
    data: [TenantMember!]!
    total: Int!
    page: Int!
    limit: Int!
  }
`;

module.exports = tenantMemberTypeDefs;
