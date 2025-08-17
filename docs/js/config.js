// Application Configuration
window.APP_CONFIG = {
  // Supabase Configuration
  SUPABASE_URL: 'https://iquczuhmkemjytrynbxg.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdWN6dWhta2Vtanl0cnFuYnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMDMzMjcsImV4cCI6MjA2OTY3OTMyN30.FFzZFBUAM1ZgQSTlzPNSuJIikUiQkvSBKvc19wdzulk',
  
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
  window.APP_CONFIG.API.BASE_URL = 'http://localhost:3000';
  
  console.log('🔧 Development environment detected');
  console.log('✅ Supabase configured with:', {
    url: window.APP_CONFIG.SUPABASE_URL,
    key: window.APP_CONFIG.SUPABASE_ANON_KEY.substring(0, 20) + '...'
  });
} else {
  // Production environment
  window.APP_CONFIG.ENVIRONMENT = 'production';
  console.log('🔧 Production environment detected');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.APP_CONFIG;
}
