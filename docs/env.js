// Environment configuration for frontend
// This file injects environment variables for client-side consumption

// Set environment variables for the frontend
window.__ENV = {
  // Supabase Configuration
  SUPABASE_URL: 'https://iquczuhmkemjytrqnbxg.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdWN6dWhta2Vtanl0cnFuYnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMDMzMjcsImV4cCI6MjA2OTY3OTMyN30.FFzZFBUAM1ZgQSTlzPNSuJIikUiQkvSBKvc19wdzulk',
  
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
