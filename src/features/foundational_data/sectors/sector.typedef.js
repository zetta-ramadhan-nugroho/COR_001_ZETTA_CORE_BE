// *************** IMPORT LIBRARY ***************
const { gql } = require('graphql-tag');

const sectorTypeDefs = gql`
  type Sector {
    _id: ID!
    tenant_id: String!
    name: String!
    code: String
    status: String!
    deleted_at: String
    created_at: String
    updated_at: String
  }

  type SectorListResult {
    data: [Sector!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input CreateSectorInput {
    name: String!
    code: String
  }

  input UpdateSectorInput {
    name: String
    code: String
    status: String
  }

  extend type Query {
    getSector(id: ID!): Sector
    getSectors(page: Int, limit: Int): SectorListResult!
  }

  extend type Mutation {
    createSector(input: CreateSectorInput!): Sector!
    updateSector(id: ID!, input: UpdateSectorInput!): Sector!
    deleteSector(id: ID!): Boolean!
  }
`;

module.exports = sectorTypeDefs;
