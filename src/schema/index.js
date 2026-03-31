// *************** IMPORT LIBRARY ***************
const { gql } = require('graphql-tag');

// *************** IMPORT TYPE DEFINITIONS ***************
const tenantTypeDefs = require('../features/tenants/tenant.typedef');
const tenantMemberTypeDefs = require('../features/tenant_members/tenant_member.typedef');
const userTypeDefs = require('../features/users/user.typedef');
const roleTypeDefs = require('../features/roles/role.typedef');
const studentTypeDefs = require('../features/students/student.typedef');
const schoolTypeDefs = require('../features/foundational_data/schools/school.typedef');
const campusTypeDefs = require('../features/foundational_data/campuses/campus.typedef');
const periodTypeDefs = require('../features/foundational_data/periods/period.typedef');
const levelTypeDefs = require('../features/foundational_data/levels/level.typedef');
const sectorTypeDefs = require('../features/foundational_data/sectors/sector.typedef');
const specialityTypeDefs = require('../features/foundational_data/specialities/speciality.typedef');
const legalEntityTypeDefs = require('../features/foundational_data/legal_entities/legal_entity.typedef');
const formationTypeTypeDefs = require('../features/foundational_data/formation_types/formation_type.typedef');
const rncpTitleTypeDefs = require('../features/foundational_data/rncp_titles/rncp_title.typedef');
const programTypeDefs = require('../features/programs/program.typedef');
const paymentModalityTypeDefs = require('../features/financial_settings/payment_modalities/payment_modality.typedef');
const additionalFeeTypeDefs = require('../features/financial_settings/additional_fees/additional_fee.typedef');
const registrationProfileTypeDefs = require('../features/financial_settings/registration_profiles/registration_profile.typedef');
const localizationTypeDefs = require('../features/localization/localization.typedef');

// *************** IMPORT INTERNAL API TYPE DEFINITIONS ***************
const internalReadTypeDefs = require('../internal_api/read/internal_read.typedef');
const internalCommandTypeDefs = require('../internal_api/commands/internal_command.typedef');

// *************** BASE SCHEMA ***************
// *************** Base type definitions — all features extend these
const baseTypeDefs = gql`
  scalar JSON

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

// *************** MERGED SCHEMA ***************
const typeDefs = [
  baseTypeDefs,
  tenantTypeDefs,
  tenantMemberTypeDefs,
  userTypeDefs,
  roleTypeDefs,
  studentTypeDefs,
  schoolTypeDefs,
  campusTypeDefs,
  periodTypeDefs,
  levelTypeDefs,
  sectorTypeDefs,
  specialityTypeDefs,
  legalEntityTypeDefs,
  formationTypeTypeDefs,
  rncpTitleTypeDefs,
  programTypeDefs,
  paymentModalityTypeDefs,
  additionalFeeTypeDefs,
  registrationProfileTypeDefs,
  localizationTypeDefs,
  internalReadTypeDefs,
  internalCommandTypeDefs,
];

// *************** EXPORT MODULE ***************
module.exports = { typeDefs };
