#!/usr/bin/env node

/**
 * Check Sponsor Tables
 * This script checks if the sponsor tables exist and provides setup instructions
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

async function checkSponsorTables() {
  console.log('🔍 Checking Sponsor Tables...\n');

  const tables = [
    'sponsor_profiles',
    'sponsor_relationships', 
    'sponsor_requests',
    'sponsor_reviews'
  ];

  let allTablesExist = true;

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Table ${table}: ${error.message}`);
        allTablesExist = false;
      } else {
        console.log(`✅ Table ${table}: Exists`);
      }
    } catch (err) {
      console.log(`❌ Table ${table}: ${err.message}`);
      allTablesExist = false;
    }
  }

  if (!allTablesExist) {
    console.log('\n📝 Setup Required:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of scripts/create-sponsor-tables.sql');
    console.log('4. Execute the SQL statements');
    console.log('5. Run this script again to verify');
    console.log('\n📄 SQL file location: scripts/create-sponsor-tables.sql');
  } else {
    console.log('\n🎉 All sponsor tables exist! The sponsor feature should work now.');
  }
}

// Run the check
checkSponsorTables();
