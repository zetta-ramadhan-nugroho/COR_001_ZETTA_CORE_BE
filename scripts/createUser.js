/**
 * User Creation Script (ZETTA_CORE/BE Edition)
 *
 * Creates (or upserts) a user in the backend database and prints their _id.
 *
 * Usage:
 *   node scripts/createUser.js
 *
 * Reads MONGODB_URI from the project .env file (ZETTA_CORE/BE/.env).
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// *************** CONFIG ***************

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env');
  process.exit(1);
}

// *************** SCHEMA ***************

const userSchema = new mongoose.Schema({
  // Unique login email
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  // bcrypt-hashed password
  password_hash: { type: String, default: null },
  // Display information
  first_name: { type: String, default: null },
  last_name: { type: String, default: null },
  phone_number: { type: String, default: null },
  phone_country_code: { type: String, default: null },
  position: { type: String, default: null },
  avatar_s3_key: { type: String, default: null },
  // active | pending | inactive
  status: { type: String, enum: ['active', 'pending', 'inactive'], default: 'pending' },
  // Soft delete
  deleted_at: { type: Date, default: null },
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'users'
});

// *************** CLI HELPERS ***************

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

/**
 * Prompts the user for input and returns the answer.
 * @param {string} query
 * @returns {Promise<string>}
 */
const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

/**
 * Like ask() but masks typed characters with * so passwords aren't visible.
 */
function askHidden(query) {
  return new Promise((resolve) => {
    const originalWrite = rl._writeToOutput;
    rl._writeToOutput = (str) => {
      if (str.startsWith(query)) {
        rl.output.write(query);
      } else if (str === '\r\n' || str === '\n' || str === '\r') {
        rl.output.write('\n');
      } else if (str.length > 0) {
        rl.output.write('*'.repeat([...str].length));
      }
    };
    rl.question(query, (answer) => {
      rl._writeToOutput = originalWrite;
      resolve(answer);
    });
  });
}

// *************** MAIN ***************

async function run() {
  try {
    console.log('\n─────────────────────────────────────────');
    console.log('  Zetta Core — User Creation Script (BE)');
    console.log('─────────────────────────────────────────\n');

    const email      = (await ask('Email      : ')).trim().toLowerCase();
    const password   = await askHidden('Password   : ');
    const firstName  = (await ask('First Name : ')).trim();
    const lastName   = (await ask('Last Name  : ')).trim();

    if (!email || !password) {
      console.error('\n❌ Email and password are required.');
      process.exit(1);
    }

    // ── Connect ──────────────────────────────────────────────────────────
    console.log(`\n⏳ Connecting to MongoDB...`);
    await mongoose.connect(MONGODB_URI);
    console.log(`✅ Connected\n`);

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // ── Upsert user ───────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: { 
          password_hash: passwordHash, 
          status: 'active', 
          first_name: firstName, 
          last_name: lastName,
          deleted_at: null
        },
        $setOnInsert: { email }
      },
      { upsert: true, new: true }
    );

    const isNew = !user.created_at || (Date.now() - new Date(user.created_at).getTime() < 5000);

    console.log('─────────────────────────────────────────');
    console.log(`  ${isNew ? '🆕 User created' : '✏️  User updated'}`);
    console.log(`  _id   : ${user._id}`);
    console.log(`  email : ${user.email}`);
    console.log('─────────────────────────────────────────\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();

