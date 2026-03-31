// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** SCHOOL SCHEMA ***************

const schoolSchema = new mongoose.Schema(
  {
    // *************** Tenant scope
    tenant_id: { type: String, required: true, index: true },

    // *************** School display name
    name: { type: String, required: true },

    // *************** Short code identifier for the school
    code: { type: String, default: null },

    // *************** Structured address
    address: {
      street: { type: String, default: null },
      zip_code: { type: String, default: null },
      city: { type: String, default: null },
      country: { type: String, default: null },
    },

    // *************** S3 key for the school logo
    logo_s3_key: { type: String, default: null },

    // *************** Lifecycle status
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },

    // *************** Soft-delete timestamp
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'schools',
  }
);

schoolSchema.index({ name: 1, tenant_id: 1 }, { unique: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.models.School || mongoose.model('School', schoolSchema);
