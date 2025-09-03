/**
 * Check Database Structure Script
 * This script checks the current structure of the database tables
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkDatabaseStructure() {
    console.log('🔍 Checking Database Structure...');
    
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
        // Check if tables exist and their structure
        console.log('\n📋 Checking table existence...');
        
        // Check chat_rooms table
        const { data: roomsData, error: roomsError } = await supabase
            .from('chat_rooms')
            .select('*')
            .limit(1);
        
        if (roomsError) {
            console.log('❌ chat_rooms table does not exist or is not accessible');
        } else {
            console.log('✅ chat_rooms table exists');
            if (roomsData && roomsData.length > 0) {
                console.log('   Columns:', Object.keys(roomsData[0]));
            }
        }
        
        // Check messages table
        const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .limit(1);
        
        if (messagesError) {
            console.log('❌ messages table does not exist or is not accessible');
        } else {
            console.log('✅ messages table exists');
            if (messagesData && messagesData.length > 0) {
                console.log('   Columns:', Object.keys(messagesData[0]));
            }
        }
        
        // Check user_presence table
        const { data: presenceData, error: presenceError } = await supabase
            .from('user_presence')
            .select('*')
            .limit(1);
        
        if (presenceError) {
            console.log('❌ user_presence table does not exist or is not accessible');
        } else {
            console.log('✅ user_presence table exists');
            if (presenceData && presenceData.length > 0) {
                console.log('   Columns:', Object.keys(presenceData[0]));
            }
        }
        
        // Try to get table schema information
        console.log('\n📋 Checking table schemas...');
        
        // Check user_presence table structure by trying different column names
        const testQueries = [
            { name: 'room', query: 'SELECT room FROM user_presence LIMIT 1' },
            { name: 'room_id', query: 'SELECT room_id FROM user_presence LIMIT 1' },
            { name: 'room_name', query: 'SELECT room_name FROM user_presence LIMIT 1' }
        ];
        
        for (const test of testQueries) {
            try {
                const { error } = await supabase.rpc('exec_sql', { sql: test.query });
                if (!error) {
                    console.log(`✅ user_presence table has column: ${test.name}`);
                }
            } catch (e) {
                console.log(`❌ user_presence table does not have column: ${test.name}`);
            }
        }
        
        console.log('\n📋 Current user_presence data sample:');
        const { data: sampleData, error: sampleError } = await supabase
            .from('user_presence')
            .select('*')
            .limit(3);
        
        if (sampleError) {
            console.log('❌ Could not fetch sample data:', sampleError.message);
        } else if (sampleData && sampleData.length > 0) {
            console.log('Sample record:', JSON.stringify(sampleData[0], null, 2));
        } else {
            console.log('No data in user_presence table');
        }
        
    } catch (error) {
        console.error('❌ Error checking database structure:', error);
    }
}

// Run the check
checkDatabaseStructure();
