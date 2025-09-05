/**
 * Check the actual schema of the user_presence table
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

async function checkUserPresenceSchema() {
  console.log('🔍 Checking user_presence table schema...\n');

  try {
    // Try to get the table structure by attempting to select all columns
    const { data, error } = await supabase
      .from('user_presence')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error accessing user_presence table:', error);
      
      // Try to get table info using a different approach
      console.log('\n📋 Trying alternative approach...');
      
      // Try to insert a minimal record to see what columns are required
      const testData = {
        room: 'test',
        user_name: 'TestUser',
        status: 'online'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('user_presence')
        .insert(testData)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Insert error (this helps us understand the schema):', insertError);
      } else {
        console.log('✅ Insert successful, record structure:', insertData);
        
        // Clean up test record
        await supabase
          .from('user_presence')
          .delete()
          .eq('id', insertData.id);
      }
    } else {
      console.log('✅ user_presence table is accessible');
      console.log('📊 Sample record structure:', data[0] || 'No records found');
    }

    // Try to get table columns by attempting different column names
    console.log('\n📋 Testing column names...');
    
    const columnTests = [
      'username',
      'user_name', 
      'is_anonymous',
      'socket_id',
      'user_id',
      'room',
      'status',
      'last_seen'
    ];

    for (const column of columnTests) {
      try {
        const { data: testData, error: testError } = await supabase
          .from('user_presence')
          .select(column)
          .limit(1);

        if (testError) {
          console.log(`❌ Column '${column}': ${testError.message}`);
        } else {
          console.log(`✅ Column '${column}': exists`);
        }
      } catch (err) {
        console.log(`❌ Column '${column}': ${err.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkUserPresenceSchema();
