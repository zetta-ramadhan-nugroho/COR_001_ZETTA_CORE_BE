// *************** IMPORT LIBRARY ***************
const jwt = require('jsonwebtoken');

// *************** IMPORT CORE ***************
const config = require('../../core/config');

// *************** AUTH REQUEST MIDDLEWARE ***************

/**
 * Extracts and verifies the JWT from the Authorization header.
 * Injects decoded user context into the Apollo context object.
 * Does NOT throw — unauthenticated requests receive a null context.user.
 * Resolvers enforce authentication themselves by checking context.user_id.
 *
 * @param {Object} req - The Express request object
 * @returns {Object} Context object with user_id, tenant_id, role, permissions (or nulls)
 */
function buildAuthContext(req) {
  try {
    const authHeader = req.headers['authorization'] || '';

    if (!authHeader.startsWith('Bearer ')) {
      return { user_id: null, tenant_id: null, role: null, permissions: {} };
    }

    const token = authHeader.substring(7);

    if (!config.jwt_secret) {
      console.error('[AUTH] JWT_SECRET is not configured.');
      return { user_id: null, tenant_id: null, role: null, permissions: {} };
    }

    const decoded = jwt.verify(token, config.jwt_secret);

    return {
      user_id: decoded.userId || null,
      tenant_id: decoded.tenantId || null,
      role: decoded.role || null,
      permissions: decoded.permissions || {},
      email: decoded.email || null,
    };
  } catch (error) {
    // *************** Invalid or expired tokens return empty context — resolvers handle enforcement
    return { user_id: null, tenant_id: null, role: null, permissions: {} };
  }
}

// *************** EXPORT MODULE ***************
module.exports = { buildAuthContext };
