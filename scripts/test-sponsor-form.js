#!/usr/bin/env node

/**
 * Test Sponsor Form with New Field Names
 * This script tests that the sponsor form is working with the updated field names
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

async function testSponsorForm() {
  console.log('🧪 Testing Sponsor Form with New Field Names...\n');

  try {
    // Test data with the new field names
    const testData = {
      requester_id: 'e84a7281-1aae-4759-969d-26de0ec1435f', // Use existing user ID
      request_type: 'become_sponsor',
      sobriety_date: '2024-01-01',
      recovery_program: 'AA',
      sponsor_experience: 'I have no experience but I\'m willing to learn and try.',
      support_offer: 'I can offer support like mentorship, 1 on 1, and somebody that they have to talk to at anytime.',
      availability_notes: 'I am available 24/7.',
      preferred_contact_method: 'message',
      request_status: 'pending'
    };

    console.log('📝 Test data with new field names:');
    console.log(JSON.stringify(testData, null, 2));

    const { data, error } = await supabase
      .from('sponsor_requests')
      .insert(testData)
      .select();

    if (error) {
      console.log('❌ Insert error:', error.message);
      return;
    }

    console.log('✅ Insert successful with new field names!');
    console.log('📊 Inserted data:', data[0]);
    
    // Clean up the test record
    await supabase
      .from('sponsor_requests')
      .delete()
      .eq('id', data[0].id);
    
    console.log('🧹 Test record cleaned up');
    console.log('\n🎉 Sponsor form test completed successfully!');
    console.log('💡 The form should now work correctly with the new sponsor-specific questions.');

  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
}

// Run the test
testSponsorForm();
