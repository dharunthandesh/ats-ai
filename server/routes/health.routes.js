import { Router } from 'express';
import { checkHealth } from '../controllers/health.controller.js';

const router = Router();

/**
 * @route GET /api/v1/health
 * @desc Get server and database health status
 */
router.get('/', checkHealth);

export default router;
