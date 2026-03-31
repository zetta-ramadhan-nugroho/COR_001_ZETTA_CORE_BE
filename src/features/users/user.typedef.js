// *************** IMPORT LIBRARY ***************
const { gql } = require('graphql-tag');

// *************** TYPE DEFINITIONS ***************

const userTypeDefs = gql`
  type User {
    _id: ID!
    email: String!
    first_name: String
    last_name: String
    phone_number: String
    phone_country_code: String
    position: String
    avatar_s3_key: String
    address: UserAddress
    status: String!
    role: String
    created_at: String
    updated_at: String
  }

  type UserAddress {
    street: String
    zip_code: String
    city: String
    department: String
    region: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input RegisterInput {
    email: String!
    password: String!
    first_name: String
    last_name: String
  }

  input CreateUserInput {
    email: String!
    first_name: String
    last_name: String
    phone_number: String
    phone_country_code: String
    position: String
    role_id: ID
  }

  input UpdateUserInput {
    first_name: String
    last_name: String
    phone_number: String
    phone_country_code: String
    position: String
    avatar_s3_key: String
    address: UserAddressInput
    status: String
  }

  input UserAddressInput {
    street: String
    zip_code: String
    city: String
    department: String
    region: String
  }

  type UserListResult {
    data: [User!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  extend type Query {
    getMe: User!
    getUser(id: ID!): User
    getUsers(search: String, page: Int, limit: Int): UserListResult!
  }

  extend type Mutation {
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!
    resetPasswordRequest(email: String!): Boolean!
    resetPasswordConfirm(token: String!, password: String!): Boolean!
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deactivateUser(id: ID!): User!
    switchTenant(tenant_id: ID!): AuthPayload!
  }
`;

// *************** EXPORT MODULE ***************
module.exports = userTypeDefs;
