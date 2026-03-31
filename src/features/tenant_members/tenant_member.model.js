// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** TENANT MEMBER SCHEMA ***************

const tenantMemberSchema = new mongoose.Schema(
  {
    // *************** Reference to the global user
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // *************** Reference to the tenant this membership belongs to
    tenant_id: { type: String, required: true, index: true },

    // *************** Membership status
    status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' },

    // *************** Soft-delete timestamp — null means active
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'tenant_members',
  }
);

// *************** Ensure a user can only have one active membership per tenant
tenantMemberSchema.index({ user_id: 1, tenant_id: 1 }, { unique: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.models.TenantMember || mongoose.model('TenantMember', tenantMemberSchema);
