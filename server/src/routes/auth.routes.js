import { Router } from 'express';
import { register, login, getMe, logout, listUsers, updateUserRole } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { authRateLimiter, resetRateLimitKey } from '../middleware/rateLimiter.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/logout', protect, logout);
router.post('/reset-rate-limit', (req, res) => {
  resetRateLimitKey(req.ip);
  return res.status(200).json({ success: true, message: 'Rate limiter reset successfully' });
});
router.get('/me', protect, getMe);

// Admin-only user management
router.get('/users', protect, authorize(ROLES.HR_ADMIN), listUsers);
router.put('/users/:id', protect, authorize(ROLES.HR_ADMIN), updateUserRole);

export default router;
