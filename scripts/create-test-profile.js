/**
 * Simple Test Profile Script
 * Creates a simple test profile for chat testing
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

async function createTestProfile() {
    console.log('🔄 Creating test profile...');
    
    try {
        // Create a test profile with a dummy user_id
        const testUserId = '00000000-0000-0000-0000-000000000001';
        
        const { error: insertError } = await supabase
            .from('profiles_consolidated')
            .upsert({
                user_id: testUserId,
                email: 'test@soberspokane.com',
                display_name: 'TestUser',
                bio: 'Test user for chat functionality',
                location: 'Spokane, WA',
                privacy_settings: 'public',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
        
        if (insertError) {
            console.error('❌ Error inserting test profile:', insertError);
        } else {
            console.log('✅ Test profile created successfully');
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
        
        console.log('🎉 Test profile creation completed!');
        
    } catch (error) {
        console.error('❌ Error during profile creation:', error);
    }
}

// Run the script
createTestProfile();
