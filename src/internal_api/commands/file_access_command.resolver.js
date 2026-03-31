// *************** IMPORT UTILITIES ***************
const { HandleGraphQLError, AppError } = require('../../core/error');
const { VerifyServiceAuth } = require('../../middlewares/auth/service_auth.middleware');
const { GeneratePresignedUrl } = require('../../shared/utils/presigned_url');

// *************** INTERNAL MUTATION ***************

/**
 * Resolves a time-limited presigned URL for a Core-owned file identified by its stable key.
 * Downstream apps must not access S3 directly — they must call this command.
 * The presigned URL is returned in the response only and must NOT be stored.
 * SERVICE-AUTH REQUIRED.
 *
 * @param {Object} _ - Parent resolver (unused)
 * @param {Object} args - { file_id } — the stable s3_key of the Core-owned file
 * @param {Object} context - GraphQL context
 * @returns {Promise<Object>} { presigned_url, expires_at }
 */
async function internal_resolveFileAccessUrl(_, args, context) {
  try {
    // *************** Verify service-to-service auth before granting file access
    VerifyServiceAuth(context);

    if (!args.file_id) {
      throw new AppError('file_id (s3_key) is required.', 'MISSING_FILE_ID', 400);
    }

    const presigned_url = await GeneratePresignedUrl(args.file_id);

    // *************** Compute expiry timestamp for the consumer to cache duration
    const expires_at = new Date(Date.now() + 3600 * 1000).toISOString();

    return { presigned_url, expires_at };
  } catch (error) {
    throw HandleGraphQLError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Mutation: { internal_resolveFileAccessUrl },
};
