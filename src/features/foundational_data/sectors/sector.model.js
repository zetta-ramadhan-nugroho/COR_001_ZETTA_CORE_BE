// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** SECTOR SCHEMA ***************

const sectorSchema = new mongoose.Schema(
  {
    // *************** Tenant scope
    tenant_id: { type: String, required: true, index: true },

    // *************** Sector display name (e.g. 'Technology', 'Health')
    name: { type: String, required: true },

    // *************** Short identifier code
    code: { type: String, default: null },

    // *************** Lifecycle status
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },

    // *************** Soft-delete timestamp
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'sectors',
  }
);

sectorSchema.index({ name: 1, tenant_id: 1 }, { unique: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.models.Sector || mongoose.model('Sector', sectorSchema);
