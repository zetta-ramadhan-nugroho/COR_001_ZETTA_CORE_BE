// *************** IMPORT LIBRARY ***************
const { gql } = require('graphql-tag');

// *************** TYPE DEFINITIONS ***************

const studentTypeDefs = gql`
  type Student {
    _id: ID!
    tenant_id: String!
    student_number: String
    photo_s3_key: String
    civility: String
    last_name: String!
    first_name: String!
    date_of_birth: String
    place_of_birth: String
    nationality: String
    phone_number: String
    phone_country_code: String
    email: String!
    iban: String
    bic: String
    account_holder_name: String
    address: StudentAddress
    status: String!
    deleted_at: String
    created_at: String
    updated_at: String
  }

  type StudentAddress {
    address: String
    country: String
    zip_code: String
    city: String
    department: String
    region: String
  }

  type StudentListResult {
    data: [Student!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input StudentFiltersInput {
    status: String
    search: String
  }

  input CreateStudentInput {
    civility: String
    last_name: String!
    first_name: String!
    email: String!
    date_of_birth: String
    place_of_birth: String
    nationality: String
    phone_number: String
    phone_country_code: String
    iban: String
    bic: String
    account_holder_name: String
    address: StudentAddressInput
  }

  input UpdateStudentInput {
    civility: String
    last_name: String
    first_name: String
    date_of_birth: String
    place_of_birth: String
    nationality: String
    phone_number: String
    phone_country_code: String
    iban: String
    bic: String
    account_holder_name: String
    address: StudentAddressInput
    photo_s3_key: String
    status: String
  }

  input StudentAddressInput {
    address: String
    country: String
    zip_code: String
    city: String
    department: String
    region: String
  }

  input ImportStudentInput {
    civility: String
    last_name: String!
    first_name: String!
    email: String!
    date_of_birth: String
    phone_number: String
    phone_country_code: String
  }

  type ImportStudentsResult {
    imported: Int!
    failed: Int!
    errors: [ImportError!]!
  }

  type ImportError {
    row: Int
    email: String
    reason: String
  }

  extend type Query {
    getStudent(id: ID!): Student
    getStudents(filters: StudentFiltersInput, page: Int, limit: Int): StudentListResult!
    checkStudentEmail(email: String!, exclude_id: ID): Boolean!
  }

  extend type Mutation {
    createStudent(input: CreateStudentInput!): Student!
    updateStudent(id: ID!, input: UpdateStudentInput!): Student!
    deactivateStudent(id: ID!): Student!
    reactivateStudent(id: ID!): Student!
    importStudents(students: [ImportStudentInput!]!): ImportStudentsResult!
  }
`;

// *************** EXPORT MODULE ***************
module.exports = studentTypeDefs;
