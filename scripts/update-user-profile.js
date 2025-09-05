#!/usr/bin/env node

/**
 * Update User Profile with Sponsor Badge
 * This script updates an existing user profile to add a sponsor badge
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

async function updateUserProfile(userId) {
  console.log(`👤 Updating user profile for: ${userId}\n`);

  try {
    // First, get the existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles_consolidated')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.log('❌ Error fetching existing profile:', fetchError.message);
      return;
    }

    console.log('📋 Current profile:');
    console.log(`👤 Display Name: ${existingProfile.display_name}`);
    console.log(`📝 Bio: ${existingProfile.bio}`);
    console.log('');

    // Update the profile to add sponsor badge
    const updatedProfile = {
      display_name: existingProfile.display_name || 'Sober Spokane Sponsor',
      bio: existingProfile.bio ? `${existingProfile.bio} 🌟 Verified Sponsor` : 'Committed to helping others in their recovery journey. 🌟 Verified Sponsor',
      updated_at: new Date().toISOString()
    };

    console.log('📝 Updating profile with sponsor badge:');
    console.log(JSON.stringify(updatedProfile, null, 2));
    console.log('');

    // Update the profile
    const { data: newProfile, error: updateError } = await supabase
      .from('profiles_consolidated')
      .update(updatedProfile)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.log('❌ Error updating profile:', updateError.message);
      return;
    }

    console.log('✅ User profile updated successfully!');
    console.log(`👤 Display Name: ${newProfile.display_name}`);
    console.log(`🌟 Sponsor Badge: 🌟 Verified Sponsor (in bio)`);
    console.log(`📧 Email: ${newProfile.email}`);
    console.log(`📍 Location: ${newProfile.location}`);
    console.log(`📅 Sobriety Date: ${newProfile.sobriety_date}`);
    console.log(`📝 Bio: ${newProfile.bio}`);

    console.log('\n🎉 Profile now shows sponsor badge!');
    console.log('💡 The sponsor badge will show up on your profile and in the Available Sponsors section.');

  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
}

// Get the user ID from command line or use the one we found
const userId = process.argv[2] || '2970cafe-b2dd-4414-804f-2fb7c390ed8a';
updateUserProfile(userId);
