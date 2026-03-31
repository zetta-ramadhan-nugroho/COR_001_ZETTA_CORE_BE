// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** FORMATION TYPE SCHEMA ***************

const formationTypeSchema = new mongoose.Schema(
  {
    // *************** Tenant scope
    tenant_id: { type: String, required: true, index: true },

    // *************** Formation type display name (e.g. 'Initial', 'Continuous', 'Alternance')
    name: { type: String, required: true },

    // *************** Short code identifier
    code: { type: String, default: null },

    // *************** Lifecycle status
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },

    // *************** Soft-delete timestamp
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'formation_types',
  }
);

formationTypeSchema.index({ name: 1, tenant_id: 1 }, { unique: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.models.FormationType || mongoose.model('FormationType', formationTypeSchema);
