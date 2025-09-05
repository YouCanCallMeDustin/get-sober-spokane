/**
 * Test script to verify chat user presence functionality
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testChatPresence() {
  console.log('🔍 Testing Chat User Presence...\n');

  try {
    // Check current user presence data
    console.log('📋 Current user_presence data:');
    const { data: presenceData, error: presenceError } = await supabase
      .from('user_presence')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (presenceError) {
      console.error('❌ Error fetching presence data:', presenceError);
      return;
    }

    if (presenceData.length === 0) {
      console.log('📭 No user presence records found');
    } else {
      console.log(`📊 Found ${presenceData.length} presence records:`);
      presenceData.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.username} (${record.is_anonymous ? 'Anonymous' : 'Authenticated'}) in ${record.room} - ${record.status} (${record.last_seen})`);
      });
    }

    // Check chat rooms
    console.log('\n📋 Chat rooms:');
    const { data: rooms, error: roomsError } = await supabase
      .from('chat_rooms')
      .select('*');

    if (roomsError) {
      console.error('❌ Error fetching rooms:', roomsError);
      return;
    }

    console.log(`📊 Found ${rooms.length} chat rooms:`);
    rooms.forEach(room => {
      console.log(`  - ${room.name}: ${room.description}`);
    });

    // Test inserting a sample presence record
    console.log('\n🧪 Testing presence record insertion...');
    const testPresenceData = {
      user_id: null, // Anonymous user
      room: 'general',
      username: 'TestUser',
      status: 'online',
      socket_id: 'test-socket-123',
      is_anonymous: true,
      last_seen: new Date().toISOString()
    };

    const { data: insertedRecord, error: insertError } = await supabase
      .from('user_presence')
      .insert(testPresenceData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error inserting test presence:', insertError);
    } else {
      console.log('✅ Test presence record inserted successfully');
      console.log(`   ID: ${insertedRecord.id}`);
      console.log(`   Username: ${insertedRecord.username}`);
      console.log(`   Room: ${insertedRecord.room}`);
      console.log(`   Status: ${insertedRecord.status}`);

      // Clean up test record
      const { error: deleteError } = await supabase
        .from('user_presence')
        .delete()
        .eq('id', insertedRecord.id);

      if (deleteError) {
        console.error('⚠️ Warning: Could not clean up test record:', deleteError);
      } else {
        console.log('🧹 Test record cleaned up');
      }
    }

    // Check online users for each room
    console.log('\n📋 Online users by room:');
    for (const room of rooms) {
      const { data: onlineUsers, error: onlineError } = await supabase
        .from('user_presence')
        .select('username, user_id, is_anonymous, status, last_seen')
        .eq('room', room.name)
        .eq('status', 'online')
        .order('username');

      if (onlineError) {
        console.error(`❌ Error fetching online users for ${room.name}:`, onlineError);
        continue;
      }

      console.log(`  ${room.name}: ${onlineUsers.length} online users`);
      onlineUsers.forEach(user => {
        console.log(`    - ${user.username} (${user.is_anonymous ? 'Anonymous' : 'Authenticated'}) - ${user.last_seen}`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testChatPresence();
