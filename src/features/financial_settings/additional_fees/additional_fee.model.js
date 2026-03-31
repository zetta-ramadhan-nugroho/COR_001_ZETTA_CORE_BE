// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** ADDITIONAL FEE SCHEMA ***************

const additionalFeeSchema = new mongoose.Schema(
  {
    // *************** Tenant scope
    tenant_id: { type: String, required: true, index: true },

    // *************** Display name of the additional fee
    name: { type: String, required: true },

    // *************** Fee amount
    amount: { type: Number, required: true },

    // *************** Currency code (e.g. 'EUR', 'USD')
    currency: { type: String, default: 'EUR' },

    // *************** Optional description of what this fee covers
    description: { type: String, default: null },

    // *************** Lifecycle status
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },

    // *************** Soft-delete timestamp
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'additional_fees',
  }
);

additionalFeeSchema.index({ name: 1, tenant_id: 1 }, { unique: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.models.AdditionalFee || mongoose.model('AdditionalFee', additionalFeeSchema);
