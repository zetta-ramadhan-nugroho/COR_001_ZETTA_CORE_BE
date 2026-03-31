// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** LEVEL SCHEMA ***************

const levelSchema = new mongoose.Schema(
  {
    // *************** Tenant scope
    tenant_id: { type: String, required: true, index: true },

    // *************** Level display name (e.g. 'Bachelor', 'Master')
    name: { type: String, required: true },

    // *************** Numeric ranking for ordering (e.g. 3 for Bachelor, 5 for Master)
    rank: { type: Number, default: null },

    // *************** Lifecycle status
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },

    // *************** Soft-delete timestamp
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'levels',
  }
);

levelSchema.index({ name: 1, tenant_id: 1 }, { unique: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.models.Level || mongoose.model('Level', levelSchema);
