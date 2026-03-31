// *************** IMPORT LIBRARY ***************
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

// *************** IMPORT CORE ***************
const config = require('../../core/config');
const { AppError } = require('../../core/error');

// *************** S3 CLIENT INITIALIZATION ***************

const s3Client = new S3Client({
  region: config.aws_region,
  credentials: {
    accessKeyId: config.aws_access_key_id,
    secretAccessKey: config.aws_secret_access_key,
  },
});

// *************** S3 UPLOAD SERVICE ***************

/**
 * Uploads a file buffer to S3 and returns the stable s3_key.
 * Never returns a presigned URL — call GeneratePresignedUrl separately when access is needed.
 *
 * @param {Object} params - Upload parameters
 * @param {Buffer} params.buffer - File contents as a Buffer
 * @param {string} params.original_name - Original filename (used to extract extension)
 * @param {string} params.mime_type - MIME type of the file
 * @param {string} [params.folder='uploads'] - S3 folder/prefix to upload into
 * @returns {Promise<Object>} Upload result with s3_key, file_name, mime_type, file_size
 * @throws {AppError} If upload fails
 */
async function UploadFileToS3({ buffer, original_name, mime_type, folder = 'uploads' }) {
  if (!buffer) {
    throw new AppError('File buffer is required for S3 upload.', 'MISSING_FILE_BUFFER', 400);
  }

  const extension = original_name ? original_name.split('.').pop() : 'bin';
  const file_name = `${uuidv4()}.${extension}`;
  const s3_key = `${folder}/${file_name}`;

  try {
    const command = new PutObjectCommand({
      Bucket: config.s3_bucket_name,
      Key: s3_key,
      Body: buffer,
      ContentType: mime_type,
    });

    await s3Client.send(command);

    return {
      s3_key,
      file_name: original_name || file_name,
      mime_type,
      file_size: buffer.length,
    };
  } catch (error) {
    throw new AppError(
      `S3 upload failed: ${error.message}`,
      'S3_UPLOAD_FAILED',
      500
    );
  }
}

/**
 * Deletes a file from S3 by its stable key.
 *
 * @param {string} s3_key - The S3 object key to delete
 * @returns {Promise<void>}
 * @throws {AppError} If deletion fails
 */
async function DeleteFileFromS3(s3_key) {
  if (!s3_key) {
    throw new AppError('s3_key is required for deletion.', 'MISSING_S3_KEY', 400);
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: config.s3_bucket_name,
      Key: s3_key,
    });

    await s3Client.send(command);
  } catch (error) {
    throw new AppError(
      `S3 deletion failed: ${error.message}`,
      'S3_DELETE_FAILED',
      500
    );
  }
}

// *************** EXPORT MODULE ***************
module.exports = { s3Client, UploadFileToS3, DeleteFileFromS3 };
