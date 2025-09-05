#!/usr/bin/env node

/**
 * Make User a Sponsor
 * This script creates a sponsor profile for a user based on their sponsor request
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

async function makeSponsor(userId) {
  console.log(`🤝 Making user ${userId} a sponsor...\n`);

  try {
    // First, get their sponsor request
    const { data: sponsorRequest, error: requestError } = await supabase
      .from('sponsor_requests')
      .select('*')
      .eq('requester_id', userId)
      .eq('request_type', 'become_sponsor')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (requestError || !sponsorRequest) {
      console.log('❌ No sponsor request found for this user');
      return;
    }

    console.log('📋 Found sponsor request:');
    console.log(`🏥 Recovery Program: ${sponsorRequest.recovery_program || 'Not specified'}`);
    console.log(`💼 Experience: ${sponsorRequest.sponsor_experience || 'Not specified'}`);
    console.log(`🤝 Support Offer: ${sponsorRequest.support_offer || 'Not specified'}`);
    console.log(`⏰ Availability: ${sponsorRequest.availability_notes || 'Not specified'}`);
    console.log('');

    // Calculate years sober from sobriety date
    let yearsSober = 0;
    if (sponsorRequest.sobriety_date) {
      const sobrietyDate = new Date(sponsorRequest.sobriety_date);
      const today = new Date();
      yearsSober = Math.floor((today - sobrietyDate) / (1000 * 60 * 60 * 24 * 365));
    }

    // Create sponsor profile
    const sponsorProfile = {
      user_id: userId,
      is_available_sponsor: true,
      is_verified_sponsor: true, // Since you're manually approving them
      max_sponsees: 3,
      years_sober: yearsSober,
      recovery_program: sponsorRequest.recovery_program,
      preferred_contact_method: sponsorRequest.preferred_contact_method || 'message',
      availability_notes: sponsorRequest.availability_notes,
      timezone: 'America/Los_Angeles',
      sponsor_experience_years: 0, // They're new to sponsoring
      has_completed_sponsor_training: false,
      specializations: ['early_recovery'], // Default specialization
      meeting_preferences: ['online', 'phone'], // Default preferences
      max_distance_miles: 25,
      sponsor_bio: sponsorRequest.sponsor_experience || 'New sponsor willing to help others in recovery.',
      recovery_approach: sponsorRequest.support_offer || 'Supportive mentorship approach.',
      what_you_offer: sponsorRequest.support_offer,
      what_you_expect: 'Commitment to recovery and willingness to work the program.',
      background_check_date: null,
      references_provided: false
    };

    console.log('📝 Creating sponsor profile with data:');
    console.log(JSON.stringify(sponsorProfile, null, 2));
    console.log('');

    // Insert the sponsor profile
    const { data: newSponsorProfile, error: insertError } = await supabase
      .from('sponsor_profiles')
      .insert(sponsorProfile)
      .select()
      .single();

    if (insertError) {
      console.log('❌ Error creating sponsor profile:', insertError.message);
      return;
    }

    console.log('✅ Sponsor profile created successfully!');
    console.log(`🎯 Available: ${newSponsorProfile.is_available_sponsor ? 'Yes' : 'No'}`);
    console.log(`✅ Verified: ${newSponsorProfile.is_verified_sponsor ? 'Yes' : 'No'}`);
    console.log(`📊 Max Sponsees: ${newSponsorProfile.max_sponsees}`);
    console.log(`📅 Years Sober: ${newSponsorProfile.years_sober}`);
    console.log(`🏥 Recovery Program: ${newSponsorProfile.recovery_program}`);
    console.log('');

    // Update the sponsor request status to approved
    const { error: updateError } = await supabase
      .from('sponsor_requests')
      .update({ 
        request_status: 'approved',
        response_notes: 'Approved and made available as sponsor',
        responded_at: new Date().toISOString()
      })
      .eq('requester_id', userId)
      .eq('request_type', 'become_sponsor');

    if (updateError) {
      console.log('⚠️ Warning: Could not update sponsor request status:', updateError.message);
    } else {
      console.log('✅ Sponsor request status updated to approved');
    }

    console.log('\n🎉 User is now a verified sponsor!');
    console.log('💡 They will now appear in the Available Sponsors section.');

  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
}

// Get the user ID from command line or use the one we found
const userId = process.argv[2] || '2970cafe-b2dd-4414-804f-2fb7c390ed8a';
makeSponsor(userId);
