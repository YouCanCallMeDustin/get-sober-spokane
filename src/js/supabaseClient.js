// src/js/supabaseClient.js
const SUPABASE_URL = 'https://iquczuhmkemjytrqnbxg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdWN6dWhta2Vtanl0cnFuYnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMDMzMjcsImV4cCI6MjA2OTY3OTMyN30.FFzZFBUAM1ZgQSTlzPNSuJIikUiQkvSBKvc19wdzulk';

// Initialize Supabase client when the library is available
function initializeSupabase() {
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
        setTimeout(initializeSupabase, 100);
    }
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