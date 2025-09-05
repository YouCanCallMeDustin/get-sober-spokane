#!/usr/bin/env node

/**
 * Run Sponsor Table Migration
 * This script updates the sponsor_requests table with new column names
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

async function runMigration() {
  console.log('🔄 Running Sponsor Table Migration...\n');

  try {
    // First, let's check the current table structure
    console.log('📋 Checking current table structure...');
    const { data: currentData, error: currentError } = await supabase
      .from('sponsor_requests')
      .select('*')
      .limit(1);

    if (currentError) {
      console.log('❌ Error checking table:', currentError.message);
      return;
    }

    console.log('✅ Table exists');
    if (currentData.length > 0) {
      console.log('📊 Current columns:', Object.keys(currentData[0]));
    }

    // Try to add new columns by attempting an insert with the new fields
    console.log('\n🔧 Testing new column structure...');
    
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

    console.log('📝 Test data with new columns:');
    console.log(JSON.stringify(testData, null, 2));

    const { data, error } = await supabase
      .from('sponsor_requests')
      .insert(testData)
      .select();

    if (error) {
      console.log('❌ Insert error:', error.message);
      
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('\n💡 The new columns need to be added to the database.');
        console.log('Please run the following SQL in your Supabase SQL Editor:');
        console.log('\n-- Add new columns');
        console.log('ALTER TABLE sponsor_requests ADD COLUMN IF NOT EXISTS sponsor_experience TEXT;');
        console.log('ALTER TABLE sponsor_requests ADD COLUMN IF NOT EXISTS support_offer TEXT;');
        console.log('\n-- Drop old columns if they exist');
        console.log('ALTER TABLE sponsor_requests DROP COLUMN IF EXISTS current_challenges;');
        console.log('ALTER TABLE sponsor_requests DROP COLUMN IF EXISTS what_you_need;');
      }
    } else {
      console.log('✅ Insert successful with new columns!');
      console.log('📊 Inserted data:', data[0]);
      
      // Clean up the test record
      await supabase
        .from('sponsor_requests')
        .delete()
        .eq('id', data[0].id);
      
      console.log('🧹 Test record cleaned up');
      console.log('\n🎉 Migration completed successfully!');
    }

  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
}

// Run the migration
runMigration();
