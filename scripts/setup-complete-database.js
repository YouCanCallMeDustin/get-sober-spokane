/**
 * Complete Database Setup Script
 * This script will consolidate all tables and set up the chat system properly
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runCompleteDatabaseSetup() {
  console.log('🔧 Running Complete Database Setup...\n');

  try {
    // Step 1: Run the complete table consolidation
    console.log('📋 Step 1: Running table consolidation...');
    const consolidationSQL = fs.readFileSync(
      path.join(__dirname, '..', 'database', 'schemas', 'COMPLETE-TABLE-CONSOLIDATION.sql'), 
      'utf8'
    );

    const { error: consolidationError } = await supabase.rpc('exec_sql', { sql: consolidationSQL });
    
    if (consolidationError) {
      console.log('⚠️ Consolidation error (this might be expected if RPC is not available):', consolidationError.message);
      console.log('📋 You may need to run the consolidation script manually in Supabase SQL Editor');
    } else {
      console.log('✅ Table consolidation completed');
    }

    // Step 2: Run the fixed chat schema
    console.log('\n📋 Step 2: Setting up chat tables...');
    const chatSchemaSQL = fs.readFileSync(
      path.join(__dirname, '..', 'database', 'schemas', 'chat-schema-fixed.sql'), 
      'utf8'
    );

    const { error: chatError } = await supabase.rpc('exec_sql', { sql: chatSchemaSQL });
    
    if (chatError) {
      console.log('⚠️ Chat schema error (this might be expected if RPC is not available):', chatError.message);
      console.log('📋 You may need to run the chat schema script manually in Supabase SQL Editor');
    } else {
      console.log('✅ Chat schema setup completed');
    }

    // Step 3: Verify the setup
    console.log('\n📋 Step 3: Verifying database structure...');
    
    // Check if key tables exist
    const tablesToCheck = [
      'profiles_consolidated',
      'recovery_milestones', 
      'chat_rooms',
      'messages',
      'user_presence'
    ];

    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ Table '${tableName}': ${error.message}`);
        } else {
          console.log(`✅ Table '${tableName}': exists and accessible`);
        }
      } catch (err) {
        console.log(`❌ Table '${tableName}': ${err.message}`);
      }
    }

    // Step 4: Test chat functionality
    console.log('\n📋 Step 4: Testing chat functionality...');
    
    // Test inserting a chat room
    try {
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          name: 'test-room',
          description: 'Test room for verification'
        })
        .select()
        .single();

      if (roomError) {
        console.log('❌ Chat room insertion test failed:', roomError.message);
      } else {
        console.log('✅ Chat room insertion test passed');
        
        // Clean up test room
        await supabase
          .from('chat_rooms')
          .delete()
          .eq('id', roomData.id);
      }
    } catch (err) {
      console.log('❌ Chat room test failed:', err.message);
    }

    // Test user presence insertion
    try {
      const { data: presenceData, error: presenceError } = await supabase
        .from('user_presence')
        .insert({
          user_id: null,
          room: 'general',
          username: 'TestUser',
          status: 'online',
          socket_id: 'test-socket-123',
          is_anonymous: true,
          last_seen: new Date().toISOString()
        })
        .select()
        .single();

      if (presenceError) {
        console.log('❌ User presence insertion test failed:', presenceError.message);
      } else {
        console.log('✅ User presence insertion test passed');
        
        // Clean up test presence
        await supabase
          .from('user_presence')
          .delete()
          .eq('id', presenceData.id);
      }
    } catch (err) {
      console.log('❌ User presence test failed:', err.message);
    }

    console.log('\n📋 Step 5: Manual verification required...');
    console.log('🔧 If any tests failed, you need to run these SQL scripts manually in Supabase SQL Editor:');
    console.log('   1. database/schemas/COMPLETE-TABLE-CONSOLIDATION.sql');
    console.log('   2. database/schemas/chat-schema-fixed.sql');
    console.log('\n📋 After running the scripts, restart your chat server and test the online users functionality.');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

runCompleteDatabaseSetup();
