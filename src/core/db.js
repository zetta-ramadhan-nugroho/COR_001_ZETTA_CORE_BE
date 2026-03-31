// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT CORE ***************
const config = require('./config');

// *************** CONNECTION STATE ***************
let isConnected = false;

// *************** QUERY ***************

/**
 * Connects to MongoDB using Mongoose.
 * Reuses an existing connection if already established.
 *
 * @returns {Promise<void>}
 */
async function connectDatabase() {
  if (isConnected) return;

  if (!config.mongodb_uri) {
    throw new Error('MONGODB_URI is not defined in environment configuration.');
  }

  try {
    await mongoose.connect(config.mongodb_uri, {
      dbName: 'zetta_core',
    });

    isConnected = true;
    console.log('[DB] MongoDB connected successfully.');

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('[DB] MongoDB disconnected.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[DB] MongoDB connection error:', err);
      isConnected = false;
    });
  } catch (error) {
    console.error('[DB] Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

// *************** EXPORT MODULE ***************
module.exports = { connectDatabase };
