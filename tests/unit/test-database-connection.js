const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Database Connection...');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabaseConnection() {
  try {
    console.log('\n🔍 Testing basic connection...');
    
    // Test 1: Check if we can connect to Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('❌ Auth connection failed:', authError.message);
    } else {
      console.log('✅ Auth connection successful');
    }

    // Test 2: Check table structure
    console.log('\n🔍 Checking table structure...');
    
    // Check profiles_consolidated table
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles_consolidated')
        .select('*')
        .limit(1);
      
      if (profilesError) {
        console.log('❌ profiles_consolidated table error:', profilesError.message);
      } else {
        console.log('✅ profiles_consolidated table accessible');
        console.log('   Sample data structure:', Object.keys(profilesData[0] || {}));
      }
    } catch (e) {
      console.log('❌ profiles_consolidated table not accessible:', e.message);
    }

    // Check profiles view
    try {
      const { data: profilesViewData, error: profilesViewError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (profilesViewError) {
        console.log('❌ profiles view error:', profilesViewError.message);
      } else {
        console.log('✅ profiles view accessible');
        console.log('   Sample data structure:', Object.keys(profilesViewData[0] || {}));
      }
    } catch (e) {
      console.log('❌ profiles view not accessible:', e.message);
    }

    // Check recovery_milestones table
    try {
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('recovery_milestones')
        .select('*')
        .limit(1);
      
      if (milestonesError) {
        console.log('❌ recovery_milestones table error:', milestonesError.message);
      } else {
        console.log('✅ recovery_milestones table accessible');
        console.log('   Sample data structure:', Object.keys(milestonesData[0] || {}));
      }
    } catch (e) {
      console.log('❌ recovery_milestones table not accessible:', e.message);
    }

    // Test 3: Check if there are any users
    console.log('\n🔍 Checking for existing users...');
    try {
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) {
        console.log('❌ Could not list users:', usersError.message);
      } else {
        console.log(`✅ Found ${users.users.length} users in auth system`);
        if (users.users.length > 0) {
          console.log('   First user ID:', users.users[0].id);
          console.log('   First user email:', users.users[0].email);
        }
      }
    } catch (e) {
      console.log('❌ Could not access user list:', e.message);
    }

    console.log('\n✅ Database connection test completed');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabaseConnection();
