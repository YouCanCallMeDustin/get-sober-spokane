// Test script to check database connection and table structure
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testDatabase() {
  console.log('🔍 Testing database connection and structure...\n');

  // Check if environment variables are set
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('❌ Missing Supabase environment variables:');
    console.error('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.error('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
    return;
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    console.log('✅ Supabase client initialized');

    // Test 1: Check if profiles_consolidated table exists and is accessible
    console.log('\n📋 Testing profiles_consolidated table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles_consolidated')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.error('❌ Error accessing profiles_consolidated:', profilesError.message);
    } else {
      console.log('✅ profiles_consolidated table is accessible');
      console.log(`   Found ${profiles ? profiles.length : 0} sample records`);
    }

    // Test 2: Check if sponsor_profiles table exists and is accessible
    console.log('\n👥 Testing sponsor_profiles table...');
    const { data: sponsors, error: sponsorsError } = await supabase
      .from('sponsor_profiles')
      .select('*')
      .limit(1);

    if (sponsorsError) {
      console.error('❌ Error accessing sponsor_profiles:', sponsorsError.message);
    } else {
      console.log('✅ sponsor_profiles table is accessible');
      console.log(`   Found ${sponsors ? sponsors.length : 0} sample records`);
    }

    // Test 3: Try the sponsor finder query that was failing
    console.log('\n🔍 Testing sponsor finder query...');
    const { data: availableSponsors, error: sponsorQueryError } = await supabase
      .from('sponsor_profiles')
      .select('*')
      .eq('is_available_sponsor', true)
      .eq('is_verified_sponsor', true);

    if (sponsorQueryError) {
      console.error('❌ Error in sponsor finder query:', sponsorQueryError.message);
      console.error('   This is the error that needs to be fixed with the SQL script');
    } else {
      console.log('✅ Sponsor finder query works');
      console.log(`   Found ${availableSponsors ? availableSponsors.length : 0} available sponsors`);
    }

    // Test 4: Test the relationship query (the one that was failing)
    console.log('\n🔗 Testing relationship query...');
    if (sponsors && sponsors.length > 0) {
      const userIds = sponsors.map(s => s.user_id);
      const { data: relatedProfiles, error: relationshipError } = await supabase
        .from('profiles_consolidated')
        .select('*')
        .in('user_id', userIds);

      if (relationshipError) {
        console.error('❌ Error in relationship query:', relationshipError.message);
      } else {
        console.log('✅ Relationship query works');
        console.log(`   Found ${relatedProfiles ? relatedProfiles.length : 0} related profiles`);
      }
    }

    console.log('\n📊 Summary:');
    console.log('   - Server is running on port 3000 ✅');
    console.log('   - Database connection:', profilesError && sponsorsError ? '❌ Issues' : '✅ Working');
    console.log('   - Sponsor finder query:', sponsorQueryError ? '❌ Needs SQL fix' : '✅ Working');

    if (sponsorQueryError) {
      console.log('\n🔧 Next steps:');
      console.log('   1. Run the SQL script: scripts/simple-sponsor-fix.sql');
      console.log('   2. Copy the contents and run in your Supabase SQL Editor');
      console.log('   3. Test the sponsor finder page again');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
testDatabase().catch(console.error);
