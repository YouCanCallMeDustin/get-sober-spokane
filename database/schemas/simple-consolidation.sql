-- Simple Profile Table Consolidation
-- This script will work regardless of your existing table structures
-- Run this in your Supabase SQL Editor

-- Step 1: First, let's see what we're working with
DO $$
BEGIN
    RAISE NOTICE '=== DIAGNOSTIC INFORMATION ===';
    
    -- Check what tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE '✅ profiles table exists';
    ELSE
        RAISE NOTICE '❌ profiles table does not exist';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        RAISE NOTICE '✅ user_profiles table exists';
    ELSE
        RAISE NOTICE '❌ user_profiles table does not exist';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_user_profiles') THEN
        RAISE NOTICE '✅ forum_user_profiles table exists';
    ELSE
        RAISE NOTICE '❌ forum_user_profiles table does not exist';
    END IF;
    
    RAISE NOTICE '=== END DIAGNOSTIC ===';
END $$;

-- Step 2: Create the consolidated table
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

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_consolidated_user_id ON profiles_consolidated(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_consolidated_sobriety_date ON profiles_consolidated(sobriety_date);

-- Step 4: Migrate data from profiles table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE 'Starting migration from profiles table...';
        
        -- Get the actual column names from the profiles table
        DECLARE
            col_names text[];
            col_name text;
            has_user_id boolean := false;
            has_id boolean := false;
            has_email boolean := false;
            has_display_name boolean := false;
            has_bio boolean := false;
        BEGIN
            -- Check what columns actually exist
            SELECT array_agg(column_name) INTO col_names 
            FROM information_schema.columns 
            WHERE table_name = 'profiles';
            
            has_user_id := 'user_id' = ANY(col_names);
            has_id := 'id' = ANY(col_names);
            has_email := 'email' = ANY(col_names);
            has_display_name := 'display_name' = ANY(col_names);
            has_bio := 'bio' = ANY(col_names);
            
            RAISE NOTICE 'Profiles table columns: %', col_names;
            RAISE NOTICE 'Has user_id: %, Has id: %, Has email: %, Has display_name: %, Has bio: %', 
                has_user_id, has_id, has_email, has_display_name, has_bio;
            
            -- Insert data based on what columns exist
            IF has_user_id THEN
                -- If user_id column exists, use it
                INSERT INTO profiles_consolidated (user_id, email, display_name, bio)
                SELECT 
                    user_id,
                    CASE WHEN has_email THEN email ELSE NULL END,
                    CASE WHEN has_display_name THEN display_name ELSE NULL END,
                    CASE WHEN has_bio THEN bio ELSE NULL END
                FROM profiles
                WHERE user_id IS NOT NULL
                ON CONFLICT (user_id) DO NOTHING;
                
                RAISE NOTICE 'Migrated data using user_id column';
            ELSIF has_id THEN
                -- If only id column exists, use it as user_id
                INSERT INTO profiles_consolidated (user_id, email, display_name, bio)
                SELECT 
                    id,
                    CASE WHEN has_email THEN email ELSE NULL END,
                    CASE WHEN has_display_name THEN display_name ELSE NULL END,
                    CASE WHEN has_bio THEN bio ELSE NULL END
                FROM profiles
                WHERE id IS NOT NULL
                ON CONFLICT (user_id) DO NOTHING;
                
                RAISE NOTICE 'Migrated data using id column as user_id';
            ELSE
                RAISE NOTICE 'No suitable user identifier column found in profiles table';
            END IF;
        END;
    ELSE
        RAISE NOTICE 'Profiles table does not exist, skipping migration';
    END IF;
END $$;

-- Step 5: Migrate data from user_profiles table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        RAISE NOTICE 'Starting migration from user_profiles table...';
        
        INSERT INTO profiles_consolidated (user_id, sobriety_date, bio, location, privacy_settings)
        SELECT user_id, sobriety_date, bio, location, privacy_settings
        FROM user_profiles
        WHERE user_id IS NOT NULL
        ON CONFLICT (user_id) DO UPDATE SET
            sobriety_date = EXCLUDED.sobriety_date,
            bio = COALESCE(profiles_consolidated.bio, EXCLUDED.bio),
            location = COALESCE(profiles_consolidated.location, EXCLUDED.location),
            privacy_settings = EXCLUDED.privacy_settings;
            
        RAISE NOTICE 'Migrated data from user_profiles table';
    ELSE
        RAISE NOTICE 'User_profiles table does not exist, skipping migration';
    END IF;
END $$;

-- Step 6: Migrate data from forum_user_profiles table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_user_profiles') THEN
        RAISE NOTICE 'Starting migration from forum_user_profiles table...';
        
        INSERT INTO profiles_consolidated (user_id, display_name, avatar_url, sobriety_date)
        SELECT user_id, display_name, avatar_url, sobriety_date
        FROM forum_user_profiles
        WHERE user_id IS NOT NULL
        ON CONFLICT (user_id) DO UPDATE SET
            display_name = COALESCE(profiles_consolidated.display_name, EXCLUDED.display_name),
            avatar_url = COALESCE(profiles_consolidated.avatar_url, EXCLUDED.avatar_url),
            sobriety_date = COALESCE(profiles_consolidated.sobriety_date, EXCLUDED.sobriety_date);
            
        RAISE NOTICE 'Migrated data from forum_user_profiles table';
    ELSE
        RAISE NOTICE 'Forum_user_profiles table does not exist, skipping migration';
    END IF;
END $$;

-- Step 7: Create backward-compatible views
CREATE OR REPLACE VIEW profiles AS
SELECT * FROM profiles_consolidated;

CREATE OR REPLACE VIEW user_profiles AS
SELECT * FROM profiles_consolidated;

CREATE OR REPLACE VIEW forum_user_profiles AS
SELECT * FROM profiles_consolidated;

-- Step 8: Enable RLS and create policies
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

-- Step 9: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles_consolidated TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON user_profiles TO anon, authenticated;
GRANT ALL ON forum_user_profiles TO anon, authenticated;

-- Step 10: Show results
SELECT '=== CONSOLIDATION RESULTS ===' as info;

SELECT 'Consolidated table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles_consolidated'
ORDER BY ordinal_position;

SELECT 'Data migration summary:' as info;
SELECT 
    COUNT(*) as total_rows,
    COUNT(CASE WHEN sobriety_date IS NOT NULL THEN 1 END) as users_with_sobriety_date,
    COUNT(CASE WHEN bio IS NOT NULL THEN 1 END) as users_with_bio,
    COUNT(CASE WHEN location IS NOT NULL THEN 1 END) as users_with_location
FROM profiles_consolidated;

SELECT '=== CONSOLIDATION COMPLETE ===' as info;
RAISE NOTICE 'Profile table consolidation completed successfully!';
RAISE NOTICE 'Your existing code should now work with the consolidated table.';
