// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** TENANT SCHEMA ***************

const tenantSchema = new mongoose.Schema(
  {
    // *************** Display name of the tenant (e.g. 'ISCOD Paris')
    name: { type: String, required: true },

    // *************** URL-friendly identifier used for subdomain/header-based tenant resolution
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },

    // *************** Operational status of the tenant
    status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' },

    // *************** Branding and platform configuration
    settings: {
      // *************** S3 key of the tenant logo (not a URL)
      logo_s3_key: { type: String, default: null },
      // *************** Primary brand color (hex)
      primary_color: { type: String, default: null },
      // *************** Optional custom domain for this tenant
      custom_domain: { type: String, default: null },
    },

    // *************** Soft-delete timestamp — null means active
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'tenants',
  }
);

// *************** EXPORT MODULE ***************
module.exports = mongoose.models.Tenant || mongoose.model('Tenant', tenantSchema);
