// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** PERIOD SCHEMA ***************

const periodSchema = new mongoose.Schema(
  {
    // *************** Tenant scope
    tenant_id: { type: String, required: true, index: true },

    // *************** Period display name (e.g. '2024-2025')
    name: { type: String, required: true },

    // *************** Academic period start date
    start_date: { type: Date, default: null },

    // *************** Academic period end date
    end_date: { type: Date, default: null },

    // *************** Lifecycle status
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },

    // *************** Soft-delete timestamp
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'periods',
  }
);

periodSchema.index({ name: 1, tenant_id: 1 }, { unique: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.models.Period || mongoose.model('Period', periodSchema);
