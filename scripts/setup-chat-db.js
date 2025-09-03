/**
 * Chat Database Setup Script
 * Run this script to set up the chat tables in your Supabase database
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function setupChatDatabase() {
    console.log('🚀 Setting up Chat Database...');
    
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Missing Supabase environment variables');
        console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
        process.exit(1);
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
        // Read the chat schema SQL file
        const schemaPath = path.join(__dirname, '..', 'database', 'schemas', 'chat-schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('📖 Reading chat schema...');
        
        // Split the SQL into individual statements
        const statements = schemaSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`📝 Found ${statements.length} SQL statements to execute`);
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}...`);
            
            try {
                const { error } = await supabase.rpc('exec_sql', {
                    sql: statement + ';'
                });
                
                if (error) {
                    console.error(`❌ Error executing statement ${i + 1}:`, error);
                    // Continue with other statements
                } else {
                    console.log(`✅ Statement ${i + 1} executed successfully`);
                }
            } catch (err) {
                console.error(`❌ Exception executing statement ${i + 1}:`, err.message);
                // Continue with other statements
            }
        }
        
        // Verify the tables were created
        console.log('\n🔍 Verifying table creation...');
        
        const tablesToCheck = ['chat_rooms', 'messages', 'user_presence'];
        
        for (const tableName of tablesToCheck) {
            try {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .limit(1);
                
                if (error) {
                    console.error(`❌ Error checking table ${tableName}:`, error.message);
                } else {
                    console.log(`✅ Table ${tableName} exists and is accessible`);
                }
            } catch (err) {
                console.error(`❌ Exception checking table ${tableName}:`, err.message);
            }
        }
        
        // Check if default rooms were created
        console.log('\n🔍 Checking default chat rooms...');
        try {
            const { data: rooms, error } = await supabase
                .from('chat_rooms')
                .select('name, description');
            
            if (error) {
                console.error('❌ Error checking chat rooms:', error.message);
            } else {
                console.log('✅ Default chat rooms:');
                rooms.forEach(room => {
                    console.log(`   - ${room.name}: ${room.description}`);
                });
            }
        } catch (err) {
            console.error('❌ Exception checking chat rooms:', err.message);
        }
        
        console.log('\n🎉 Chat database setup completed!');
        console.log('\n📋 Next steps:');
        console.log('1. Start your server: npm run start:server');
        console.log('2. Visit http://localhost:3000/chat to test the chat functionality');
        console.log('3. Check the browser console for any connection issues');
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    }
}

// Run the setup if this script is executed directly
if (require.main === module) {
    setupChatDatabase();
}

module.exports = setupChatDatabase;
