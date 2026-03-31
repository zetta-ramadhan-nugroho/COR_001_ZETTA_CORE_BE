// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** AUDIT LOG SCHEMA ***************

const auditLogSchema = new mongoose.Schema(
  {
    // *************** The action performed (e.g. 'STUDENT_UPDATED_FROM_ADMISSION')
    action: { type: String, required: true },
    // *************** Tenant scope of this action
    tenant_id: { type: String, required: true, index: true },
    // *************** User who performed the action
    acting_user_id: { type: String, default: null },
    // *************** Source application ('ZETTA_CORE', 'SAT_001', etc.)
    source_app: { type: String, required: true },
    // *************** Entity type being acted upon
    target_entity: { type: String, required: true },
    // *************** ID of the entity being acted upon
    target_id: { type: String, required: true },
    // *************** Snapshot of entity state before the action
    before: { type: mongoose.Schema.Types.Mixed, default: null },
    // *************** Snapshot of entity state after the action
    after: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'audit_logs',
  }
);

const AuditLogModel =
  mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

// *************** AUDIT LOGGER ***************

const AuditLogger = {
  /**
   * Logs a cross-app or sensitive action to the audit_logs collection.
   *
   * @param {Object} entry - The audit entry
   * @param {string} entry.action - The action code (e.g. 'STUDENT_UPDATED_FROM_ADMISSION')
   * @param {string} entry.tenant_id - Tenant scope
   * @param {string|null} [entry.acting_user_id] - User who triggered the action
   * @param {string} entry.source_app - The originating application
   * @param {string} entry.target_entity - Entity type (e.g. 'student')
   * @param {string} entry.target_id - Entity ID
   * @param {Object|null} [entry.before] - State before the action
   * @param {Object|null} [entry.after] - State after the action
   * @returns {Promise<void>}
   */
  async log(entry) {
    try {
      await AuditLogModel.create(entry);
    } catch (error) {
      // *************** Audit logging must never crash the main operation
      console.error('[AUDIT] Failed to write audit log:', error.message);
    }
  },
};

// *************** EXPORT MODULE ***************
module.exports = { AuditLogger, AuditLogModel };
