/**
 * Debug Database Tables Script
 * This script helps debug table creation and access issues
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function debugDatabaseTables() {
    console.log('🔍 Debugging Database Tables...');
    
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Missing required environment variables:');
        console.error('   - SUPABASE_URL');
        console.error('   - SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
        console.log('\n📋 Step 1: Checking all tables in the database...');
        
        // Try to get all tables
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name, table_schema')
            .eq('table_schema', 'public');
        
        if (tablesError) {
            console.log('❌ Could not query information_schema:', tablesError.message);
        } else {
            console.log('✅ Available tables in public schema:');
            tables.forEach(table => {
                console.log(`   - ${table.table_name} (schema: ${table.table_schema})`);
            });
        }
        
        console.log('\n📋 Step 2: Testing direct table access...');
        
        // Test chat_rooms table
        console.log('\n🔍 Testing chat_rooms table...');
        const { data: roomsData, error: roomsError } = await supabase
            .from('chat_rooms')
            .select('*')
            .limit(1);
        
        if (roomsError) {
            console.log('❌ chat_rooms error:', roomsError.message);
            console.log('   Code:', roomsError.code);
            console.log('   Details:', roomsError.details);
        } else {
            console.log('✅ chat_rooms table is accessible');
            console.log('   Sample data:', roomsData);
        }
        
        // Test messages table
        console.log('\n🔍 Testing messages table...');
        const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .limit(1);
        
        if (messagesError) {
            console.log('❌ messages error:', messagesError.message);
            console.log('   Code:', messagesError.code);
            console.log('   Details:', messagesError.details);
        } else {
            console.log('✅ messages table is accessible');
            console.log('   Sample data:', messagesData);
        }
        
        // Test user_presence table
        console.log('\n🔍 Testing user_presence table...');
        const { data: presenceData, error: presenceError } = await supabase
            .from('user_presence')
            .select('*')
            .limit(1);
        
        if (presenceError) {
            console.log('❌ user_presence error:', presenceError.message);
            console.log('   Code:', presenceError.code);
            console.log('   Details:', presenceError.details);
        } else {
            console.log('✅ user_presence table is accessible');
            console.log('   Sample data:', presenceData);
        }
        
        console.log('\n📋 Step 3: Testing table creation...');
        
        // Try to create a test table to see if we have permissions
        console.log('\n🔍 Testing table creation permissions...');
        const { error: createError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS test_table_debug (
                    id SERIAL PRIMARY KEY,
                    name TEXT,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            `
        });
        
        if (createError) {
            console.log('❌ Cannot create tables via RPC:', createError.message);
            console.log('   This means you need to create tables manually in Supabase dashboard');
        } else {
            console.log('✅ Can create tables via RPC');
            
            // Clean up test table
            await supabase.rpc('exec_sql', {
                sql: 'DROP TABLE IF EXISTS test_table_debug;'
            });
        }
        
        console.log('\n📋 Step 4: Environment variables check...');
        console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
        console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
}

// Run the debug
debugDatabaseTables();
