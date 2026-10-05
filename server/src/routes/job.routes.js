import { Router } from 'express';
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  toggleJobStatus,
  deleteJob,
} from '../controllers/job.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', protect, getJobs);
router.get('/:id', protect, getJobById);

// Job creation and modifications restricted to HR_ADMIN and RECRUITER
router.post('/', protect, authorize(ROLES.HR_ADMIN, ROLES.RECRUITER), createJob);
router.put('/:id', protect, authorize(ROLES.HR_ADMIN, ROLES.RECRUITER), updateJob);
router.patch('/:id/status', protect, authorize(ROLES.HR_ADMIN, ROLES.RECRUITER), toggleJobStatus);
router.delete('/:id', protect, authorize(ROLES.HR_ADMIN), deleteJob);

export default router;
