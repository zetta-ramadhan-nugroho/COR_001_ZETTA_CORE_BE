// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** RNCP TITLE SCHEMA ***************

const rncpTitleSchema = new mongoose.Schema(
  {
    // *************** Tenant scope
    tenant_id: { type: String, required: true, index: true },

    // *************** RNCP title display name
    name: { type: String, required: true },

    // *************** Official RNCP code (e.g. 'RNCP38596')
    code: { type: String, default: null },

    // *************** European Qualifications Framework level (1-8)
    eqf_level: { type: Number, default: null },

    // *************** Date the RNCP title was officially registered
    registration_date: { type: Date, default: null },

    // *************** Date the RNCP title expires
    expiry_date: { type: Date, default: null },

    // *************** Link to the official France Compétences page
    official_url: { type: String, default: null },

    // *************** Lifecycle status
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },

    // *************** Soft-delete timestamp
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'rncp_titles',
  }
);

rncpTitleSchema.index({ name: 1, tenant_id: 1 }, { unique: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.models.RncpTitle || mongoose.model('RncpTitle', rncpTitleSchema);
