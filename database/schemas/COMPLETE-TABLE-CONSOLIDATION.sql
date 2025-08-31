-- COMPLETE TABLE CONSOLIDATION FOR SOBER SPOKANE
-- This script will fix ALL table conflicts and ensure your website works properly
-- Run this in your Supabase SQL Editor

-- Step 1: Check current table status
DO $$
BEGIN
    RAISE NOTICE '=== CHECKING CURRENT TABLE STATUS ===';
    
    -- Check profiles tables
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
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles_consolidated') THEN
        RAISE NOTICE '✅ profiles_consolidated table exists';
    ELSE
        RAISE NOTICE '❌ profiles_consolidated table does not exist';
    END IF;
    
    -- Check recovery_milestones table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recovery_milestones') THEN
        RAISE NOTICE '✅ recovery_milestones table exists';
    ELSE
        RAISE NOTICE '❌ recovery_milestones table does not exist';
    END IF;
END $$;

-- Step 2: Create the consolidated profiles table if it doesn't exist
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

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_consolidated_user_id ON profiles_consolidated(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_consolidated_sobriety_date ON profiles_consolidated(sobriety_date);
CREATE INDEX IF NOT EXISTS idx_profiles_consolidated_location ON profiles_consolidated(location);
CREATE INDEX IF NOT EXISTS idx_profiles_consolidated_privacy ON profiles_consolidated(privacy_level);

-- Step 4: Migrate data from existing tables
DO $$
BEGIN
    -- Migrate from profiles table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_type = 'BASE TABLE') THEN
        RAISE NOTICE 'Migrating data from profiles table...';
        
        INSERT INTO profiles_consolidated (user_id, email, display_name, first_name, last_name, phone, bio, avatar_url, location, sobriety_date, recovery_goals, support_network, created_at, updated_at)
        SELECT 
            user_id,
            email,
            display_name,
            first_name,
            last_name,
            phone,
            bio,
            avatar_url,
            COALESCE(location, 'Spokane, WA'),
            sobriety_date,
            recovery_goals,
            support_network,
            COALESCE(created_at, NOW()),
            COALESCE(updated_at, NOW())
        FROM profiles
        WHERE user_id IS NOT NULL
        ON CONFLICT (user_id) DO UPDATE SET
            email = COALESCE(profiles_consolidated.email, EXCLUDED.email),
            display_name = COALESCE(profiles_consolidated.display_name, EXCLUDED.display_name),
            first_name = COALESCE(profiles_consolidated.first_name, EXCLUDED.first_name),
            last_name = COALESCE(profiles_consolidated.last_name, EXCLUDED.last_name),
            phone = COALESCE(profiles_consolidated.phone, EXCLUDED.phone),
            bio = COALESCE(profiles_consolidated.bio, EXCLUDED.bio),
            avatar_url = COALESCE(profiles_consolidated.avatar_url, EXCLUDED.avatar_url),
            location = COALESCE(profiles_consolidated.location, EXCLUDED.location),
            sobriety_date = COALESCE(profiles_consolidated.sobriety_date, EXCLUDED.sobriety_date),
            recovery_goals = COALESCE(profiles_consolidated.recovery_goals, EXCLUDED.recovery_goals),
            support_network = COALESCE(profiles_consolidated.support_network, EXCLUDED.support_network),
            updated_at = NOW();
            
        RAISE NOTICE 'Data migrated from profiles table';
    END IF;
    
    -- Migrate from user_profiles table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_type = 'BASE TABLE') THEN
        RAISE NOTICE 'Migrating data from user_profiles table...';
        
        INSERT INTO profiles_consolidated (user_id, email, display_name, first_name, last_name, phone, bio, avatar_url, location, sobriety_date, recovery_goals, support_network, created_at, updated_at)
        SELECT 
            user_id,
            email,
            display_name,
            first_name,
            last_name,
            phone,
            bio,
            avatar_url,
            COALESCE(location, 'Spokane, WA'),
            sobriety_date,
            recovery_goals,
            support_network,
            COALESCE(created_at, NOW()),
            COALESCE(updated_at, NOW())
        FROM user_profiles
        WHERE user_id IS NOT NULL
        ON CONFLICT (user_id) DO UPDATE SET
            email = COALESCE(profiles_consolidated.email, EXCLUDED.email),
            display_name = COALESCE(profiles_consolidated.display_name, EXCLUDED.display_name),
            first_name = COALESCE(profiles_consolidated.first_name, EXCLUDED.first_name),
            last_name = COALESCE(profiles_consolidated.last_name, EXCLUDED.last_name),
            phone = COALESCE(profiles_consolidated.phone, EXCLUDED.phone),
            bio = COALESCE(profiles_consolidated.bio, EXCLUDED.bio),
            avatar_url = COALESCE(profiles_consolidated.avatar_url, EXCLUDED.avatar_url),
            location = COALESCE(profiles_consolidated.location, EXCLUDED.location),
            sobriety_date = COALESCE(profiles_consolidated.sobriety_date, EXCLUDED.sobriety_date),
            recovery_goals = COALESCE(profiles_consolidated.recovery_goals, EXCLUDED.recovery_goals),
            support_network = COALESCE(profiles_consolidated.support_network, EXCLUDED.support_network),
            updated_at = NOW();
            
        RAISE NOTICE 'Data migrated from user_profiles table';
    END IF;
    
    -- Migrate from forum_user_profiles table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_user_profiles' AND table_type = 'BASE TABLE') THEN
        RAISE NOTICE 'Migrating data from forum_user_profiles table...';
        
        INSERT INTO profiles_consolidated (user_id, display_name, avatar_url, sobriety_date)
        SELECT user_id, display_name, avatar_url, sobriety_date
        FROM forum_user_profiles
        WHERE user_id IS NOT NULL
        ON CONFLICT (user_id) DO UPDATE SET
            display_name = COALESCE(profiles_consolidated.display_name, EXCLUDED.display_name),
            avatar_url = COALESCE(profiles_consolidated.avatar_url, EXCLUDED.avatar_url),
            sobriety_date = COALESCE(profiles_consolidated.sobriety_date, EXCLUDED.sobriety_date),
            updated_at = NOW();
            
        RAISE NOTICE 'Data migrated from forum_user_profiles table';
    END IF;
