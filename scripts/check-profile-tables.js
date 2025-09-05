/**
 * Check Profile Tables Script
 * Checks what profile tables exist and their structure
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProfileTables() {
    console.log('🔍 Checking profile tables...');
    
    try {
        // Try to access different profile tables
        const tables = ['profiles', 'user_profiles', 'forum_user_profiles', 'profiles_consolidated'];
        
        for (const tableName of tables) {
            console.log(`\n📋 Checking ${tableName} table...`);
            
            try {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .limit(1);
                
                if (error) {
                    console.log(`❌ ${tableName}: ${error.message}`);
                } else {
                    console.log(`✅ ${tableName}: Accessible`);
                    if (data && data.length > 0) {
                        console.log(`📊 Sample data:`, JSON.stringify(data[0], null, 2));
                    } else {
                        console.log(`📊 No data in ${tableName}`);
                    }
                }
            } catch (err) {
                console.log(`❌ ${tableName}: ${err.message}`);
            }
        }
        
        console.log('\n🎉 Profile table check completed!');
        
    } catch (error) {
        console.error('❌ Error during table check:', error);
    }
}

// Run the script
checkProfileTables();
