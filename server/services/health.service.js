import mongoose from 'mongoose';
import { env } from '../config/env.js';

/**
 * Service to aggregate health and connectivity metrics
 * @returns {Promise<object>} System health metadata
 */
export const getSystemHealth = async () => {
  const readyStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbState = mongoose.connection.readyState;
  const isDbConnected = dbState === 1;

  let pingTimeMs = null;
  if (isDbConnected && mongoose.connection.db) {
    const start = Date.now();
    try {
      await mongoose.connection.db.admin().ping();
      pingTimeMs = Date.now() - start;
    } catch (e) {
      pingTimeMs = null;
    }
  }

  const memoryUsage = process.memoryUsage();

  return {
    server: {
      status: 'UP',
      uptimeSeconds: Math.floor(process.uptime()),
      environment: env.NODE_ENV,
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
      memory: {
        rssMB: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      },
    },
    database: {
      status: readyStates[dbState] || 'unknown',
      connected: isDbConnected,
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'unknown',
      pingMs: pingTimeMs,
    },
  };
};
