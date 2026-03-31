// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** PROGRAM SCHEMA ***************

const programSchema = new mongoose.Schema(
  {
    // *************** Tenant scope
    tenant_id: { type: String, required: true, index: true },

    // *************** Program display name
    name: { type: String, required: true },

    // *************** Optional description
    description: { type: String, default: null },

    // *************** Formation type reference
    formation_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FormationType', default: null },

    // *************** Academic period reference
    period_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Period', default: null },

    // *************** School reference
    school_id: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },

    // *************** Campus reference
    campus_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus', default: null },

    // *************** Education level reference
    level_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Level', default: null },

    // *************** Industry sector reference
    sector_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sector', default: null },

    // *************** Speciality reference
    speciality_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Speciality', default: null },

    // *************** Legal entity that governs this program
    legal_entity_id: { type: mongoose.Schema.Types.ObjectId, ref: 'LegalEntity', default: null },

    // *************** RNCP title linked to this program
    rncp_title_id: { type: mongoose.Schema.Types.ObjectId, ref: 'RncpTitle', default: null },

    // *************** Registration profiles available for this program
    registration_profile_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RegistrationProfile' }],

    // *************** Publication / readiness status ('draft', 'published', 'archived')
    status: { type: String, default: 'draft' },

    // *************** S3 key of the CGV (General Sales Conditions) document — never store a URL
    cgv_s3_key: { type: String, default: null },

    // *************** Internal student down payment amount (EUR)
    down_payment_internal: { type: Number, default: null },

    // *************** External student down payment amount (EUR)
    down_payment_external: { type: Number, default: null },

    // *************** Internal student full rate (EUR)
    full_rate_internal: { type: Number, default: null },

    // *************** External student full rate (EUR)
    full_rate_external: { type: Number, default: null },

    // *************** User who created this program record
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // *************** Soft-delete timestamp
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'programs',
  }
);

// *************** Program name must be unique within a tenant
programSchema.index({ name: 1, tenant_id: 1 }, { unique: true, sparse: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.models.Program || mongoose.model('Program', programSchema);
