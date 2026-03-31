// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** ERROR LOG SCHEMA ***************

const errorLogSchema = new mongoose.Schema(
  {
    // *************** File path where the error occurred
    path: { type: String, required: true },
    // *************** Function name where the error occurred
    function_name: { type: String, required: true },
    // *************** JSON-stringified input parameters at time of failure
    parameter_input: { type: String, default: null },
    // *************** Full error stack trace
    error: { type: String, required: true },
    // *************** Tenant context (if available)
    tenant_id: { type: String, default: null, index: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'error_logs',
  }
);

const ErrorLogModel =
  mongoose.models.ErrorLog || mongoose.model('ErrorLog', errorLogSchema);

// *************** EXPORT MODULE ***************
module.exports = ErrorLogModel;
