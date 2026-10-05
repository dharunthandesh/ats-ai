import { Router } from 'express';
import {
  scheduleInterview,
  getInterviews,
  getInterviewById,
  updateInterviewStatus,
} from '../controllers/interview.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(protect);

router.get('/', getInterviews);
router.get('/:id', getInterviewById);

router.post('/', authorize(ROLES.HR_ADMIN, ROLES.RECRUITER), scheduleInterview);
router.patch('/:id/status', updateInterviewStatus);

export default router;
