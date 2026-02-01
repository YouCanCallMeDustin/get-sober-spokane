// Environment configuration for frontend
// This file injects environment variables for client-side consumption

// Set environment variables for the frontend
window.__ENV = {
  // Supabase Configuration
  SUPABASE_URL: 'https://cwkpprcemnspgeoezfrp.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3a3BwcmNlbW5zcGdlb2V6ZnJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzODM0MzQsImV4cCI6MjA4NDk1OTQzNH0.hivNj8arZ2ZsSsaaWRfPaw53t7Z0JEOz7fuHr9awx_w',
  
  // App Configuration
  APP_NAME: 'Sober Spokane',
  APP_VERSION: '1.0.0',
  ENVIRONMENT: 'production'
};

// Log environment setup
console.log('✅ Environment configuration loaded:', {
  supabaseUrl: window.__ENV.SUPABASE_URL ? 'Set' : 'Missing',
  supabaseKey: window.__ENV.SUPABASE_ANON_KEY ? 'Set' : 'Missing',
  environment: window.__ENV.ENVIRONMENT
});
