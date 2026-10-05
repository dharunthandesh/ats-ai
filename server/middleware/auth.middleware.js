import jwt from 'jsonwebtoken';
import { User, USER_ROLES } from '../models/User.js';
import { verifyToken } from '../services/auth.service.js';
import { ApiError } from '../utils/apiError.js';

/**
 * Role Permission Mapping Specification
 */
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    'manage_users',
    'manage_jobs',
    'view_candidates',
    'manage_applications',
    'schedule_interviews',
    'view_analytics',
    'export_reports',
    'view_audit_logs',
  ],
  [USER_ROLES.RECRUITER]: [
    'create_manage_jobs',
    'upload_resumes',
    'view_candidates',
    'shortlist_candidates',
    'manage_pipeline',
    'schedule_interviews',
    'view_analytics',
    'export_reports',
  ],
  [USER_ROLES.INTERVIEWER]: [
    'view_assigned_interviews',
    'view_assigned_candidate_information',
    'submit_interview_feedback',
    'update_interview_status',
  ],
};

/**
 * Authentication Middleware: Verifies Bearer JWT token and attaches user
 */
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      throw ApiError.unauthorized('Authentication token missing. Please sign in.');
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw ApiError.unauthorized('Authentication token has expired. Please sign in again.');
      }
      throw ApiError.unauthorized('Invalid authentication token.');
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw ApiError.unauthorized('User associated with this token no longer exists.');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account is deactivated. Access denied.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorization Middleware: Enforces Role-Based Access Control (RBAC)
 * @param  {...string} roles - Allowed roles for the endpoint
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required before checking authorization.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access forbidden: Role '${req.user.role}' is not authorized to access this resource. Allowed roles: [${roles.join(', ')}]`
        )
      );
    }

    next();
  };
};
