import { env } from './env.js';

/**
 * CORS options configuration
 */
export const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (such as mobile apps, curl, Postman, or server-to-server)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      env.CORS_ORIGIN,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
    ];

    if (allowedOrigins.includes(origin) || env.IS_DEVELOPMENT) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy does not allow access from origin: ${origin}`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
};
