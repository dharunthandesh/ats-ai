import { registerUser, loginUser, getUserProfile } from '../services/auth.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Handle user registration
 * @route POST /api/v1/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const result = await registerUser({ name, email, password, role });
    return ApiResponse.created(res, result, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user login
 * @route POST /api/v1/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    return ApiResponse.success(res, result, 'User authenticated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 * @route GET /api/v1/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    const profile = await getUserProfile(req.user._id);
    return ApiResponse.success(res, profile, 'User profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user logout
 * @route POST /api/v1/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    // Client should discard token from storage/cookie
    return ApiResponse.success(res, null, 'User logged out successfully');
  } catch (error) {
    next(error);
  }
};
