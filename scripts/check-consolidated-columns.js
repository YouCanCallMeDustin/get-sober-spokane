/**
 * Check profiles_consolidated columns
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkColumns() {
    const { data, error } = await supabase.rpc('exec_sql', {
        sql: "SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles_consolidated';"
    });
    
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Columns:', data);
    }
}

checkColumns();
