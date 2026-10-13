import mongoose from 'mongoose';
import { env } from './env.js';

let memServer = null;

/**
 * Connect to MongoDB database using Mongoose
 * Falls back to embedded MongoMemoryServer if local MongoDB is not running.
 * @returns {Promise<mongoose.Connection>}
 */
export const connectDB = async ({ autoSeed = true } = {}) => {
  // First attempt: try connecting to the configured MONGODB_URI
  try {
    const options = {
      serverSelectionTimeoutMS: 2000,
      autoIndex: env.IS_DEVELOPMENT,
    };

    console.log(`[Database] Attempting connection to MongoDB at: ${env.MONGODB_URI}...`);
    const conn = await mongoose.connect(env.MONGODB_URI, options);
    console.log(`[Database] MongoDB connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    console.warn(`[Database] Unable to connect to external MongoDB at ${env.MONGODB_URI} (${error.message}).`);
    console.log('[Database] Initializing embedded MongoDB server (MongoMemoryServer)...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memServer = await MongoMemoryServer.create({
        instance: { dbName: 'talentpulse_ats' },
      });
      const memUri = memServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[Database] Embedded MongoDB connected successfully at: ${memUri}`);

      // Auto-populate demo users, jobs, candidates, and evaluations if database is fresh
      if (autoSeed) {
        const { seedDatabase } = await import('../src/utils/seedData.js');
        await seedDatabase({ exitOnComplete: false, clearExisting: false });
      }

      return conn.connection;
    } catch (memError) {
      console.error(`[Database Error] Failed to start embedded MongoDB: ${memError.message}`);
      throw memError;
    }
  }
};

/**
 * Disconnect from MongoDB gracefully
 * @returns {Promise<void>}
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memServer) {
      await memServer.stop();
      memServer = null;
    }
    console.log('[Database] MongoDB connection closed.');
  } catch (error) {
    console.error(`[Database Error] Error during disconnection: ${error.message}`);
  }
};

// Monitor connection events
mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
  console.log('[Database] MongoDB reconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error(`[Database Error] Runtime connection error: ${err.message}`);
});
