import rateLimit from 'express-rate-limit';

// General rate limiter: 100 requests per hour per IP
export const generalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again after an hour',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter limiter for auth routes: 5 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests
});

// API limiter for authenticated routes: 200 requests per hour
export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 200,
  message: {
    error: 'API rate limit exceeded, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
