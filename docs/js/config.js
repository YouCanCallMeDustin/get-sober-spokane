// Application Configuration
// Replace these values with your actual Supabase credentials

const CONFIG = {
    // Supabase Configuration
    SUPABASE_URL: 'https://iquczuhmkemjytrqnbxg.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdWN6dWhta2Vtanl0cnFuYnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMDMzMjcsImV4cCI6MjA2OTY3OTMyN30.FFzZFBUAM1ZgQSTlzPNSuJIikUiQkvSBKvc19wdzulk',
    
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
        THEME: 'sober_spokane_theme',
        MAGIC_LINK_LAST_SENT: 'sober_spokane_magic_last_sent'
    },

    // Auth Settings
    AUTH: {
        MAGIC_LINK_COOLDOWN_SECONDS: 15
    }
};

// Export configuration
window.CONFIG = CONFIG;

// Robust Supabase initialization with retries to avoid race conditions
function getSupabaseGlobal() {
    return window.supabase || window.Supabase || null;
}

// Dynamically load Supabase library with fallbacks if CDN fails
let supabaseLoadStarted = false;
async function loadSupabaseLibrary() {
    if (getSupabaseGlobal()) return true;
    if (supabaseLoadStarted) return true;
    supabaseLoadStarted = true;

    const sources = [
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.35.5/dist/umd/supabase.min.js',
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
        'https://unpkg.com/@supabase/supabase-js@2.35.5/dist/umd/supabase.min.js'
    ];

    function inject(src) {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.head.appendChild(script);
        });
    }

    for (const src of sources) {
        // If already available, stop
        if (getSupabaseGlobal()) return true;
        const ok = await inject(src);
        // Give the global a tick to attach
        await new Promise(r => setTimeout(r, 100));
        if (ok && getSupabaseGlobal()) return true;
    }
    return !!getSupabaseGlobal();
}

async function initSupabaseWithRetry(maxAttempts = 30, delayMs = 150) {
    // Try to load the library if it's not present
    if (!getSupabaseGlobal()) {
        await loadSupabaseLibrary();
    }
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const supa = getSupabaseGlobal();
        if (supa && typeof supa.createClient === 'function') {
            window.supabase = supa; // normalize to window.supabase
            if (!window.supabaseClient) {
                try {
                    window.supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
                } catch (e) {
                    // If creation failed, keep retrying
                }
            }
            if (window.supabaseClient) return true;
        }
        await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    console.error('Supabase library not loaded after retries.');
    return false;
}

// Kick off initialization immediately
initSupabaseWithRetry();

// Expose initializer for manual calls if needed
window.initSupabaseWithRetry = initSupabaseWithRetry;
