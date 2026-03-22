/**
 * Check columns of sponsor_requests using a simple select
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkColumns() {
    const { data, error } = await supabase
        .from('sponsor_requests')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error('Error:', error);
    } else {
        // Even if data is empty, we can get keys if there is at least one result
        // But if empty, we can't. Let's try to insert a dummy and delete it.
        console.log('Sample Row:', data[0]);
    }
}

checkColumns();
