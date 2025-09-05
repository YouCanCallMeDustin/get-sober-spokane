#!/usr/bin/env node

/**
 * Check User Tables
 * This script checks what user-related tables exist and finds user information
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserTables(userId) {
  console.log(`🔍 Checking user information for: ${userId}\n`);

  try {
    // Check auth.users table
    console.log('🔐 Checking auth.users...');
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError) {
      console.log('❌ Auth user error:', authError.message);
    } else if (authUser) {
      console.log('✅ Found in auth.users:');
      console.log(`📧 Email: ${authUser.user.email}`);
      console.log(`📅 Created: ${new Date(authUser.user.created_at).toLocaleDateString()}`);
      console.log(`✅ Confirmed: ${authUser.user.email_confirmed_at ? 'Yes' : 'No'}`);
    }

    // Check profiles table
    console.log('\n👤 Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);

    if (profilesError) {
      console.log('❌ Profiles error:', profilesError.message);
    } else if (profiles && profiles.length > 0) {
      console.log('✅ Found in profiles:');
      profiles.forEach((profile, index) => {
        console.log(`--- Profile ${index + 1} ---`);
        console.log(`👤 Display Name: ${profile.display_name || 'Not set'}`);
        console.log(`📍 Location: ${profile.location || 'Not set'}`);
        console.log(`📅 Sobriety Date: ${profile.sobriety_date || 'Not set'}`);
        console.log(`📝 Bio: ${profile.bio || 'Not set'}`);
      });
    } else {
      console.log('📭 No profiles found');
    }

    // Check profiles_consolidated table
    console.log('\n👤 Checking profiles_consolidated table...');
    const { data: consolidatedProfiles, error: consolidatedError } = await supabase
      .from('profiles_consolidated')
      .select('*')
      .eq('id', userId);

    if (consolidatedError) {
      console.log('❌ Consolidated profiles error:', consolidatedError.message);
    } else if (consolidatedProfiles && consolidatedProfiles.length > 0) {
      console.log('✅ Found in profiles_consolidated:');
      consolidatedProfiles.forEach((profile, index) => {
        console.log(`--- Profile ${index + 1} ---`);
        console.log(`👤 Display Name: ${profile.display_name || 'Not set'}`);
        console.log(`📍 Location: ${profile.location || 'Not set'}`);
        console.log(`📅 Sobriety Date: ${profile.sobriety_date || 'Not set'}`);
        console.log(`📝 Bio: ${profile.bio || 'Not set'}`);
      });
    } else {
      console.log('📭 No consolidated profiles found');
    }

    // Check if they already have a sponsor profile
    console.log('\n🤝 Checking sponsor_profiles table...');
    const { data: sponsorProfile, error: sponsorError } = await supabase
      .from('sponsor_profiles')
      .select('*')
      .eq('user_id', userId);

    if (sponsorError) {
      console.log('❌ Sponsor profile error:', sponsorError.message);
    } else if (sponsorProfile && sponsorProfile.length > 0) {
      console.log('✅ Found existing sponsor profile:');
      console.log(`🎯 Available: ${sponsorProfile[0].is_available_sponsor ? 'Yes' : 'No'}`);
      console.log(`✅ Verified: ${sponsorProfile[0].is_verified_sponsor ? 'Yes' : 'No'}`);
      console.log(`📊 Max Sponsees: ${sponsorProfile[0].max_sponsees}`);
    } else {
      console.log('📭 No sponsor profile found - we can create one!');
    }

  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
}

// Get the user ID from command line or use the one we found
const userId = process.argv[2] || '2970cafe-b2dd-4414-804f-2fb7c390ed8a';
checkUserTables(userId);
