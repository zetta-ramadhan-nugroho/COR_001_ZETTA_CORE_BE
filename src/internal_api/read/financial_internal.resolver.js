// *************** IMPORT MODEL ***************
const SchoolModel = require('../../features/foundational_data/schools/school.model');
const CampusModel = require('../../features/foundational_data/campuses/campus.model');
const PeriodModel = require('../../features/foundational_data/periods/period.model');
const LevelModel = require('../../features/foundational_data/levels/level.model');
const SectorModel = require('../../features/foundational_data/sectors/sector.model');
const SpecialityModel = require('../../features/foundational_data/specialities/speciality.model');
const LegalEntityModel = require('../../features/foundational_data/legal_entities/legal_entity.model');
const FormationTypeModel = require('../../features/foundational_data/formation_types/formation_type.model');
const RncpTitleModel = require('../../features/foundational_data/rncp_titles/rncp_title.model');

// *************** IMPORT UTILITIES ***************
const { HandleGraphQLError, AppError } = require('../../core/error');
const { VerifyServiceAuth } = require('../../middlewares/auth/service_auth.middleware');
const { buildTenantQuery } = require('../../shared/utils/tenant_guard');

// *************** INTERNAL QUERY ***************

/**
 * Returns all foundational reference data for a tenant in a single bundle.
 * Used by downstream apps to populate form selectors and references.
 * SERVICE-AUTH REQUIRED.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { tenant_id }
 * @param {Object} context - GraphQL context
 * @returns {Promise<Object>} FoundationalDataBundle
 */
async function internal_getFoundationalData(_, args, context) {
  try {
    VerifyServiceAuth(context);

    const tenant_id = args.tenant_id;
    if (!tenant_id) throw new AppError('tenant_id is required.', 'MISSING_TENANT', 400);

    const baseQuery = buildTenantQuery(tenant_id);

    // *************** Fetch all foundational data in parallel
    const [schools, campuses, periods, levels, sectors, specialities, legal_entities, formation_types, rncp_titles] =
      await Promise.all([
        SchoolModel.find(baseQuery).lean(),
        CampusModel.find(baseQuery).lean(),
        PeriodModel.find(baseQuery).lean(),
        LevelModel.find(baseQuery).sort({ rank: 1 }).lean(),
        SectorModel.find(baseQuery).lean(),
        SpecialityModel.find(baseQuery).lean(),
        LegalEntityModel.find(baseQuery).lean(),
        FormationTypeModel.find(baseQuery).lean(),
        RncpTitleModel.find(baseQuery).lean(),
      ]);

    return {
      schools,
      campuses,
      periods,
      levels,
      sectors,
      specialities,
      legal_entities,
      formation_types,
      rncp_titles,
    };
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: { internal_getFoundationalData },
};
