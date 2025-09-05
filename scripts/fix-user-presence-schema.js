/**
 * Check the actual schema of the user_presence table and fix it
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

async function checkAndFixUserPresenceSchema() {
  console.log('🔍 Checking and fixing user_presence table schema...\n');

  try {
    // Try to insert a record with the expected schema
    const testData = {
      user_id: null,
      user_name: 'TestUser',
      last_seen: new Date().toISOString()
    };

    console.log('📋 Attempting to insert test record with available columns...');
    const { data: insertData, error: insertError } = await supabase
      .from('user_presence')
      .insert(testData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert error:', insertError);
      
      // Try to get more info about the table structure
      console.log('\n📋 Trying to get table structure...');
      const { data: structureData, error: structureError } = await supabase
        .rpc('get_table_structure', { table_name: 'user_presence' });

      if (structureError) {
        console.error('❌ Could not get table structure:', structureError);
      } else {
        console.log('📊 Table structure:', structureData);
      }
    } else {
      console.log('✅ Insert successful, record structure:', insertData);
      
      // Clean up test record
      await supabase
        .from('user_presence')
        .delete()
        .eq('id', insertData.id);
    }

    // Check if we need to create the missing columns
    console.log('\n📋 Checking if we need to add missing columns...');
    
    // Try to add missing columns one by one
    const missingColumns = [
      { name: 'room', type: 'TEXT' },
      { name: 'status', type: 'TEXT DEFAULT \'online\'' },
      { name: 'socket_id', type: 'TEXT' },
      { name: 'is_anonymous', type: 'BOOLEAN DEFAULT false' }
    ];

    for (const column of missingColumns) {
      try {
        console.log(`🔧 Adding column '${column.name}'...`);
        const { error: alterError } = await supabase.rpc('add_column_if_not_exists', {
          table_name: 'user_presence',
          column_name: column.name,
          column_type: column.type
        });

        if (alterError) {
          console.log(`⚠️ Could not add column '${column.name}': ${alterError.message}`);
        } else {
          console.log(`✅ Column '${column.name}' added successfully`);
        }
      } catch (err) {
        console.log(`❌ Error adding column '${column.name}': ${err.message}`);
      }
    }

    // Test the updated schema
    console.log('\n📋 Testing updated schema...');
    const updatedTestData = {
      user_id: null,
      user_name: 'TestUser2',
      room: 'general',
      status: 'online',
      socket_id: 'test-socket-456',
      is_anonymous: true,
      last_seen: new Date().toISOString()
    };

    const { data: updatedInsertData, error: updatedInsertError } = await supabase
      .from('user_presence')
      .insert(updatedTestData)
      .select()
      .single();

    if (updatedInsertError) {
      console.error('❌ Updated insert error:', updatedInsertError);
    } else {
      console.log('✅ Updated insert successful:', updatedInsertData);
      
      // Clean up test record
      await supabase
        .from('user_presence')
        .delete()
        .eq('id', updatedInsertData.id);
    }

  } catch (error) {
    console.error('❌ Schema check/fix failed:', error);
  }
}

checkAndFixUserPresenceSchema();
