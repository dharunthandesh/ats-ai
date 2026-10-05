import { ApiError } from '../utils/apiError.js';

/**
 * Restricts route access to specified roles
 * @param  {...string} permittedRoles
 */
export const authorize = (...permittedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User is not authenticated.'));
    }

    if (!permittedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
        )
      );
    }

    next();
  };
};
