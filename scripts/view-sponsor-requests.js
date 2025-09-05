#!/usr/bin/env node

/**
 * View Sponsor Requests
 * This script shows all sponsor requests in the database
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

async function viewSponsorRequests() {
  console.log('📋 Viewing All Sponsor Requests...\n');

  try {
    // Get all sponsor requests
    const { data: requests, error } = await supabase
      .from('sponsor_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('❌ Error fetching requests:', error.message);
      return;
    }

    if (requests.length === 0) {
      console.log('📭 No sponsor requests found');
      return;
    }

    console.log(`📊 Found ${requests.length} sponsor request(s):\n`);

    requests.forEach((request, index) => {
      console.log(`--- Request ${index + 1} ---`);
      console.log(`📧 User ID: ${request.requester_id}`);
      console.log(`📅 Request Date: ${new Date(request.created_at).toLocaleDateString()}`);
      console.log(`🎯 Request Type: ${request.request_type}`);
      console.log(`📊 Status: ${request.request_status}`);
      console.log(`🏥 Recovery Program: ${request.recovery_program || 'Not specified'}`);
      console.log(`📅 Sobriety Date: ${request.sobriety_date || 'Not specified'}`);
      
      if (request.sponsor_experience) {
        console.log(`💼 Experience: ${request.sponsor_experience.substring(0, 100)}${request.sponsor_experience.length > 100 ? '...' : ''}`);
      }
      
      if (request.support_offer) {
        console.log(`🤝 Support Offer: ${request.support_offer.substring(0, 100)}${request.support_offer.length > 100 ? '...' : ''}`);
      }
      
      if (request.availability_notes) {
        console.log(`⏰ Availability: ${request.availability_notes.substring(0, 100)}${request.availability_notes.length > 100 ? '...' : ''}`);
      }
      
      console.log(`📞 Contact Method: ${request.preferred_contact_method || 'Not specified'}`);
      console.log('');
    });

    console.log('💡 To make someone a sponsor, use their User ID in the make-sponsor script');

  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
}

// Run the script
viewSponsorRequests();
