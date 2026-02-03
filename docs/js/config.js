/*!
* Start Bootstrap - Creative v7.0.8 (https://YOUR_USERNAME.github.io/sober-spokane)
* Copyright 2013-2026 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-creative/blob/master/LICENSE)
* Built: 2026-02-03T06:25:13.613Z
*/
// Application Configuration
window.APP_CONFIG = {
  // Supabase Configuration
  SUPABASE_URL: (typeof process !== 'undefined' && process.env && process.env.SUPABASE_URL) || (window.__ENV && window.__ENV.SUPABASE_URL) || 'https://cwkpprcemnspgeoezfrp.supabase.co',
  SUPABASE_ANON_KEY: (typeof process !== 'undefined' && process.env && process.env.SUPABASE_ANON_KEY) || (window.__ENV && window.__ENV.SUPABASE_ANON_KEY) || '',
  
  // Shared Supabase client instance to prevent multiple instances
  SHARED_SUPABASE_CLIENT: null,
  
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

// Function to get or create the shared Supabase client
window.getSupabaseClient = function() {
  if (!window.APP_CONFIG.SHARED_SUPABASE_CLIENT) {
    const supabaseUrl = window.APP_CONFIG.SUPABASE_URL;
    const supabaseKey = window.APP_CONFIG.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase credentials not found');
      return null;
    }
    
    if (typeof window.supabase !== 'undefined') {
      window.APP_CONFIG.SHARED_SUPABASE_CLIENT = window.supabase.createClient(supabaseUrl, supabaseKey);
      console.log('✅ Created shared Supabase client');
    } else {
      console.error('❌ Supabase library not loaded');
      return null;
    }
  }
  
  return window.APP_CONFIG.SHARED_SUPABASE_CLIENT;
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.APP_CONFIG;
}
