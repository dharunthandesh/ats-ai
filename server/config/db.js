import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Connect to MongoDB database using Mongoose
 * @returns {Promise<mongoose.Connection>}
 */
export const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      autoIndex: env.IS_DEVELOPMENT,
    };

    const conn = await mongoose.connect(env.MONGODB_URI, options);
    console.log(`[Database] MongoDB connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    throw error;
  }
};

/**
 * Disconnect from MongoDB gracefully
 * @returns {Promise<void>}
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
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
