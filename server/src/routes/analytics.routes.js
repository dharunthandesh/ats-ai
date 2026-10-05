import { Router } from 'express';
import { getOverview, exportCsv, exportPdf } from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/overview', getOverview);
router.get('/export/csv', exportCsv);
router.get('/export/pdf', exportPdf);

export default router;
