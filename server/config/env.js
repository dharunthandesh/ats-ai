import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from the server root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const isProduction = process.env.NODE_ENV === 'production';

// Production safety: fail immediately and safely if JWT_SECRET is missing in production
if (isProduction && !process.env.JWT_SECRET) {
  console.error('[Fatal Security Error] JWT_SECRET environment variable is missing in production environment. Application halted.');
  process.exit(1);
}

// Centralized development fallback secret
const DEFAULT_DEV_JWT_SECRET = 'talentpulse_production_grade_jwt_secret_key_2026';

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/talentpulse_ats',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  API_PREFIX: '/api/v1',
  JWT_SECRET: process.env.JWT_SECRET || DEFAULT_DEV_JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  IS_PRODUCTION: isProduction,
  IS_DEVELOPMENT: !isProduction,
};

// Simple sanity check for critical environment variables
if (!env.MONGODB_URI) {
  console.warn('[Warning] MONGODB_URI is not set in environment variables. Defaulting to local instance.');
}
