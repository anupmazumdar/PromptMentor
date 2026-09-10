import rateLimit from 'express-rate-limit';

/**
 * Standard API rate limiter:
 * 100 requests per 15-minute window per IP.
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again in 15 minutes.'
  }
});

/**
 * Strict AI rate limiter:
 * Protects OpenRouter / Fallback AI free-tier quota.
 * 20 requests per minute per IP.
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'AI request limit reached (20 requests/min). Please pause for a moment to conserve free-tier capacity.'
  }
});

/**
 * Auth rate limiter:
 * 15 login/register attempts per 15 minutes to prevent brute-force attacks.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});
