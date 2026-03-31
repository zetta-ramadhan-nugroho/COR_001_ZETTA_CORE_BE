// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** LEGAL ENTITY SCHEMA ***************

const legalEntitySchema = new mongoose.Schema(
  {
    // *************** Tenant scope
    tenant_id: { type: String, required: true, index: true },

    // *************** Legal entity display name
    name: { type: String, required: true },

    // *************** SIRET number (French business ID)
    siret: { type: String, default: null },

    // *************** General registration number
    registration_number: { type: String, default: null },

    // *************** IBAN for banking
    iban: { type: String, default: null },

    // *************** BIC/SWIFT code
    bic: { type: String, default: null },

    // *************** Bank account holder name
    account_holder_name: { type: String, default: null },

    // *************** Registered address
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
    collection: 'legal_entities',
  }
);

legalEntitySchema.index({ name: 1, tenant_id: 1 }, { unique: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.models.LegalEntity || mongoose.model('LegalEntity', legalEntitySchema);
