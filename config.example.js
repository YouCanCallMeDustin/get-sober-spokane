// config.example.js - Template for secure configuration
// Copy this file to config.js and add your actual credentials
// Make sure to add config.js to your .gitignore file

window.SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL_HERE',
    anonKey: 'YOUR_SUPABASE_ANON_KEY_HERE'
};

// Environment-based configuration (for production)
// Set these environment variables in your build process:
// SUPABASE_URL=your_actual_url
// SUPABASE_ANON_KEY=your_actual_anon_key