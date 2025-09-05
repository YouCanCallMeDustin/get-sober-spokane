#!/usr/bin/env node

/**
 * Update Sponsor Content
 * This script updates the sponsor profile with better, more professional content
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

async function updateSponsorContent(userId) {
  console.log(`📝 Updating sponsor content for user: ${userId}\n`);

  try {
    // Update the sponsor profile with better content
    const { data: updatedProfile, error: updateError } = await supabase
      .from('sponsor_profiles')
      .update({
        sponsor_bio: 'Experienced in recovery and committed to helping others on their journey to sobriety. I understand the challenges of early recovery and am here to provide support, guidance, and accountability.',
        recovery_approach: 'I believe in a supportive, non-judgmental approach to recovery. I focus on building trust, providing practical guidance, and helping you develop the tools you need for lasting sobriety.',
        what_you_offer: 'Daily check-ins, step work guidance, crisis support, accountability, and a listening ear. I\'m here to help you navigate the challenges of recovery and build a strong foundation for your sobriety.',
        what_you_expect: 'Commitment to your recovery, honesty in our communication, and willingness to work the program. I expect you to be open to guidance and to take responsibility for your actions.',
        availability_notes: 'Available for daily check-ins, evening meetings, and crisis support. I can accommodate different schedules and am flexible with meeting times.',
        specializations: ['early_recovery', 'relapse_prevention', 'step_work'],
        meeting_preferences: ['online', 'phone', 'in_person']
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.log('❌ Error updating sponsor profile:', updateError.message);
      return;
    }

    console.log('✅ Sponsor profile updated successfully!');
    console.log('📝 New content:');
    console.log(`💼 Bio: ${updatedProfile.sponsor_bio.substring(0, 100)}...`);
    console.log(`🎯 Approach: ${updatedProfile.recovery_approach.substring(0, 100)}...`);
    console.log(`🤝 What I Offer: ${updatedProfile.what_you_offer.substring(0, 100)}...`);
    console.log(`📋 What I Expect: ${updatedProfile.what_you_expect.substring(0, 100)}...`);
    console.log(`⏰ Availability: ${updatedProfile.availability_notes.substring(0, 100)}...`);
    console.log(`🎯 Specializations: ${updatedProfile.specializations.join(', ')}`);
    console.log(`📞 Meeting Preferences: ${updatedProfile.meeting_preferences.join(', ')}`);

    console.log('\n🎉 Sponsor profile now has professional, helpful content!');
    console.log('💡 They will appear much more professional in the Available Sponsors section.');

  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
}

// Get the user ID from command line or use the one we found
const userId = process.argv[2] || '2970cafe-b2dd-4414-804f-2fb7c390ed8a';
updateSponsorContent(userId);
