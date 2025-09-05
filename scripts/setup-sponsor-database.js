#!/usr/bin/env node

/**
 * Setup Sponsor Database Schema
 * This script creates the necessary tables for the sponsor feature
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env file for SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupSponsorDatabase() {
  console.log('🚀 Setting up Sponsor Database Schema...\n');

  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'sql-scripts', 'sponsor-feature-schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Schema file not found:', schemaPath);
      process.exit(1);
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.length === 0) {
        continue;
      }

      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });

        if (error) {
          // Some errors are expected (like "already exists")
          if (error.message.includes('already exists') || 
              error.message.includes('already exists') ||
              error.message.includes('duplicate key')) {
            console.log(`⚠️  Statement ${i + 1}: ${error.message}`);
          } else {
            console.error(`❌ Statement ${i + 1} failed:`, error.message);
            console.error(`SQL: ${statement.substring(0, 100)}...`);
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`❌ Statement ${i + 1} error:`, err.message);
      }
    }

    console.log('\n🔍 Verifying table creation...');

    // Check if tables were created
    const tables = [
      'sponsor_profiles',
      'sponsor_relationships', 
      'sponsor_requests',
      'sponsor_reviews'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: Created successfully`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }

    console.log('\n🎉 Sponsor database setup completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Test the sponsor form submission');
    console.log('2. Create some sample sponsor profiles');
    console.log('3. Test the sponsor matching functionality');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupSponsorDatabase();
