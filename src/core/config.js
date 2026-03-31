// *************** IMPORT LIBRARY ***************
require('dotenv').config();

// *************** CONFIGURATION ***************

const config = {
  // *************** Server
  port: process.env.PORT || 4000,
  node_env: process.env.NODE_ENV || 'development',

  // *************** MongoDB
  mongodb_uri: process.env.MONGODB_URI,

  // *************** JWT
  jwt_secret: process.env.JWT_SECRET,
  jwt_expires_in: process.env.JWT_EXPIRES_IN || '7d',

  // *************** AWS S3
  aws_region: process.env.AWS_REGION,
  aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
  aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
  s3_bucket_name: process.env.S3_BUCKET_NAME,
  s3_presigned_url_expiry: parseInt(process.env.S3_PRESIGNED_URL_EXPIRY || '3600', 10),

  // *************** Mailer
  mailer_api_url: process.env.MAILER_API_URL,
  mailer_api_key: process.env.MAILER_API_KEY,
  mailer_from: process.env.MAILER_FROM || 'noreply@zettabyte.com',

  // *************** Internal Service Auth
  internal_service_token: process.env.INTERNAL_SERVICE_TOKEN,

  // *************** App Base URL
  app_base_url: process.env.APP_BASE_URL || 'http://localhost:3000',
};

// *************** EXPORT MODULE ***************
module.exports = config;
