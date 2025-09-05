#!/usr/bin/env node

/**
 * Create User Profile with Sponsor Badge
 * This script creates a user profile with a special sponsor indicator
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

async function createUserProfile(userId) {
  console.log(`👤 Creating user profile for: ${userId}\n`);

  try {
    // Get user info from auth
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError) {
      console.log('❌ Error getting auth user:', authError.message);
      return;
    }

    // Create a profile with sponsor indicator in bio
    const profile = {
      user_id: userId,
      email: authUser.user.email,
      display_name: 'Sober Spokane Sponsor',
      bio: 'Committed to helping others in their recovery journey. 🌟 Verified Sponsor',
      location: 'Spokane, WA',
      sobriety_date: '2022-03-03',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📝 Creating profile with sponsor badge in bio:');
    console.log(JSON.stringify(profile, null, 2));
    console.log('');

    // Insert the profile
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles_consolidated')
      .insert(profile)
      .select()
      .single();

    if (insertError) {
      console.log('❌ Error creating profile:', insertError.message);
      return;
    }

    console.log('✅ User profile created successfully!');
    console.log(`👤 Display Name: ${newProfile.display_name}`);
    console.log(`🌟 Sponsor Badge: 🌟 Verified Sponsor (in bio)`);
    console.log(`📧 Email: ${newProfile.email}`);
    console.log(`📍 Location: ${newProfile.location}`);
    console.log(`📅 Sobriety Date: ${newProfile.sobriety_date}`);
    console.log(`📝 Bio: ${newProfile.bio}`);

    console.log('\n🎉 User now has a complete profile with sponsor badge!');
    console.log('💡 The sponsor badge will show up on your profile and in the Available Sponsors section.');

  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
}

// Get the user ID from command line or use the one we found
const userId = process.argv[2] || '2970cafe-b2dd-4414-804f-2fb7c390ed8a';
createUserProfile(userId);
