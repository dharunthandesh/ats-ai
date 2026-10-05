import { Router } from 'express';
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} from '../controllers/job.controller.js';
import { validateCreateJob, validateUpdateJob } from '../validators/job.validator.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware.js';
import { USER_ROLES } from '../models/User.js';

const router = Router();

// Protect all job endpoints with authentication
router.use(authenticateUser);

/**
 * @route GET /api/v1/jobs
 * @desc Get list of job requisitions with filtering, search, and pagination
 * @access All authenticated roles (ADMIN, RECRUITER, INTERVIEWER)
 */
router.get('/', getJobs);

/**
 * @route GET /api/v1/jobs/:id
 * @desc Get single job requisition details by ID
 * @access All authenticated roles (ADMIN, RECRUITER, INTERVIEWER)
 */
router.get('/:id', getJobById);

/**
 * @route POST /api/v1/jobs
 * @desc Create a new job requisition
 * @access ADMIN, RECRUITER
 */
router.post(
  '/',
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.RECRUITER),
  validateCreateJob,
  createJob
);

/**
 * @route PUT /api/v1/jobs/:id
 * @desc Update an existing job requisition
 * @access ADMIN, RECRUITER
 */
router.put(
  '/:id',
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.RECRUITER),
  validateUpdateJob,
  updateJob
);

/**
 * @route DELETE /api/v1/jobs/:id
 * @desc Delete a job requisition
 * @access ADMIN, RECRUITER
 */
router.delete(
  '/:id',
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.RECRUITER),
  deleteJob
);

export default router;
