// *************** IMPORT LIBRARY ***************
const { gql } = require('graphql-tag');

// *************** INTERNAL COMMAND TYPE DEFINITIONS ***************
// *************** All internal_ mutations require service-auth (X-Service-Token header)

const internalCommandTypeDefs = gql`
  input AdmissionStudentUpdateInput {
    civility: String
    first_name: String
    last_name: String
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

  type FileAccessResult {
    presigned_url: String!
    expires_at: String!
  }

  extend type Mutation {
    internal_updateStudentFromAdmission(student_id: ID!, input: AdmissionStudentUpdateInput!): Student!
    internal_updateStudentPhotoRef(student_id: ID!, file_id: String!): Student!
    internal_resolveFileAccessUrl(file_id: String!): FileAccessResult!
  }
`;

// *************** EXPORT MODULE ***************
module.exports = internalCommandTypeDefs;
