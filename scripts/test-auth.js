/**
 * Test Authentication Script
 * This script helps debug authentication issues
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testAuth() {
    console.log('🔍 Testing Authentication...');
    
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('❌ Missing required environment variables:');
        console.error('   - SUPABASE_URL');
        console.error('   - SUPABASE_ANON_KEY');
        process.exit(1);
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    try {
        console.log('\n📋 Step 1: Checking current session...');
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
            console.log('❌ Session error:', sessionError.message);
        } else if (session) {
            console.log('✅ User is authenticated:');
            console.log('   User ID:', session.user.id);
            console.log('   Email:', session.user.email);
            console.log('   Created at:', session.user.created_at);
            
            // Get user profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles_consolidated')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
            
            if (profileError) {
                console.log('❌ Profile error:', profileError.message);
            } else if (profile) {
                console.log('✅ User profile found:');
                console.log('   Display Name:', profile.display_name);
                console.log('   Username:', profile.username);
                console.log('   Avatar URL:', profile.avatar_url);
            } else {
                console.log('⚠️  No profile found for user');
            }
        } else {
            console.log('❌ No active session found');
            console.log('   User needs to log in');
        }
        
        console.log('\n📋 Step 2: Testing auth endpoints...');
        
        // Test if we can access auth endpoints
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
            console.log('❌ Auth error:', authError.message);
        } else if (authData.user) {
            console.log('✅ Auth user found:', authData.user.email);
        } else {
            console.log('❌ No auth user found');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testAuth();
