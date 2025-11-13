/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting request frequency
 */

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP',
    message: 'Please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    });
  }
});

// Strict limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts',
    message: 'Please wait before trying again',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'Account temporarily locked due to too many failed attempts. Please try again later.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    });
  }
});

// Password reset limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    error: 'Too many password reset attempts',
    message: 'Please wait before requesting another password reset',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many password reset attempts',
      message: 'You have exceeded the password reset limit. Please wait before trying again.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    });
  }
});

// Upload limiter for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 uploads per hour
  message: {
    error: 'Too many upload attempts',
    message: 'Upload limit exceeded. Please try again later',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Upload limit exceeded',
      message: 'You have exceeded the file upload limit. Please wait before uploading again.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    });
  }
});

// Message sending limiter for chat
const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 messages per minute
  message: {
    error: 'Too many messages sent',
    message: 'Please slow down your message sending',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Message limit exceeded',
      message: 'You are sending messages too quickly. Please slow down.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    });
  }
});

// Speed limiter to slow down requests instead of blocking
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per 15 minutes at full speed
  delayMs: () => 500, // Fixed delay of 500ms per request after delayAfter
  maxDelayMs: 10000, // Maximum delay of 10 seconds
  validate: { delayMs: false } // Disable validation warning
});

// Create custom rate limiter
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
      error: 'Rate limit exceeded',
      message: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
  };

  return rateLimit({ ...defaultOptions, ...options });
};

// Dynamic rate limiter based on user authentication status
const dynamicLimiter = (authenticatedMax = 200, unauthenticatedMax = 50) => {
  return (req, res, next) => {
    const max = req.user ? authenticatedMax : unauthenticatedMax;
    
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: max,
      message: {
        error: 'Rate limit exceeded',
        message: `Too many requests. Limit: ${max} requests per 15 minutes`,
        authenticated: !!req.user
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        // Use user ID for authenticated users, IP for unauthenticated
        return req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
      },
      handler: (req, res) => {
        res.status(429).json({
          error: 'Rate limit exceeded',
          message: req.user 
            ? 'You have made too many requests. Please wait before trying again.'
            : 'Too many requests from this IP. Please sign in for higher limits or wait before trying again.',
          authenticated: !!req.user,
          retryAfter: Math.round(req.rateLimit.resetTime / 1000)
        });
      }
    });

    limiter(req, res, next);
  };
};

// Burst protection for specific actions
const burstLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    error: 'Too many requests in quick succession',
    message: 'Please wait a moment before trying again'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Burst limit exceeded',
      message: 'You are making requests too quickly. Please slow down.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    });
  }
});

// Skip rate limiting for certain conditions
const skipSuccessfulRequests = (req, res) => {
  return res.statusCode < 400;
};

const skipFailedRequests = (req, res) => {
  return res.statusCode >= 400;
};

// IP whitelist (for development/testing)
const skipIf = (condition) => {
  return (req, res) => {
    if (typeof condition === 'function') {
      return condition(req, res);
    }
    return condition;
  };
};

// Development mode - skip rate limiting
const developmentSkip = skipIf(() => process.env.NODE_ENV === 'development');

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
  messageLimiter,
  speedLimiter,
  burstLimiter,
  dynamicLimiter,
  createRateLimiter,
  skipSuccessfulRequests,
  skipFailedRequests,
  skipIf,
  developmentSkip
};