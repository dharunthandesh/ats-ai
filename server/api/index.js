import app from '../app.js';
import { connectDB } from '../config/db.js';

// Serverless handler for Vercel
let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('[Vercel Serverless] Database connection failed:', err);
    }
  }
  return app(req, res);
}
