// *************** IMPORT LIBRARY ***************
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// *************** IMPORT SERVICES ***************
const { s3Client } = require('../services/s3_uploader.service');

// *************** IMPORT CORE ***************
const config = require('../../core/config');
const { AppError } = require('../../core/error');

// *************** PRESIGNED URL GENERATOR ***************

/**
 * Generates a time-limited presigned URL for reading a Core-owned S3 file.
 * Never store the returned URL — it expires. Store only the s3_key.
 *
 * @param {string} s3_key - The stable S3 object key (e.g. 'uploads/uuid.pdf')
 * @param {number} [expiry_seconds] - URL lifetime in seconds (defaults to config value)
 * @returns {Promise<string>} Time-limited presigned URL
 * @throws {AppError} If s3_key is missing or URL generation fails
 */
async function GeneratePresignedUrl(s3_key, expiry_seconds) {
  if (!s3_key) {
    throw new AppError('s3_key is required to generate a presigned URL.', 'MISSING_S3_KEY', 400);
  }

  const expiresIn = expiry_seconds || config.s3_presigned_url_expiry;

  try {
    const command = new GetObjectCommand({
      Bucket: config.s3_bucket_name,
      Key: s3_key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    throw new AppError(
      `Failed to generate presigned URL: ${error.message}`,
      'PRESIGNED_URL_FAILED',
      500
    );
  }
}

// *************** EXPORT MODULE ***************
module.exports = { GeneratePresignedUrl };
