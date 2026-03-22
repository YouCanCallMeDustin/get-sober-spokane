/**
 * Check sponsor_requests columns
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkColumns() {
    const { data, error } = await supabase.rpc('exec_sql', {
        sql: "SELECT column_name FROM information_schema.columns WHERE table_name = 'sponsor_requests';"
    });
    
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Columns:', data);
    }
}

checkColumns();
