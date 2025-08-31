const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSpecificUser() {
  try {
    // Test with the first user ID we found
    const testUserId = 'e84a7281-1aae-4759-969d-26de0ec1435f';
    
    console.log('🔍 Testing specific user profile fetch...');
    console.log('User ID:', testUserId);
    
    // Test 1: Check if user exists in auth
    console.log('\n1. Checking auth user...');
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(testUserId);
    if (authError) {
      console.error('❌ Auth user error:', authError.message);
    } else {
      console.log('✅ Auth user found:', authUser.user.email);
    }
    
    // Test 2: Check if profile exists in profiles_consolidated
    console.log('\n2. Checking profiles_consolidated...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles_consolidated')
      .select('*')
      .eq('user_id', testUserId)
      .single();
    
    if (profileError) {
      console.log('❌ Profile error:', profileError.message);
    } else {
      console.log('✅ Profile found:', profileData);
    }
    
    // Test 3: Check if profile exists in profiles view
    console.log('\n3. Checking profiles view...');
    const { data: profileViewData, error: profileViewError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', testUserId)
      .single();
    
    if (profileViewError) {
      console.log('❌ Profile view error:', profileViewError.message);
    } else {
      console.log('✅ Profile view found:', profileViewData);
    }
    
    // Test 4: Check if milestones exist
    console.log('\n4. Checking recovery_milestones...');
    const { data: milestonesData, error: milestonesError } = await supabase
      .from('recovery_milestones')
      .select('*')
      .eq('user_id', testUserId);
    
    if (milestonesError) {
      console.log('❌ Milestones error:', milestonesError.message);
    } else {
      console.log(`✅ Found ${milestonesData.length} milestones:`, milestonesData);
    }
    
    console.log('\n✅ Specific user test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSpecificUser();
