import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './config/env.js';
import { corsOptions } from './config/cors.js';
import apiV1Routes from './src/routes/index.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import { errorHandler } from './src/middleware/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express Application
const app = express();

// 1. Security HTTP Headers
app.use(helmet({ crossOriginResourcePolicy: false }));

// 2. Cross-Origin Resource Sharing (CORS)
app.use(cors(corsOptions));

// 3. HTTP Request Logger
const morganFormat = env.IS_DEVELOPMENT ? 'dev' : 'combined';
app.use(morgan(morganFormat));

// 4. Request Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Static File Serving for Uploaded Resumes (/uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 6. Versioned API Routes (/api/v1)
app.use(env.API_PREFIX, apiV1Routes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    platform: 'AI-Enabled Recruitment & Candidate Tracking Platform',
    version: '1.0.0',
    documentation: `${env.API_PREFIX}/health`,
    timestamp: new Date().toISOString(),
  });
});

// 7. 404 Handler for Unmatched Endpoints
app.use(notFoundHandler);

// 8. Centralized Global Error Handler
app.use(errorHandler);

export default app;

