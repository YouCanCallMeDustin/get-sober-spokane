// src/js/supabaseClient.js
// Security Fix: Load sensitive configuration from environment variables or secure config
const SUPABASE_URL = process.env.SUPABASE_URL || window.SUPABASE_CONFIG?.url;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || window.SUPABASE_CONFIG?.anonKey;

// Validate configuration is available
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Supabase configuration is missing. Please check environment variables or SUPABASE_CONFIG.');
}

// Initialize Supabase client when the library is available
function initializeSupabase() {
    let attempts = 0;
    const maxAttempts = 150; // 15 seconds maximum wait time
    
    function attemptInit() {
        if (typeof supabase !== 'undefined') {
            console.log('Creating Supabase client with URL:', SUPABASE_URL);
            console.log('API key length:', SUPABASE_ANON_KEY.length);
            
            window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase client initialized');
            console.log('window.supabase available:', !!window.supabase);
            console.log('window.supabase.auth available:', !!window.supabase?.auth);
            
            // Test the client immediately
            testClientConnection();
        } else {
            attempts++;
            if (attempts < maxAttempts) {
                setTimeout(attemptInit, 100);
            } else {
                console.error('Failed to initialize Supabase after 15 seconds. Supabase library not available.');
            }
        }
    }
    
    attemptInit();
}

// Test the client connection
async function testClientConnection() {
    try {
        console.log('Testing client connection...');
        const { data, error } = await window.supabase.auth.getSession();
        if (error) {
            console.error('Client connection test failed:', error);
        } else {
            console.log('Client connection test successful');
        }
    } catch (error) {
        console.error('Client connection test error:', error);
    }
}

// Start initialization
initializeSupabase();