// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** REGISTRATION PROFILE SCHEMA ***************

const registrationProfileSchema = new mongoose.Schema(
  {
    // *************** Tenant scope
    tenant_id: { type: String, required: true, index: true },

    // *************** Profile display name
    name: { type: String, required: true },

    // *************** Optional description
    description: { type: String, default: null },

    // *************** Lifecycle status
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },

    // *************** Linked payment modalities
    payment_modality_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PaymentModality' }],

    // *************** Linked additional fees
    additional_fee_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AdditionalFee' }],

    // *************** Perimeter scopes (e.g. ['initial', 'continuous'])
    perimeters: { type: [String], default: [] },

    // *************** Accepted payment methods (e.g. ['card', 'bank_transfer', 'check'])
    payment_methods: { type: [String], default: [] },

    // *************** Full-rate pricing rule configuration
    full_rate_rule: {
      // *************** Rule type: 'use_program' | 'new_full_rate' | 'no_full_rate'
      type: { type: String, default: null },
      // *************** Adjustment direction: 'none' | 'discount' | 'increase'
      adjustment_type: { type: String, default: null },
      // *************** Adjustment method: 'percentage' | 'fixed'
      adjustment_method: { type: String, default: null },
      // *************** Amount of the adjustment
      adjustment_value: { type: Number, default: null },
      // *************** Explicit new rate if type is 'new_full_rate'
      new_rate_value: { type: Number, default: null },
    },

    // *************** Down-payment pricing rule configuration
    down_payment_rule: {
      // *************** Rule type: 'use_program' | 'new_down_payment' | 'no_down_payment' | 'sum_of_fees'
      type: { type: String, default: null },
      // *************** Adjustment direction: 'none' | 'discount' | 'increase'
      adjustment_type: { type: String, default: null },
      // *************** Adjustment method: 'percentage' | 'fixed'
      adjustment_method: { type: String, default: null },
      // *************** Amount of the adjustment
      adjustment_value: { type: Number, default: null },
      // *************** Explicit new payment value if type is 'new_down_payment'
      new_payment_value: { type: Number, default: null },
    },

    // *************** CGV document rule configuration
    cgv_document_rule: {
      // *************** Rule type: 'use_program' | 'use_profile'
      type: { type: String, default: null },
      // *************** S3 key for profile-level CGV document (only set if type is 'use_profile')
      profile_cgv_s3_key: { type: String, default: null },
    },

    // *************** Soft-delete timestamp
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'registration_profiles',
  }
);

registrationProfileSchema.index({ name: 1, tenant_id: 1 }, { unique: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.models.RegistrationProfile || mongoose.model('RegistrationProfile', registrationProfileSchema);
