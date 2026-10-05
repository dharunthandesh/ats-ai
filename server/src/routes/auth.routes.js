import { Router } from 'express';
import { register, login, getMe, listUsers, updateUserRole } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Admin-only user management
router.get('/users', protect, authorize(ROLES.HR_ADMIN), listUsers);
router.put('/users/:id', protect, authorize(ROLES.HR_ADMIN), updateUserRole);

export default router;
