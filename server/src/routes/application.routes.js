import { Router } from 'express';
import {
  applyToJob,
  getJobApplications,
  getApplicationById,
  updateApplicationStage,
  reRankJobApplications,
  addApplicationNote,
  updateOfferDetails,
} from '../controllers/application.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(protect);

router.post('/', authorize(ROLES.HR_ADMIN, ROLES.RECRUITER), applyToJob);
router.get('/job/:jobId', getJobApplications);
router.get('/:id', getApplicationById);

router.patch('/:id/stage', authorize(ROLES.HR_ADMIN, ROLES.RECRUITER), updateApplicationStage);
router.post('/job/:jobId/re-rank', authorize(ROLES.HR_ADMIN, ROLES.RECRUITER), reRankJobApplications);
router.post('/:id/notes', addApplicationNote);
router.patch('/:id/offer', authorize(ROLES.HR_ADMIN, ROLES.RECRUITER), updateOfferDetails);

export default router;
