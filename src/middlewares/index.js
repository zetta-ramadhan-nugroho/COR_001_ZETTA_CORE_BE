// *************** EXPORT MODULE ***************
module.exports = {
  buildAuthContext: require('./auth/auth_request.middleware').buildAuthContext,
  VerifyServiceAuth: require('./auth/service_auth.middleware').VerifyServiceAuth,
};
