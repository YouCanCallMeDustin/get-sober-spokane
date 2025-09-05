#!/usr/bin/env node

/**
 * Get User Profile Information
 * This script gets profile information for a specific user
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

async function getUserProfile(userId) {
  console.log(`👤 Getting profile for user: ${userId}\n`);

  try {
    // Get user profile from profiles_consolidated table
    const { data: profiles, error } = await supabase
      .from('profiles_consolidated')
      .select('*')
      .eq('id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.log('❌ Error fetching profile:', error.message);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log('❌ No profile found for this user');
      return;
    }

    // Use the most recent profile
    const profile = profiles[0];
    console.log('📋 User Profile Information:');
    console.log(`👤 Display Name: ${profile.display_name || 'Not set'}`);
    console.log(`📧 Email: ${profile.email || 'Not set'}`);
    console.log(`📍 Location: ${profile.location || 'Not set'}`);
    console.log(`📅 Sobriety Date: ${profile.sobriety_date || 'Not set'}`);
    console.log(`📝 Bio: ${profile.bio || 'Not set'}`);
    console.log(`🖼️ Avatar URL: ${profile.avatar_url || 'Not set'}`);
    console.log(`📅 Created: ${new Date(profile.created_at).toLocaleDateString()}`);
    console.log('');

    // Also get their sponsor request
    const { data: sponsorRequest, error: requestError } = await supabase
      .from('sponsor_requests')
      .select('*')
      .eq('requester_id', userId)
      .eq('request_type', 'become_sponsor')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!requestError && sponsorRequest) {
      console.log('📋 Sponsor Request Information:');
      console.log(`🏥 Recovery Program: ${sponsorRequest.recovery_program || 'Not specified'}`);
      console.log(`💼 Experience: ${sponsorRequest.sponsor_experience || 'Not specified'}`);
      console.log(`🤝 Support Offer: ${sponsorRequest.support_offer || 'Not specified'}`);
      console.log(`⏰ Availability: ${sponsorRequest.availability_notes || 'Not specified'}`);
      console.log(`📞 Contact Method: ${sponsorRequest.preferred_contact_method || 'Not specified'}`);
    }

  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
}

// Get the user ID from command line or use the one we found
const userId = process.argv[2] || '2970cafe-b2dd-4414-804f-2fb7c390ed8a';
getUserProfile(userId);
