// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** PAYMENT MODALITY SCHEMA ***************

const paymentModalitySchema = new mongoose.Schema(
  {
    // *************** Tenant scope
    tenant_id: { type: String, required: true, index: true },

    // *************** Display name of this payment modality
    name: { type: String, required: true },

    // *************** Accepted payment methods for this modality (e.g. ['card', 'bank_transfer'])
    payment_methods: { type: [String], default: [] },

    // *************** Scheduled payment installments with percentage breakdown
    installments: [
      {
        // *************** Percentage of total this installment represents (0-100)
        percentage: { type: Number, required: true },
        // *************** Number of days from enrollment when this installment is due
        due_days: { type: Number, default: null },
      },
    ],

    // *************** Optional flat fee charged for using this modality
    modality_fee: { type: Number, default: null },

    // *************** Currency code (e.g. 'EUR', 'USD')
    currency: { type: String, default: 'EUR' },

    // *************** Lifecycle status
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },

    // *************** Soft-delete timestamp
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'payment_modalities',
  }
);

paymentModalitySchema.index({ name: 1, tenant_id: 1 }, { unique: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.models.PaymentModality || mongoose.model('PaymentModality', paymentModalitySchema);
