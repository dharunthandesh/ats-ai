import { Router } from 'express';
import {
  submitEvaluation,
  getEvaluationsByApplication,
} from '../controllers/evaluation.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/', submitEvaluation);
router.get('/application/:applicationId', getEvaluationsByApplication);

export default router;
