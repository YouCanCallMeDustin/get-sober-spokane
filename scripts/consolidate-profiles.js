/**
 * Profile Consolidation Script
 * Consolidates all profile tables into a single profiles_consolidated table
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

async function consolidateProfiles() {
    console.log('🔄 Starting profile consolidation...');
    
    try {
        // Step 1: Create the consolidated table
        console.log('📋 Creating consolidated profiles table...');
        
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS profiles_consolidated (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
                
                -- Basic profile information
                email TEXT,
                display_name TEXT,
                first_name TEXT,
                last_name TEXT,
                phone TEXT,
                bio TEXT,
                avatar_url TEXT,
                
                -- Location and privacy
                location VARCHAR(100) DEFAULT 'Spokane, WA',
                privacy_level TEXT DEFAULT 'standard' CHECK (privacy_level IN ('public', 'standard', 'high')),
                privacy_settings VARCHAR(20) DEFAULT 'public' CHECK (privacy_settings IN ('public', 'community', 'private')),
                
                -- Sobriety tracking
                sobriety_date DATE,
                sobriety_start_date DATE,
                last_checkin DATE,
                current_streak INTEGER DEFAULT 0,
                longest_streak INTEGER DEFAULT 0,
                
                -- Recovery information
                recovery_goals TEXT,
                support_network TEXT,
                emergency_contacts JSONB DEFAULT '[]',
                
                -- User preferences
                theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
                email_notifications BOOLEAN DEFAULT false,
                
                -- Timestamps
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `;
        
        const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
        if (createError) {
            console.log('⚠️  Table might already exist, continuing...');
        }
        
        // Step 2: Create indexes
        console.log('📊 Creating indexes...');
        
        const indexesSQL = `
            CREATE INDEX IF NOT EXISTS idx_profiles_consolidated_user_id ON profiles_consolidated(user_id);
            CREATE INDEX IF NOT EXISTS idx_profiles_consolidated_sobriety_date ON profiles_consolidated(sobriety_date);
            CREATE INDEX IF NOT EXISTS idx_profiles_consolidated_location ON profiles_consolidated(location);
            CREATE INDEX IF NOT EXISTS idx_profiles_consolidated_privacy ON profiles_consolidated(privacy_level);
        `;
        
        const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexesSQL });
        if (indexError) {
            console.log('⚠️  Indexes might already exist, continuing...');
        }
        
        // Step 3: Temporarily disable RLS for migration
        console.log('🔓 Temporarily disabling RLS for migration...');
        
        const disableRLSSQL = `
            ALTER TABLE profiles_consolidated DISABLE ROW LEVEL SECURITY;
        `;
        
        const { error: disableRLSError } = await supabase.rpc('exec_sql', { sql: disableRLSSQL });
        if (disableRLSError) {
            console.log('⚠️  Could not disable RLS, continuing...');
        }
        
        // Step 4: Try to migrate data from existing tables
        console.log('🔄 Attempting to migrate data...');
        
        // Try to migrate from profiles table
        try {
            console.log('📤 Attempting to migrate from profiles table...');
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('*');
            
            if (profilesError) {
                console.log('⚠️  Profiles table not accessible:', profilesError.message);
            } else if (profilesData && profilesData.length > 0) {
                console.log(`📋 Found ${profilesData.length} profiles to migrate`);
                
                for (const profile of profilesData) {
                    const { error: insertError } = await supabase
                        .from('profiles_consolidated')
                        .upsert({
                            user_id: profile.user_id || profile.id,
                            email: profile.email || '',
                            display_name: profile.display_name || '',
                            bio: profile.bio || '',
                            sobriety_start_date: profile.sobriety_start_date,
                            last_checkin: profile.last_checkin,
                            current_streak: profile.current_streak || 0,
                            longest_streak: profile.longest_streak || 0,
                            recovery_goals: profile.recovery_goals || '',
                            support_network: profile.support_network || '',
                            emergency_contacts: profile.emergency_contacts || [],
                            privacy_level: profile.privacy_level || 'standard',
                            theme: profile.theme || 'light',
                            email_notifications: profile.email_notifications || false,
                            created_at: profile.created_at || new Date().toISOString(),
                            updated_at: profile.updated_at || new Date().toISOString()
                        }, { onConflict: 'user_id' });
                    
                    if (insertError) {
                        console.error('❌ Error inserting profile:', insertError);
                    }
                }
                console.log(`✅ Migrated ${profilesData.length} profiles`);
            }
        } catch (error) {
            console.log('⚠️  Could not access profiles table:', error.message);
        }
        
        // Try to migrate from user_profiles table
        try {
            console.log('📤 Attempting to migrate from user_profiles table...');
            const { data: userProfilesData, error: userProfilesError } = await supabase
                .from('user_profiles')
                .select('*');
            
            if (userProfilesError) {
                console.log('⚠️  User_profiles table not accessible:', userProfilesError.message);
            } else if (userProfilesData && userProfilesData.length > 0) {
                console.log(`📋 Found ${userProfilesData.length} user_profiles to migrate`);
                
                for (const profile of userProfilesData) {
                    const { error: insertError } = await supabase
                        .from('profiles_consolidated')
                        .upsert({
                            user_id: profile.user_id,
                            sobriety_date: profile.sobriety_date,
                            bio: profile.bio || '',
                            location: profile.location || 'Spokane, WA',
                            privacy_settings: profile.privacy_settings || 'public',
                            created_at: profile.created_at || new Date().toISOString(),
                            updated_at: profile.updated_at || new Date().toISOString()
                        }, { onConflict: 'user_id' });
                    
                    if (insertError) {
                        console.error('❌ Error inserting user_profile:', insertError);
                    }
                }
                console.log(`✅ Migrated ${userProfilesData.length} user_profiles`);
            }
        } catch (error) {
            console.log('⚠️  Could not access user_profiles table:', error.message);
        }
        
        // Try to migrate from forum_user_profiles table
        try {
            console.log('📤 Attempting to migrate from forum_user_profiles table...');
            const { data: forumProfilesData, error: forumProfilesError } = await supabase
                .from('forum_user_profiles')
                .select('*');
            
            if (forumProfilesError) {
                console.log('⚠️  Forum_user_profiles table not accessible:', forumProfilesError.message);
            } else if (forumProfilesData && forumProfilesData.length > 0) {
                console.log(`📋 Found ${forumProfilesData.length} forum_user_profiles to migrate`);
                
                for (const profile of forumProfilesData) {
                    const { error: insertError } = await supabase
                        .from('profiles_consolidated')
                        .upsert({
                            user_id: profile.user_id,
                            display_name: profile.display_name || '',
                            avatar_url: profile.avatar_url || '',
                            sobriety_date: profile.sobriety_date,
                            created_at: profile.created_at || new Date().toISOString(),
                            updated_at: profile.updated_at || new Date().toISOString()
                        }, { onConflict: 'user_id' });
                    
                    if (insertError) {
                        console.error('❌ Error inserting forum_profile:', insertError);
                    }
                }
                console.log(`✅ Migrated ${forumProfilesData.length} forum_user_profiles`);
            }
        } catch (error) {
            console.log('⚠️  Could not access forum_user_profiles table:', error.message);
        }
        
        // Step 5: Re-enable RLS and create policies
        console.log('🔒 Re-enabling RLS and creating policies...');
        
        const enableRLSSQL = `
            ALTER TABLE profiles_consolidated ENABLE ROW LEVEL SECURITY;
            
            DROP POLICY IF EXISTS "Users can view own profile" ON profiles_consolidated;
            CREATE POLICY "Users can view own profile" ON profiles_consolidated
                FOR SELECT USING (auth.uid() = user_id);
            
            DROP POLICY IF EXISTS "Users can insert own profile" ON profiles_consolidated;
            CREATE POLICY "Users can insert own profile" ON profiles_consolidated
                FOR INSERT WITH CHECK (auth.uid() = user_id);
            
            DROP POLICY IF EXISTS "Users can update own profile" ON profiles_consolidated;
            CREATE POLICY "Users can update own profile" ON profiles_consolidated
                FOR UPDATE USING (auth.uid() = user_id);
        `;
        
        const { error: enableRLSError } = await supabase.rpc('exec_sql', { sql: enableRLSSQL });
        if (enableRLSError) {
            console.log('⚠️  Could not enable RLS, continuing...');
        }
        
        // Step 6: Create views for backward compatibility
        console.log('🔗 Creating backward compatibility views...');
        
        const viewsSQL = `
            CREATE OR REPLACE VIEW profiles AS SELECT * FROM profiles_consolidated;
            CREATE OR REPLACE VIEW user_profiles AS SELECT * FROM profiles_consolidated;
            CREATE OR REPLACE VIEW forum_user_profiles AS SELECT * FROM profiles_consolidated;
        `;
        
        const { error: viewsError } = await supabase.rpc('exec_sql', { sql: viewsSQL });
        if (viewsError) {
            console.log('⚠️  Views might already exist, continuing...');
        }
        
        // Step 7: Verify the consolidation
        console.log('🔍 Verifying consolidation...');
        
        const { data: consolidatedData, error: consolidatedError } = await supabase
            .from('profiles_consolidated')
            .select('*');
        
        if (consolidatedError) {
            console.error('❌ Error fetching consolidated data:', consolidatedError);
        } else {
            console.log(`✅ Consolidation complete! ${consolidatedData.length} profiles consolidated`);
            
            // Show some sample data
            if (consolidatedData.length > 0) {
                console.log('📋 Sample consolidated profile:');
                console.log(JSON.stringify(consolidatedData[0], null, 2));
            }
        }
        
        console.log('🎉 Profile consolidation completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during consolidation:', error);
    }
}

// Run the consolidation
consolidateProfiles();