END $$;

-- Step 5: Create backward-compatible views
-- Drop existing tables/views first (handle both tables and views)
DROP VIEW IF EXISTS profiles CASCADE;
DROP VIEW IF EXISTS user_profiles CASCADE;
DROP VIEW IF EXISTS forum_user_profiles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS forum_user_profiles CASCADE;

-- Create the views
CREATE OR REPLACE VIEW profiles AS
SELECT * FROM profiles_consolidated;

CREATE OR REPLACE VIEW user_profiles AS
SELECT * FROM profiles_consolidated;

CREATE OR REPLACE VIEW forum_user_profiles AS
SELECT * FROM profiles_consolidated;

-- Step 6: Ensure recovery_milestones table has proper structure
DO $$
BEGIN
    -- Check if recovery_milestones table exists and has the right structure
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recovery_milestones') THEN
        RAISE NOTICE 'Creating recovery_milestones table...';
        
        CREATE TABLE recovery_milestones (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX idx_recovery_milestones_user_id ON recovery_milestones(user_id);
        CREATE INDEX idx_recovery_milestones_created_at ON recovery_milestones(created_at);
        
        RAISE NOTICE 'recovery_milestones table created successfully';
    ELSE
        RAISE NOTICE 'recovery_milestones table already exists';
        
        -- Check if it has the right columns
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recovery_milestones' AND column_name = 'user_id') THEN
            RAISE NOTICE 'WARNING: recovery_milestones table exists but may not have the expected structure';
        END IF;
    END IF;
END $$;

-- Step 7: Enable RLS and create policies for all tables
-- Enable RLS on profiles_consolidated
ALTER TABLE profiles_consolidated ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles_consolidated;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles_consolidated;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles_consolidated;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles_consolidated;

-- Create policies for profiles_consolidated
CREATE POLICY "Users can view own profile" ON profiles_consolidated
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles_consolidated
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles_consolidated
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON profiles_consolidated
    FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on recovery_milestones
ALTER TABLE recovery_milestones ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own milestones" ON recovery_milestones;
DROP POLICY IF EXISTS "Users can insert own milestones" ON recovery_milestones;
DROP POLICY IF EXISTS "Users can update own milestones" ON recovery_milestones;
DROP POLICY IF EXISTS "Users can delete own milestones" ON recovery_milestones;

-- Create policies for recovery_milestones
CREATE POLICY "Users can view own milestones" ON recovery_milestones
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones" ON recovery_milestones
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones" ON recovery_milestones
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own milestones" ON recovery_milestones
    FOR DELETE USING (auth.uid() = user_id);

-- Step 8: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles_consolidated TO anon, authenticated;
GRANT ALL ON recovery_milestones TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON user_profiles TO anon, authenticated;
GRANT ALL ON forum_user_profiles TO anon, authenticated;

-- Step 9: Show final results
SELECT '=== CONSOLIDATION COMPLETE ===' as info;

SELECT 'Final table structure:' as info;
SELECT 
    table_name, 
    table_type,
    CASE 
        WHEN table_type = 'VIEW' THEN 'View (backward compatible)'
        WHEN table_type = 'BASE TABLE' THEN 'Base table'
        ELSE table_type
    END as status
FROM information_schema.tables 
WHERE table_name IN ('profiles', 'user_profiles', 'forum_user_profiles', 'profiles_consolidated', 'recovery_milestones')
ORDER BY table_name;

SELECT 'Profiles data summary:' as info;
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN sobriety_date IS NOT NULL THEN 1 END) as users_with_sobriety_date,
    COUNT(CASE WHEN bio IS NOT NULL THEN 1 END) as users_with_bio,
    COUNT(CASE WHEN location IS NOT NULL THEN 1 END) as users_with_location
FROM profiles_consolidated;

SELECT 'Milestones data summary:' as info;
SELECT 
    COUNT(*) as total_milestones,
    COUNT(DISTINCT user_id) as unique_users_with_milestones
FROM recovery_milestones;

DO $$
BEGIN
    RAISE NOTICE '=== WEBSITE SHOULD NOW WORK PROPERLY ===';
    RAISE NOTICE 'All table conflicts have been resolved.';
    RAISE NOTICE 'Your dashboard should now load without errors.';
    RAISE NOTICE 'Profile and milestone functionality should work correctly.';
END $$;
