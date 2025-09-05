/**
 * Test Profile Data Script
 * Inserts test user data into the consolidated profiles table
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

async function insertTestProfiles() {
    console.log('🔄 Inserting test profile data...');
    
    try {
        // First, let's check if we have any auth users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
            console.error('❌ Error fetching auth users:', authError);
            return;
        }
        
        console.log(`📋 Found ${authUsers.users.length} auth users`);
        
        // Insert test profiles for each auth user
        for (const user of authUsers.users) {
            console.log(`📤 Inserting profile for user: ${user.email}`);
            
            const { error: insertError } = await supabase
                .from('profiles_consolidated')
                .upsert({
                    user_id: user.id,
                    email: user.email,
                    display_name: user.email?.split('@')[0] || 'TestUser',
                    bio: 'Test user for chat functionality',
                    location: 'Spokane, WA',
                    privacy_settings: 'public',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
            
            if (insertError) {
                console.error('❌ Error inserting profile:', insertError);
            } else {
                console.log(`✅ Profile inserted for ${user.email}`);
            }
        }
        
        // Verify the data
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles_consolidated')
            .select('*');
        
        if (profilesError) {
            console.error('❌ Error fetching profiles:', profilesError);
        } else {
            console.log(`✅ Total profiles in consolidated table: ${profiles.length}`);
            
            if (profiles.length > 0) {
                console.log('📋 Sample profile:');
                console.log(JSON.stringify(profiles[0], null, 2));
            }
        }
        
        console.log('🎉 Test profile data insertion completed!');
        
    } catch (error) {
        console.error('❌ Error during profile insertion:', error);
    }
}

// Run the script
insertTestProfiles();
