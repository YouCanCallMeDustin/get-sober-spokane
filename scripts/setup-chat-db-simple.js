/**
 * Simple Chat Database Setup Script
 * Uses Supabase client operations instead of raw SQL
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function setupChatDatabase() {
    console.log('🚀 Setting up Chat Database (Simple Method)...');
    
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
        // Step 1: Create chat_rooms table if it doesn't exist
        console.log('📋 Step 1: Creating chat_rooms table...');
        const { error: roomsError } = await supabase.rpc('create_chat_rooms_table');
        if (roomsError) {
            console.log('ℹ️  chat_rooms table might already exist or needs manual creation');
        } else {
            console.log('✅ chat_rooms table created');
        }
        
        // Step 2: Create messages table if it doesn't exist
        console.log('📋 Step 2: Creating messages table...');
        const { error: messagesError } = await supabase.rpc('create_messages_table');
        if (messagesError) {
            console.log('ℹ️  messages table might already exist or needs manual creation');
        } else {
            console.log('✅ messages table created');
        }
        
        // Step 3: Create user_presence table if it doesn't exist
        console.log('📋 Step 3: Creating user_presence table...');
        const { error: presenceError } = await supabase.rpc('create_user_presence_table');
        if (presenceError) {
            console.log('ℹ️  user_presence table might already exist or needs manual creation');
        } else {
            console.log('✅ user_presence table created');
        }
        
        // Step 4: Insert default chat rooms
        console.log('📋 Step 4: Inserting default chat rooms...');
        const defaultRooms = [
            { name: 'general', description: 'General Support - General recovery support and community discussion' },
            { name: 'recovery', description: 'Recovery Journey - Share your recovery journey and milestones' },
            { name: 'crisis', description: 'Crisis Support - Immediate support for crisis situations' },
            { name: 'celebrations', description: 'Celebrations - Celebrate sobriety milestones and achievements' }
        ];
        
        for (const room of defaultRooms) {
            const { error } = await supabase
                .from('chat_rooms')
                .upsert(room, { onConflict: 'name' });
            
            if (error) {
                console.log(`⚠️  Could not insert room ${room.name}: ${error.message}`);
            } else {
                console.log(`✅ Inserted room: ${room.name}`);
            }
        }
        
        // Step 5: Verify tables exist
        console.log('📋 Step 5: Verifying tables...');
        
        const { data: rooms, error: roomsCheckError } = await supabase
            .from('chat_rooms')
            .select('name')
            .limit(1);
        
        if (roomsCheckError) {
            console.log('❌ chat_rooms table not accessible');
        } else {
            console.log('✅ chat_rooms table is accessible');
        }
        
        const { data: messages, error: messagesCheckError } = await supabase
            .from('messages')
            .select('id')
            .limit(1);
        
        if (messagesCheckError) {
            console.log('❌ messages table not accessible');
        } else {
            console.log('✅ messages table is accessible');
        }
        
        const { data: presence, error: presenceCheckError } = await supabase
            .from('user_presence')
            .select('id')
            .limit(1);
        
        if (presenceCheckError) {
            console.log('❌ user_presence table not accessible');
        } else {
            console.log('✅ user_presence table is accessible');
        }
        
        console.log('\n🎉 Chat database setup completed!');
        console.log('\n📋 Next steps:');
        console.log('1. Start your server: npm run start:server');
        console.log('2. Visit http://localhost:3000/chat to test the chat functionality');
        console.log('3. Check the browser console for any connection issues');
        
        console.log('\n⚠️  Note: If tables don\'t exist, you may need to create them manually in Supabase:');
        console.log('   - Go to your Supabase dashboard');
        console.log('   - Navigate to SQL Editor');
        console.log('   - Run the SQL from database/schemas/chat-schema.sql');
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    }
}

// Run the setup
setupChatDatabase();
