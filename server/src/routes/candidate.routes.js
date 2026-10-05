import { Router } from 'express';
import {
  uploadResume,
  getCandidates,
  getCandidateById,
  updateCandidate,
  downloadResume,
} from '../controllers/candidate.controller.js';
import { resumeUpload } from '../config/multer.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', protect, getCandidates);
router.get('/:id', protect, getCandidateById);
router.get('/:id/resume', protect, downloadResume);

// Upload and edit restricted to HR_ADMIN and RECRUITER
router.post(
  '/upload-resume',
  protect,
  authorize(ROLES.HR_ADMIN, ROLES.RECRUITER),
  resumeUpload.array('resumes', 10),
  uploadResume
);

router.put('/:id', protect, authorize(ROLES.HR_ADMIN, ROLES.RECRUITER), updateCandidate);

export default router;
