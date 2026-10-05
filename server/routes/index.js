import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import jobRoutes from './job.routes.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware.js';
import { USER_ROLES } from '../models/User.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// Health check endpoint
router.use('/health', healthRoutes);

// Authentication endpoints (/api/v1/auth/*)
router.use('/auth', authRoutes);

// Job requisition management endpoints (/api/v1/jobs/*)
router.use('/jobs', jobRoutes);

// Role authorization verification endpoints for testing RBAC matrix
router.get(
  '/rbac/admin-only',
  authenticateUser,
  authorizeRoles(USER_ROLES.ADMIN),
  (req, res) => {
    ApiResponse.success(res, { role: req.user.role }, 'Access granted to ADMIN resource');
  }
);

router.get(
  '/rbac/recruiter-only',
  authenticateUser,
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.RECRUITER),
  (req, res) => {
    ApiResponse.success(res, { role: req.user.role }, 'Access granted to RECRUITER resource');
  }
);

router.get(
  '/rbac/interviewer-only',
  authenticateUser,
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.RECRUITER, USER_ROLES.INTERVIEWER),
  (req, res) => {
    ApiResponse.success(res, { role: req.user.role }, 'Access granted to INTERVIEWER resource');
  }
);

export default router;
