/**
 * Check a single profile record for all available fields
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfile() {
    // Get first user ID from profiles_consolidated
    const { data: userData } = await supabase.from('profiles_consolidated').select('user_id').limit(1).single();
    
    if (userData) {
        const { data, error } = await supabase
            .from('profiles_consolidated')
            .select('*')
            .eq('user_id', userData.user_id)
            .single();
        
        if (error) {
            console.error('Error:', error);
        } else {
            console.log('Profile Fields:', Object.keys(data));
            console.log('Sample Data:', data);
        }
    } else {
        console.log('No user profiles found');
    }
}

checkProfile();
