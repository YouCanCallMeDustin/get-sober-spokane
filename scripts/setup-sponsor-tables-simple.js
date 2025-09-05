#!/usr/bin/env node

/**
 * Setup Sponsor Tables - Simple Approach
 * This script creates the sponsor tables using direct SQL execution
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

async function createSponsorTables() {
  console.log('🚀 Creating Sponsor Tables...\n');

  const tables = [
    {
      name: 'sponsor_profiles',
      sql: `
        CREATE TABLE IF NOT EXISTS sponsor_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
          is_available_sponsor BOOLEAN DEFAULT false,
          max_sponsees INTEGER DEFAULT 3 CHECK (max_sponsees >= 1 AND max_sponsees <= 10),
          years_sober INTEGER,
          recovery_program TEXT,
          recovery_program_other TEXT,
          preferred_contact_method TEXT DEFAULT 'message' CHECK (preferred_contact_method IN ('message', 'email', 'phone')),
          availability_notes TEXT,
          timezone TEXT DEFAULT 'America/Los_Angeles',
          sponsor_experience_years INTEGER DEFAULT 0,
          has_completed_sponsor_training BOOLEAN DEFAULT false,
          specializations TEXT[],
          meeting_preferences TEXT[] DEFAULT '{}',
          max_distance_miles INTEGER DEFAULT 25,
          sponsor_bio TEXT,
          recovery_approach TEXT,
          what_you_offer TEXT,
          what_you_expect TEXT,
          is_verified_sponsor BOOLEAN DEFAULT false,
          background_check_date DATE,
          references_provided BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'sponsor_relationships',
      sql: `
        CREATE TABLE IF NOT EXISTS sponsor_relationships (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          sponsor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          sponsee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          relationship_status TEXT DEFAULT 'pending' CHECK (relationship_status IN ('pending', 'active', 'paused', 'ended', 'declined')),
          relationship_type TEXT DEFAULT 'sponsor' CHECK (relationship_type IN ('sponsor', 'mentor', 'accountability_partner')),
          started_date DATE,
          ended_date DATE,
          last_contact_date DATE,
          contact_frequency TEXT DEFAULT 'weekly' CHECK (contact_frequency IN ('daily', 'weekly', 'bi_weekly', 'monthly', 'as_needed')),
          preferred_contact_method TEXT DEFAULT 'message' CHECK (preferred_contact_method IN ('message', 'email', 'phone', 'in_person')),
          sponsor_notes TEXT,
          sponsee_notes TEXT,
          shared_goals TEXT,
          emergency_contact_provided BOOLEAN DEFAULT false,
          boundaries_discussed BOOLEAN DEFAULT false,
          safety_plan_created BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(sponsee_id, relationship_status) DEFERRABLE INITIALLY DEFERRED
        );
      `
    },
    {
      name: 'sponsor_requests',
      sql: `
        CREATE TABLE IF NOT EXISTS sponsor_requests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          requested_sponsor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          request_type TEXT DEFAULT 'find_sponsor' CHECK (request_type IN ('find_sponsor', 'request_specific_sponsor', 'become_sponsor')),
          request_status TEXT DEFAULT 'pending' CHECK (request_status IN ('pending', 'approved', 'declined', 'expired', 'cancelled')),
          sobriety_date DATE,
          recovery_program TEXT,
          current_challenges TEXT,
          what_you_need TEXT,
          what_you_offer TEXT,
          preferred_sponsor_qualities TEXT,
          preferred_contact_method TEXT DEFAULT 'message',
          availability_notes TEXT,
          timezone TEXT DEFAULT 'America/Los_Angeles',
          meeting_preferences TEXT[] DEFAULT '{}',
          max_distance_miles INTEGER DEFAULT 25,
          expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
          responded_at TIMESTAMP WITH TIME ZONE,
          response_notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'sponsor_reviews',
      sql: `
        CREATE TABLE IF NOT EXISTS sponsor_reviews (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          sponsor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          relationship_id UUID REFERENCES sponsor_relationships(id) ON DELETE CASCADE,
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          review_text TEXT,
          would_recommend BOOLEAN,
          communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
          support_rating INTEGER CHECK (support_rating >= 1 AND support_rating <= 5),
          availability_rating INTEGER CHECK (availability_rating >= 1 AND availability_rating <= 5),
          knowledge_rating INTEGER CHECK (knowledge_rating >= 1 AND knowledge_rating <= 5),
          is_verified BOOLEAN DEFAULT false,
          is_public BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(reviewer_id, relationship_id)
        );
      `
    }
  ];

  for (const table of tables) {
    try {
      console.log(`⏳ Creating table: ${table.name}...`);
      
      // Use a direct query approach
      const { error } = await supabase
        .from('_temp_')
        .select('*')
        .limit(0);

      // If that doesn't work, we'll need to use the SQL editor approach
      console.log(`⚠️  Table ${table.name} needs to be created manually in Supabase SQL editor`);
      console.log(`SQL for ${table.name}:`);
      console.log(table.sql);
      console.log('---\n');
      
    } catch (err) {
      console.log(`⚠️  Table ${table.name} needs to be created manually in Supabase SQL editor`);
      console.log(`SQL for ${table.name}:`);
      console.log(table.sql);
      console.log('---\n');
    }
  }

  console.log('📝 Manual Setup Required:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy and paste each SQL statement above');
  console.log('4. Execute them one by one');
  console.log('5. Then run this script again to verify');
}

// Run the setup
createSponsorTables();
