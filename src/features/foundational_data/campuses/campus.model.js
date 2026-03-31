// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** CAMPUS SCHEMA ***************

const campusSchema = new mongoose.Schema(
  {
    // *************** Tenant scope
    tenant_id: { type: String, required: true, index: true },

    // *************** Campus display name
    name: { type: String, required: true },

    // *************** Parent school reference
    school_id: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },

    // *************** Structured address
    address: {
      street: { type: String, default: null },
      zip_code: { type: String, default: null },
      city: { type: String, default: null },
      country: { type: String, default: null },
    },

    // *************** Lifecycle status
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },

    // *************** Soft-delete timestamp
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'campuses',
  }
);

campusSchema.index({ name: 1, tenant_id: 1 }, { unique: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.models.Campus || mongoose.model('Campus', campusSchema);
