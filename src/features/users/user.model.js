// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** USER SCHEMA ***************

const userSchema = new mongoose.Schema(
  {
    // *************** Globally unique email address — used for login identity
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },

    // *************** Bcrypt-hashed password — null for pending users until set
    password_hash: { type: String, default: null },

    // *************** First name
    first_name: { type: String, default: null },

    // *************** Last name
    last_name: { type: String, default: null },

    // *************** Phone number (digits only, no prefix)
    phone_number: { type: String, default: null },

    // *************** ISO country code for phone (e.g. 'FR', 'US')
    phone_country_code: { type: String, default: null },

    // *************** Job title or position
    position: { type: String, default: null },

    // *************** S3 key of the user's avatar — generate presigned URL on demand
    avatar_s3_key: { type: String, default: null },

    // *************** Structured address
    address: {
      street: { type: String, default: null },
      zip_code: { type: String, default: null },
      city: { type: String, default: null },
      department: { type: String, default: null },
      region: { type: String, default: null },
    },

    // *************** Account lifecycle status
    status: { type: String, enum: ['active', 'pending', 'inactive'], default: 'pending' },

    // *************** One-time token for password reset or initial setup
    reset_key: { type: String, default: null },

    // *************** Expiry timestamp for the reset key
    reset_key_expires: { type: Date, default: null },

    // *************** Soft-delete timestamp — null means active
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'users',
  }
);

// *************** EXPORT MODULE ***************
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
