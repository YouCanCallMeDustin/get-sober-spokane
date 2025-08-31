/*!
* Start Bootstrap - Creative v7.0.7 (https://YOUR_USERNAME.github.io/sober-spokane)
* Copyright 2013-2025 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-creative/blob/master/LICENSE)
* Built: 2025-08-31T09:14:32.495Z
*/
// Application Configuration
window.APP_CONFIG = {
  // Supabase Configuration
  SUPABASE_URL: (typeof process !== 'undefined' && process.env && process.env.SUPABASE_URL) || (window.__ENV && window.__ENV.SUPABASE_URL) || 'https://iquczuhmkemjytrqnbxg.supabase.co',
  SUPABASE_ANON_KEY: (typeof process !== 'undefined' && process.env && process.env.SUPABASE_ANON_KEY) || (window.__ENV && window.__ENV.SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdWN6dWhta2Vtanl0cnFuYnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMDMzMjcsImV4cCI6MjA2OTY3OTMyN30.FFzZFBUAM1ZgQSTlzPNSuJIikUiQkvSBKvc19wdzulk',
  
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
  // Support either 3000 or 3001; default to current origin
  const devPort = window.location.port || '3000';
  window.APP_CONFIG.API.BASE_URL = `${window.location.protocol}//${window.location.hostname}:${devPort}`;
  
  // For development, allow optional defaults via localStorage to avoid hardcoding keys
  if (!window.APP_CONFIG.SUPABASE_URL) {
    window.APP_CONFIG.SUPABASE_URL = localStorage.getItem('SUPABASE_URL') || '';
  }
  if (!window.APP_CONFIG.SUPABASE_ANON_KEY) {
    window.APP_CONFIG.SUPABASE_ANON_KEY = localStorage.getItem('SUPABASE_ANON_KEY') || '';
  }
} else {
  // Production environment
  window.APP_CONFIG.ENVIRONMENT = 'production';
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.APP_CONFIG;
}
