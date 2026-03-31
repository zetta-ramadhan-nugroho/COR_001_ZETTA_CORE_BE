// *************** IMPORT LIBRARY ***************
const { gql } = require('graphql-tag');

const specialityTypeDefs = gql`
  type Speciality {
    _id: ID!
    tenant_id: String!
    name: String!
    code: String
    sector_id: ID
    status: String!
    deleted_at: String
    created_at: String
    updated_at: String
  }

  type SpecialityListResult {
    data: [Speciality!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input CreateSpecialityInput {
    name: String!
    code: String
    sector_id: ID
  }

  input UpdateSpecialityInput {
    name: String
    code: String
    sector_id: ID
    status: String
  }

  extend type Query {
    getSpeciality(id: ID!): Speciality
    getSpecialities(page: Int, limit: Int): SpecialityListResult!
  }

  extend type Mutation {
    createSpeciality(input: CreateSpecialityInput!): Speciality!
    updateSpeciality(id: ID!, input: UpdateSpecialityInput!): Speciality!
    deleteSpeciality(id: ID!): Boolean!
  }
`;

module.exports = specialityTypeDefs;
