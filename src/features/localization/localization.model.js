// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** LOCALIZATION SCHEMA ***************

const localizationSchema = new mongoose.Schema(
  {
    // *************** Tenant scope
    tenant_id: { type: String, required: true, index: true },

    // *************** Translation key (e.g. 'students.status.active')
    key: { type: String, required: true },

    // *************** English base value — used as fallback when translation is missing
    en: { type: String, required: true },

    // *************** French translation (optional)
    fr: { type: String, default: null },

    // *************** Map of additional ISO 639-1 language codes to translated values
    translations: {
      type: Map,
      of: String,
      default: {},
    },

    // *************** Soft-delete timestamp
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'localizations',
  }
);

// *************** Key must be unique within a tenant
localizationSchema.index({ key: 1, tenant_id: 1 }, { unique: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.models.Localization || mongoose.model('Localization', localizationSchema);
