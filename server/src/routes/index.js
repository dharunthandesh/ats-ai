import { Router } from 'express';
import mongoose from 'mongoose';
import authRoutes from './auth.routes.js';
import jobRoutes from './job.routes.js';
import candidateRoutes from './candidate.routes.js';
import applicationRoutes from './application.routes.js';
import interviewRoutes from './interview.routes.js';
import evaluationRoutes from './evaluation.routes.js';
import analyticsRoutes from './analytics.routes.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// Health check endpoint (/api/v1/health)
router.get('/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const healthData = {
    status: isDbConnected ? 'UP' : 'DEGRADED',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: {
      connected: isDbConnected,
      state: isDbConnected ? 'connected' : 'disconnected',
      name: mongoose.connection.name || 'talentpulse_ats',
    },
  };
  return ApiResponse.success(
    res,
    healthData,
    isDbConnected ? 'System and database operational' : 'Database degraded or disconnected',
    isDbConnected ? 200 : 503
  );
});

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/candidates', candidateRoutes);
router.use('/applications', applicationRoutes);
router.use('/interviews', interviewRoutes);
router.use('/evaluations', evaluationRoutes);
router.use('/analytics', analyticsRoutes);

export default router;

