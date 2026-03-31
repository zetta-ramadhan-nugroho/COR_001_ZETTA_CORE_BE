/**
 * Tenant Creation Script (ZETTA_CORE/BE Edition)
 *
 * Creates a new tenant in the backend database and seeds it with:
 *   - Basic settings
 *   - An "admin" Role with full Map-based permissions
 *   - A TenantMember associating the admin user with the role
 *   - Default localizations
 *
 * Usage:
 *   node scripts/createTenant.js
 *
 * Reads MONGODB_URI from the project .env file (ZETTA_CORE/BE/.env).
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const readline = require('readline');

// *************** CONFIG ***************

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env');
  process.exit(1);
}

// *************** SCHEMAS ***************

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' },
  settings: {
    logo_s3_key: { type: String, default: null },
    primary_color: { type: String, default: null },
    custom_domain: { type: String, default: null },
  },
  deleted_at: { type: Date, default: null },
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'tenants'
});

const tenantMemberSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tenant_id: { type: String, required: true },
  role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', default: null },
  status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' },
  deleted_at: { type: Date, default: null },
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'tenant_members'
});

const roleSchema = new mongoose.Schema({
  tenant_id: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: { type: String, default: null },
  permissions: {
    type: Map,
    of: [String],
    default: {},
  },
  is_system: { type: Boolean, default: false },
  deleted_at: { type: Date, default: null },
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'roles'
});

const localizationSchema = new mongoose.Schema({
  tenant_id: { type: String, required: true },
  key: { type: String, required: true },
  en: { type: String, required: true },
  fr: { type: String, default: null },
  translations: { type: Map, of: String, default: {} },
  deleted_at: { type: Date, default: null },
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'localizations'
});

// *************** PERMISSIONS MAP ***************

const ADMIN_PERMISSIONS = {
  students: ['view', 'edit'],
  users: ['view', 'edit'],
  roles: ['view', 'edit'],
  tenants: ['view', 'edit'],
  tenant_members: ['view', 'edit'],
  foundational_data: ['view', 'edit'],
  programs: ['view', 'edit'],
  financial_settings: ['view', 'edit'],
  localization: ['view', 'edit'],
};

// *************** CLI HELPERS ***************

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

// *************** MAIN ***************

async function run() {
  try {
    console.log('\n─────────────────────────────────────────');
    console.log('  Zetta Core — Tenant Creation Script (BE)');
    console.log(`─────────────────────────────────────────\n`);

    const name   = (await ask('Tenant Name  : ')).trim();
    const slug   = (await ask('Tenant Slug  : ')).trim().toLowerCase();
    const userId = (await ask('Admin User ID: ')).trim();

    if (!name || !slug || !userId) {
      console.error('\n❌ All fields are required.');
      process.exit(1);
    }

    // ── Connect ──────────────────────────────────────────────────────────
    console.log(`\n⏳ Connecting to MongoDB...`);
    await mongoose.connect(MONGODB_URI);
    console.log(`✅ Connected\n`);

    const Tenant       = mongoose.models.Tenant       || mongoose.model('Tenant',       tenantSchema);
    const TenantMember = mongoose.models.TenantMember || mongoose.model('TenantMember', tenantMemberSchema);
    const Role         = mongoose.models.Role         || mongoose.model('Role',         roleSchema);
    const Localization = mongoose.models.Localization || mongoose.model('Localization', localizationSchema);

    // ── 1. Create Tenant ─────────────────────────────────────────────────
    console.log(`⏳ Creating tenant "${slug}"...`);
    let tenant = await Tenant.findOne({ slug, deleted_at: null });
    if (tenant) {
      console.log(`ℹ️  A tenant with slug "${slug}" already exists (ID: ${tenant._id}). Continuing...`);
    } else {
      tenant = await Tenant.create({ name, slug, status: 'active' });
      console.log(`✅ Tenant created → ${tenant._id}`);
    }
    const tenantId = tenant._id.toString();

    // ── 2. Create "admin" Role ───────────────────────────────────────────
    console.log('⏳ Creating "admin" role...');
    const adminRole = await Role.findOneAndUpdate(
      { slug: 'admin', tenant_id: tenantId, deleted_at: null },
      {
        $set: {
          name: 'Administrator',
          slug: 'admin',
          description: 'Full system access',
          permissions: ADMIN_PERMISSIONS,
          is_system: true,
          tenant_id: tenantId
        }
      },
      { upsert: true, new: true }
    );
    console.log(`✅ Role "admin" created/updated`);

    // ── 3. Create TenantMember ───────────────────────────────────────────
    console.log(`⏳ Adding user to tenant with admin role...`);
    await TenantMember.findOneAndUpdate(
      { user_id: new mongoose.Types.ObjectId(userId), tenant_id: tenantId },
      { 
        $set: { 
          status: 'active',
          role_id: adminRole._id,
          deleted_at: null
        }
      },
      { upsert: true }
    );
    console.log('✅ User membership established');

    // ── 4. Seed basic Localizations ──────────────────────────────────────
    console.log('⏳ Seeding basic localizations...');
    const locSpecs = [
      { key: 'app.name', en: 'Zetta Core', fr: 'Zetta Core' },
      { key: 'common.save', en: 'Save', fr: 'Enregistrer' },
      { key: 'common.cancel', en: 'Cancel', fr: 'Annuler' }
    ];

    for (const spec of locSpecs) {
      await Localization.findOneAndUpdate(
        { key: spec.key, tenant_id: tenantId },
        { $set: { ...spec, tenant_id: tenantId, deleted_at: null } },
        { upsert: true }
      );
    }
    console.log('✅ Basic localizations seeded');

    // ── Done ─────────────────────────────────────────────────────────────
    console.log('\n─────────────────────────────────────────');
    console.log(`  🚀 Tenant "${slug}" is ready!`);
    console.log(`     Tenant ID : ${tenantId}`);
    console.log(`     Admin ID  : ${userId}`);
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

