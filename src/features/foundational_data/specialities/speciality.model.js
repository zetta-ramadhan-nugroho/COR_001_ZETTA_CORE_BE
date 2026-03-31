// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** SPECIALITY SCHEMA ***************

const specialitySchema = new mongoose.Schema(
  {
    // *************** Tenant scope
    tenant_id: { type: String, required: true, index: true },

    // *************** Speciality display name
    name: { type: String, required: true },

    // *************** Short code identifier
    code: { type: String, default: null },

    // *************** Parent sector reference
    sector_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sector', default: null },

    // *************** Lifecycle status
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },

    // *************** Soft-delete timestamp
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'specialities',
  }
);

specialitySchema.index({ name: 1, tenant_id: 1 }, { unique: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.models.Speciality || mongoose.model('Speciality', specialitySchema);
