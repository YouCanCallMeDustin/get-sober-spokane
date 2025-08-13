// Application Configuration
// Replace these values with your actual Supabase credentials

const CONFIG = {
    // Supabase Configuration
    SUPABASE_URL: 'YOUR_SUPABASE_URL',
    SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
    
    // App Configuration
    APP_NAME: 'Get Sober Spokane',
    APP_VERSION: '1.0.0',
    
    // Feature Flags
    ENABLE_EMAIL_AUTH: true,
    ENABLE_GOOGLE_AUTH: false,
    ENABLE_FACEBOOK_AUTH: false,
    
    // Email Templates
    EMAIL_TEMPLATES: {
        MAGIC_LINK: {
            SUBJECT: 'Sign in to Get Sober Spokane',
            BODY: 'Click the link below to sign in to your recovery dashboard:'
        }
    },
    
    // Redirect URLs
    REDIRECT_URLS: {
        AFTER_LOGIN: 'dashboard.html',
        AFTER_LOGOUT: 'login.html',
        LOGIN_PAGE: 'login.html'
    },
    
    // Local Storage Keys
    STORAGE_KEYS: {
        USER_SESSION: 'sober_spokane_user_session',
        USER_PREFERENCES: 'sober_spokane_user_preferences',
        THEME: 'sober_spokane_theme'
    }
};

// Export configuration
window.CONFIG = CONFIG;
