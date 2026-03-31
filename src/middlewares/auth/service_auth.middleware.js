// *************** IMPORT CORE ***************
const config = require('../../core/config');
const { AppError } = require('../../core/error');

// *************** SERVICE AUTH MIDDLEWARE ***************

/**
 * Verifies the internal service-to-service authentication token.
 * Must be called at the top of every internal resolver before any logic executes.
 *
 * Downstream apps (e.g. SAT_001) must include the header:
 *   X-Service-Token: <INTERNAL_SERVICE_TOKEN>
 *   X-Source-App: <SAT_001|ZETTA_ADMISSION|...>
 *
 * @param {Object} context - The GraphQL context (includes req)
 * @returns {{ source_app: string }} Verified source app identifier
 * @throws {AppError} If the service token is missing or invalid
 */
function VerifyServiceAuth(context) {
  const serviceToken = context.req?.headers?.['x-service-token'];
  const sourceApp = context.req?.headers?.['x-source-app'];

  if (!serviceToken) {
    throw new AppError(
      'Internal service token is required.',
      'SERVICE_AUTH_MISSING',
      401
    );
  }

  if (!config.internal_service_token) {
    throw new AppError(
      'Internal service token is not configured on this server.',
      'SERVICE_AUTH_NOT_CONFIGURED',
      500
    );
  }

  if (serviceToken !== config.internal_service_token) {
    throw new AppError(
      'Invalid internal service token.',
      'SERVICE_AUTH_INVALID',
      401
    );
  }

  if (!sourceApp) {
    throw new AppError(
      'X-Source-App header is required for internal API calls.',
      'SERVICE_AUTH_MISSING_SOURCE',
      401
    );
  }

  return { source_app: sourceApp };
}

// *************** EXPORT MODULE ***************
module.exports = { VerifyServiceAuth };
