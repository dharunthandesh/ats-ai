import { ApiError } from '../utils/apiError.js';

/**
 * 404 Not Found Middleware for handling unmatched routes
 */
export const notFoundHandler = (req, res, next) => {
  const error = ApiError.notFound(`Cannot find endpoint '${req.method} ${req.originalUrl}' on this server.`);
  next(error);
};
