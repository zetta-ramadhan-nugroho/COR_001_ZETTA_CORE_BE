// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** STUDENT SCHEMA ***************

const studentSchema = new mongoose.Schema(
  {
    // *************** Tenant scope — all student queries must be scoped to this field
    tenant_id: { type: String, required: true, index: true },

    // *************** Auto-generated sequential number (format: A######) — immutable once set
    student_number: { type: String, default: null },

    // *************** S3 key of the student's profile photo — generate presigned URL on demand
    photo_s3_key: { type: String, default: null },

    // *************** Civility (title) — MR or MRS
    civility: { type: String, enum: ['MR', 'MRS', null], default: null },

    // *************** Student's last name
    last_name: { type: String, required: true },

    // *************** Student's first name
    first_name: { type: String, required: true },

    // *************** Date of birth
    date_of_birth: { type: Date, default: null },

    // *************** Place (city) of birth
    place_of_birth: { type: String, default: null },

    // *************** Nationality
    nationality: { type: String, default: null },

    // *************** Phone number digits only
    phone_number: { type: String, default: null },

    // *************** ISO country code for the phone number (e.g. 'FR', 'US')
    phone_country_code: { type: String, default: null },

    // *************** Email address — unique per tenant
    email: { type: String, required: true, lowercase: true, trim: true },

    // *************** Optional link to a platform User account
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // *************** International Bank Account Number
    iban: { type: String, default: null },

    // *************** Bank Identifier Code
    bic: { type: String, default: null },

    // *************** Bank account holder name
    account_holder_name: { type: String, default: null },

    // *************** Structured address
    address: {
      address: { type: String, default: null },
      country: { type: String, default: null },
      zip_code: { type: String, default: null },
      city: { type: String, default: null },
      department: { type: String, default: null },
      region: { type: String, default: null },
    },

    // *************** Lifecycle status
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },

    // *************** Soft-delete timestamp — null means active
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'students',
  }
);

// *************** Email and student_number are unique within a tenant, not globally
studentSchema.index({ email: 1, tenant_id: 1 }, { unique: true });
studentSchema.index({ student_number: 1, tenant_id: 1 }, { unique: true, sparse: true });

// *************** EXPORT MODULE ***************
module.exports = mongoose.models.Student || mongoose.model('Student', studentSchema);
