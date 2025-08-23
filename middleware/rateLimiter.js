const rateLimit = require('express-rate-limit');

// Rate limiting for profile updates
const profileUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 profile updates per 15 minutes
  message: {
    error: 'Too many profile update attempts. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for profile views
const profileViewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 profile views per 15 minutes
  message: {
    error: 'Too many profile view attempts. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  profileUpdateLimiter,
  profileViewLimiter
};
