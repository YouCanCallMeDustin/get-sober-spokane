// Application Configuration
window.APP_CONFIG = {
  // Supabase Configuration
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  
  // App Settings
  APP_NAME: 'Sober Spokane',
  APP_VERSION: '1.0.0',
  
  // Authentication Settings
  AUTH: {
    SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours
    REMEMBER_ME_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days
    PASSWORD_MIN_LENGTH: 8,
    EMAIL_VERIFICATION_REQUIRED: true
  },
  
  // API Endpoints
  API: {
    BASE_URL: window.location.origin,
    AUTH: {
      LOGIN: '/api/auth/login',
      SIGNUP: '/api/auth/signup',
      LOGOUT: '/api/auth/logout',
      RESET_PASSWORD: '/api/auth/reset-password',
      GOOGLE_CALLBACK: '/auth/google/callback'
    }
  },
  
  // Feature Flags
  FEATURES: {
    GOOGLE_OAUTH: true,
    PASSWORD_RESET: true,
    REMEMBER_ME: true,
    EMAIL_VERIFICATION: true
  }
};

// Environment-specific overrides
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // Development environment
  window.APP_CONFIG.ENVIRONMENT = 'development';
  window.APP_CONFIG.API.BASE_URL = 'http://localhost:3001';
  
  // For development, you can set default Supabase credentials here
  // Make sure to replace these with your actual credentials
  if (!window.APP_CONFIG.SUPABASE_URL) {
    window.APP_CONFIG.SUPABASE_URL = 'https://your-project-id.supabase.co';
  }
  if (!window.APP_CONFIG.SUPABASE_ANON_KEY) {
    window.APP_CONFIG.SUPABASE_ANON_KEY = 'your_anon_key_here';
  }
} else {
  // Production environment
  window.APP_CONFIG.ENVIRONMENT = 'production';
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.APP_CONFIG;
}
