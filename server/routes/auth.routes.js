import { Router } from 'express';
import { register, login, getMe, logout } from '../controllers/auth.controller.js';
import { validateRegister, validateLogin } from '../validators/auth.validator.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user account
 */
router.post('/register', validateRegister, register);

/**
 * @route POST /api/v1/auth/login
 * @desc Authenticate user and issue JWT token
 */
router.post('/login', validateLogin, login);

/**
 * @route GET /api/v1/auth/me
 * @desc Get current authenticated user profile
 */
router.get('/me', authenticateUser, getMe);

/**
 * @route POST /api/v1/auth/logout
 * @desc Invalidate / logout current session
 */
router.post('/logout', authenticateUser, logout);

export default router;
