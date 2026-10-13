import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return next(ApiError.unauthorized('Authentication token missing. Please sign in.'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(ApiError.unauthorized('User associated with this token no longer exists.'));
    }

    if (!user.isActive) {
      return next(ApiError.forbidden('Your account has been deactivated. Please contact HR Administrator.'));
    }

    req.user = user;
    next();
  } catch (err) {
    return next(ApiError.unauthorized('Invalid or expired authentication token.'));
  }
};
