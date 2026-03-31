// *************** IMPORT LIBRARY ***************
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const http = require('http');
const { GraphQLScalarType, Kind } = require('graphql');

// *************** IMPORT CORE ***************
const { connectDatabase } = require('./core/db');
const config = require('./core/config');

// *************** IMPORT SCHEMA ***************
const { typeDefs } = require('./schema/index');

// *************** IMPORT MIDDLEWARES ***************
const { buildAuthContext } = require('./middlewares/auth/auth_request.middleware');

// *************** IMPORT RESOLVERS ***************
const userResolver = require('./features/users/user.resolver');
const studentResolver = require('./features/students/student.resolver');
const roleResolver = require('./features/roles/role.resolver');
const programResolver = require('./features/programs/program.resolver');
const schoolResolver = require('./features/foundational_data/schools/school.resolver');
const campusResolver = require('./features/foundational_data/campuses/campus.resolver');
const periodResolver = require('./features/foundational_data/periods/period.resolver');
const levelResolver = require('./features/foundational_data/levels/level.resolver');
const sectorResolver = require('./features/foundational_data/sectors/sector.resolver');
const specialityResolver = require('./features/foundational_data/specialities/speciality.resolver');
const legalEntityResolver = require('./features/foundational_data/legal_entities/legal_entity.resolver');
const formationTypeResolver = require('./features/foundational_data/formation_types/formation_type.resolver');
const rncpTitleResolver = require('./features/foundational_data/rncp_titles/rncp_title.resolver');
const paymentModalityResolver = require('./features/financial_settings/payment_modalities/payment_modality.resolver');
const additionalFeeResolver = require('./features/financial_settings/additional_fees/additional_fee.resolver');
const registrationProfileResolver = require('./features/financial_settings/registration_profiles/registration_profile.resolver');
const localizationResolver = require('./features/localization/localization.resolver');

// *************** IMPORT INTERNAL API RESOLVERS ***************
const studentInternalResolver = require('./internal_api/read/student_internal.resolver');
const programInternalResolver = require('./internal_api/read/program_internal.resolver');
const userInternalResolver = require('./internal_api/read/user_internal.resolver');
const financialInternalResolver = require('./internal_api/read/financial_internal.resolver');
const studentUpdateCommandResolver = require('./internal_api/commands/student_update_command.resolver');
const fileAccessCommandResolver = require('./internal_api/commands/file_access_command.resolver');

// *************** JSON SCALAR RESOLVER ***************
const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'Arbitrary JSON value',
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return JSON.parse(ast.value);
    }
    if (ast.kind === Kind.OBJECT) {
      return ast.fields.reduce((obj, field) => {
        obj[field.name.value] = field.value.value;
        return obj;
      }, {});
    }
    return null;
  },
});

// *************** MERGE RESOLVERS ***************

/**
 * Merges multiple resolver maps into a single object.
 * Each feature resolver exports { Query: {...}, Mutation: {...} }.
 *
 * @param {Array<Object>} resolverMaps - Array of resolver map objects
 * @returns {Object} Merged resolver object
 */
function mergeResolvers(resolverMaps) {
  const merged = { Query: {}, Mutation: {} };

  for (const map of resolverMaps) {
    if (map.Query) Object.assign(merged.Query, map.Query);
    if (map.Mutation) Object.assign(merged.Mutation, map.Mutation);
  }

  return merged;
}

const resolvers = {
  JSON: JSONScalar,
  ...mergeResolvers([
    // *************** Feature resolvers
    userResolver,
    studentResolver,
    roleResolver,
    programResolver,
    schoolResolver,
    campusResolver,
    periodResolver,
    levelResolver,
    sectorResolver,
    specialityResolver,
    legalEntityResolver,
    formationTypeResolver,
    rncpTitleResolver,
    paymentModalityResolver,
    additionalFeeResolver,
    registrationProfileResolver,
    localizationResolver,
    // *************** Internal API resolvers — service-auth protected
    studentInternalResolver,
    programInternalResolver,
    userInternalResolver,
    financialInternalResolver,
    studentUpdateCommandResolver,
    fileAccessCommandResolver,
  ]),
};

// *************** SERVER BOOTSTRAP ***************

/**
 * Boots the Apollo Server with Express, connects to MongoDB, and starts listening.
 *
 * @returns {Promise<void>}
 */
async function startServer() {
  // *************** Connect to MongoDB first — fail fast if DB is unavailable
  await connectDatabase();

  const app = express();
  const httpServer = http.createServer(app);

  // *************** Create Apollo Server with drain plugin for graceful shutdown
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError: (formattedError) => {
      // *************** In production, suppress internal stack details
      if (config.node_env === 'production') {
        return {
          message: formattedError.message,
          extensions: formattedError.extensions,
        };
      }
      return formattedError;
    },
  });

  await server.start();

  // *************** Apply middleware
  app.use(
    '/graphql',
    cors({
      origin: config.app_base_url,
      credentials: true,
    }),
    express.json({ limit: '10mb' }),
    expressMiddleware(server, {
      /**
       * Builds the GraphQL context from the Express request.
       * Extracts JWT and injects user_id, tenant_id, role, permissions.
       *
       * @param {Object} param0 - { req }
       * @returns {Object} GraphQL context
       */
      context: async ({ req }) => {
        const authContext = buildAuthContext(req);
        return {
          ...authContext,
          req, // *************** Pass raw request for service-auth header access
        };
      },
    })
  );

  // *************** Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'zetta-core-be', timestamp: new Date().toISOString() });
  });

  await new Promise((resolve) => httpServer.listen({ port: config.port }, resolve));

  console.log(`[SERVER] Zetta Core BE running at http://localhost:${config.port}/graphql`);
  console.log(`[SERVER] Health check at http://localhost:${config.port}/health`);
}

// *************** START ***************
startServer().catch((error) => {
  console.error('[SERVER] Failed to start:', error);
  process.exit(1);
});
