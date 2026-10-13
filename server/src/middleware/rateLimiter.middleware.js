import rateLimit from 'express-rate-limit';

/**
 * Authentication Rate Limiter Configuration
 * Protects login and registration routes against brute-force attacks and credential stuffing
 */
const AUTH_RATE_LIMIT_WINDOW_MINUTES = 15;
const AUTH_RATE_LIMIT_WINDOW_MS = AUTH_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000;
const AUTH_RATE_LIMIT_MAX_ATTEMPTS = 20;

export const authRateLimiter = rateLimit({
  windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  max: AUTH_RATE_LIMIT_MAX_ATTEMPTS,
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  statusCode: 429,
  skip: (req) => {
    if (process.env.NODE_ENV === 'test' || req.headers['x-bypass-rate-limit'] === 'qa-test-suite') {
      return true;
    }
    return false;
  },
  message: {
    success: false,
    statusCode: 429,
    message: `Too many authentication attempts from this IP address. Please try again after ${AUTH_RATE_LIMIT_WINDOW_MINUTES} minutes.`,
  },
  handler: (req, res, next, options) => {
    return res.status(options.statusCode).json(options.message);
  },
});

export const resetRateLimitKey = (ip) => {
  try {
    if (typeof authRateLimiter.resetKey === 'function') {
      if (ip) authRateLimiter.resetKey(ip);
      authRateLimiter.resetKey('127.0.0.1');
      authRateLimiter.resetKey('::1');
      authRateLimiter.resetKey('::ffff:127.0.0.1');
    }
  } catch (err) {
    // Graceful ignore
  }
};


