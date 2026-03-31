// *************** IMPORT LIBRARY ***************
const { GraphQLError } = require('graphql');

// *************** APP ERROR CLASS ***************

/**
 * Custom application error class for structured error handling.
 * Used by helpers to throw business rule violations with context.
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {string} code - Machine-readable error code (e.g. 'STUDENT_NOT_FOUND')
   * @param {number} httpStatus - HTTP-equivalent status code (e.g. 404, 400, 500)
   * @param {Object} [meta={}] - Optional additional error metadata
   */
  constructor(message, code, httpStatus, meta = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.meta = meta;
  }
}

// *************** GRAPHQL ERROR HANDLER ***************

/**
 * Converts an AppError or unknown error into a GraphQLError with proper extensions.
 * Must be called in every resolver catch block.
 *
 * @param {Error} error - The caught error
 * @returns {GraphQLError} Formatted GraphQL error
 */
function HandleGraphQLError(error) {
  if (error instanceof AppError) {
    return new GraphQLError(error.message, {
      extensions: {
        code: error.code,
        httpStatus: error.httpStatus,
        meta: error.meta,
      },
    });
  }

  // *************** Log unexpected errors in dev
  if (process.env.NODE_ENV !== 'production') {
    console.error('[UNHANDLED ERROR]', error);
  }

  return new GraphQLError('An internal server error occurred.', {
    extensions: {
      code: 'INTERNAL_SERVER_ERROR',
      httpStatus: 500,
    },
  });
}

// *************** EXPORT MODULE ***************
module.exports = { AppError, HandleGraphQLError };
