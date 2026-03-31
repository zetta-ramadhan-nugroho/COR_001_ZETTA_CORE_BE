// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** ROLE SCHEMA ***************

const roleSchema = new mongoose.Schema(
  {
    // *************** Tenant scope — every role belongs to exactly one tenant
    tenant_id: { type: String, required: true, index: true },

    // *************** Display name of the role
    name: { type: String, required: true },

    // *************** URL-friendly identifier for this role within the tenant
    slug: { type: String, required: true },

    // *************** Description of what this role is for
    description: { type: String, default: null },

    // *************** Module-level permissions map: { [module]: ['view', 'edit'] }
    // *************** New roles default to no access — must be explicitly granted
    permissions: {
      type: Map,
      of: [String],
      default: {},
    },

    // *************** Whether this is a system-defined role (non-editable)
    is_system: { type: Boolean, default: false },

    // *************** Soft-delete timestamp — null means active
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'roles',
  }
);

// *************** Slug must be unique within a tenant
roleSchema.index({ slug: 1, tenant_id: 1 }, { unique: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.models.Role || mongoose.model('Role', roleSchema);
