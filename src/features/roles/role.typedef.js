// *************** IMPORT LIBRARY ***************
const { gql } = require('graphql-tag');

// *************** TYPE DEFINITIONS ***************

const roleTypeDefs = gql`
  type Role {
    _id: ID!
    tenant_id: String!
    name: String!
    slug: String!
    description: String
    permissions: JSON
    is_system: Boolean!
    deleted_at: String
    created_at: String
    updated_at: String
  }

  type RoleListResult {
    data: [Role!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input CreateRoleInput {
    name: String!
    slug: String!
    description: String
  }

  input UpdateRoleInput {
    name: String
    description: String
  }

  input UpdateRolePermissionsInput {
    permissions: JSON!
  }

  extend type Query {
    getRole(id: ID!): Role
    getRoles(page: Int, limit: Int): RoleListResult!
  }

  extend type Mutation {
    createRole(input: CreateRoleInput!): Role!
    updateRole(id: ID!, input: UpdateRoleInput!): Role!
    updateRolePermissions(id: ID!, input: UpdateRolePermissionsInput!): Role!
    deleteRole(id: ID!): Boolean!
  }
`;

// *************** EXPORT MODULE ***************
module.exports = roleTypeDefs;
