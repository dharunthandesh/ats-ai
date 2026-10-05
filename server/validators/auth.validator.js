import { ApiError } from '../utils/apiError.js';
import { USER_ROLES } from '../models/User.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates user registration payload
 */
export const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name is required and must be at least 2 characters long' });
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push({ field: 'email', message: 'A valid email address is required' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push({ field: 'password', message: 'Password is required and must be at least 6 characters long' });
  }

  if (role) {
    const validRoles = [USER_ROLES.ADMIN, USER_ROLES.RECRUITER, USER_ROLES.INTERVIEWER];
    if (!validRoles.includes(role)) {
      errors.push({
        field: 'role',
        message: `Role must be one of: ${validRoles.join(', ')}`,
      });
    }
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest('Validation failed for registration input', errors));
  }

  next();
};

/**
 * Validates user login payload
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push({ field: 'email', message: 'A valid email address is required' });
  }

  if (!password || typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest('Validation failed for login input', errors));
  }

  next();
};
