-- Consolidated Profile Schema for Sober Spokane (FIXED VERSION)
-- This script consolidates all conflicting profile tables into a single, consistent structure
-- Run this in your Supabase SQL Editor to fix the table conflicts

-- Step 1: Create a new consolidated profiles table
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

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_consolidated_user_id ON profiles_consolidated(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_consolidated_sobriety_date ON profiles_consolidated(sobriety_date);
CREATE INDEX IF NOT EXISTS idx_profiles_consolidated_location ON profiles_consolidated(location);
CREATE INDEX IF NOT EXISTS idx_profiles_consolidated_privacy ON profiles_consolidated(privacy_level);

-- Step 3: Check existing table structures first
DO $$
DECLARE
    profiles_cols text[];
    user_profiles_cols text[];
    forum_user_profiles_cols text[];
    col_name text;
    col_type text;
BEGIN
    -- Get column information for existing tables
    RAISE NOTICE 'Checking existing table structures...';
    
    -- Check profiles table structure
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE 'Profiles table exists. Columns:';
        FOR col_name, col_type IN 
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  %: %', col_name, col_type;
        END LOOP;
    ELSE
        RAISE NOTICE 'Profiles table does not exist';
    END IF;
    
    -- Check user_profiles table structure
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        RAISE NOTICE 'User_profiles table exists. Columns:';
        FOR col_name, col_type IN 
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'user_profiles' 
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  %: %', col_name, col_type;
        END LOOP;
    ELSE
        RAISE NOTICE 'User_profiles table does not exist';
    END IF;
    
    -- Check forum_user_profiles table structure
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_user_profiles') THEN
        RAISE NOTICE 'Forum_user_profiles table exists. Columns:';
        FOR col_name, col_type IN 
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'forum_user_profiles' 
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  %: %', col_name, col_type;
        END LOOP;
    ELSE
        RAISE NOTICE 'Forum_user_profiles table does not exist';
    END IF;
END $$;

-- Step 4: Migrate data from existing tables (if they exist) with proper column mapping
DO $$
BEGIN
    -- Migrate from 'profiles' table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE 'Migrating data from profiles table...';
        
        -- Use dynamic SQL to handle different column structures
        EXECUTE format('
            INSERT INTO profiles_consolidated (
                user_id, email, display_name, bio, sobriety_start_date, 
                last_checkin, current_streak, longest_streak, recovery_goals,
                support_network, emergency_contacts, privacy_level, theme, 
                email_notifications, created_at, updated_at
            )
            SELECT 
                COALESCE(
                    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = ''profiles'' AND column_name = ''user_id'') THEN user_id END,
                    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = ''profiles'' AND column_name = ''id'') THEN id END
                ) as user_id,
                COALESCE(email, '''') as email,
                COALESCE(display_name, '''') as display_name,
                COALESCE(bio, '''') as bio,
                COALESCE(sobriety_start_date, NULL) as sobriety_start_date,
                COALESCE(last_checkin, NULL) as last_checkin,
                COALESCE(current_streak, 0) as current_streak,
                COALESCE(longest_streak, 0) as longest_streak,
                COALESCE(recovery_goals, '''') as recovery_goals,
                COALESCE(support_network, '''') as support_network,
                COALESCE(emergency_contacts, ''[]''::jsonb) as emergency_contacts,
                COALESCE(privacy_level, ''standard'') as privacy_level,
                COALESCE(theme, ''light'') as theme,
                COALESCE(email_notifications, false) as email_notifications,
                COALESCE(created_at, NOW()) as created_at,
                COALESCE(updated_at, NOW()) as updated_at
            FROM profiles
            WHERE id IS NOT NULL OR user_id IS NOT NULL
            ON CONFLICT (user_id) DO NOTHING
        ');
        
        RAISE NOTICE 'Migrated data from profiles table';
    END IF;
    
    -- Migrate from 'user_profiles' table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        RAISE NOTICE 'Migrating data from user_profiles table...';
        
        INSERT INTO profiles_consolidated (
            user_id, sobriety_date, bio, location, privacy_settings, created_at, updated_at
        )
        SELECT 
            user_id, sobriety_date, bio, location, privacy_settings, created_at, updated_at
        FROM user_profiles
        ON CONFLICT (user_id) DO UPDATE SET
            sobriety_date = EXCLUDED.sobriety_date,
            bio = COALESCE(profiles_consolidated.bio, EXCLUDED.bio),
            location = COALESCE(profiles_consolidated.location, EXCLUDED.location),
            privacy_settings = EXCLUDED.privacy_settings,
            updated_at = NOW();
            
        RAISE NOTICE 'Migrated data from user_profiles table';
    END IF;
    
    -- Migrate from 'forum_user_profiles' table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_user_profiles') THEN
        RAISE NOTICE 'Migrating data from forum_user_profiles table...';
        
        INSERT INTO profiles_consolidated (
            user_id, display_name, avatar_url, sobriety_date, created_at, updated_at
        )
        SELECT 
            user_id, display_name, avatar_url, sobriety_date, created_at, updated_at
        FROM forum_user_profiles
        ON CONFLICT (user_id) DO UPDATE SET
            display_name = COALESCE(profiles_consolidated.display_name, EXCLUDED.display_name),
            avatar_url = COALESCE(profiles_consolidated.avatar_url, EXCLUDED.avatar_url),
            sobriety_date = COALESCE(profiles_consolidated.sobriety_date, EXCLUDED.sobriety_date),
            updated_at = NOW();
            
        RAISE NOTICE 'Migrated data from forum_user_profiles table';
    END IF;
END $$;

-- Step 5: Create views that maintain backward compatibility
CREATE OR REPLACE VIEW profiles AS
SELECT * FROM profiles_consolidated;

CREATE OR REPLACE VIEW user_profiles AS
SELECT * FROM profiles_consolidated;

CREATE OR REPLACE VIEW forum_user_profiles AS
SELECT * FROM profiles_consolidated;

-- Step 6: Enable Row Level Security
ALTER TABLE profiles_consolidated ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles_consolidated;
CREATE POLICY "Users can view own profile" ON profiles_consolidated
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles_consolidated;
CREATE POLICY "Users can insert own profile" ON profiles_consolidated
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles_consolidated;
CREATE POLICY "Users can update own profile" ON profiles_consolidated
    FOR UPDATE USING (auth.uid() = user_id);

-- Step 8: Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 9: Create trigger
DROP TRIGGER IF EXISTS update_profiles_consolidated_updated_at ON profiles_consolidated;
CREATE TRIGGER update_profiles_consolidated_updated_at
    BEFORE UPDATE ON profiles_consolidated
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 10: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles_consolidated TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON user_profiles TO anon, authenticated;
GRANT ALL ON forum_user_profiles TO anon, authenticated;

-- Step 11: Verify the consolidated structure
SELECT 'Consolidated profiles table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles_consolidated'
ORDER BY ordinal_position;

-- Step 12: Show data migration results
SELECT 'Data migration summary:' as info;
SELECT 
    'profiles_consolidated' as table_name,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN sobriety_date IS NOT NULL THEN 1 END) as users_with_sobriety_date,
    COUNT(CASE WHEN bio IS NOT NULL THEN 1 END) as users_with_bio,
    COUNT(CASE WHEN location IS NOT NULL THEN 1 END) as users_with_location
FROM profiles_consolidated;

-- Step 13: Show what was migrated from each source table
SELECT 'Migration source summary:' as info;
SELECT 
    'From profiles table' as source,
    COUNT(*) as rows_migrated
FROM profiles_consolidated p
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'profiles' 
    AND EXISTS (
        SELECT 1 FROM profiles old 
        WHERE (old.id = p.user_id OR old.user_id = p.user_id)
    )
)
UNION ALL
SELECT 
    'From user_profiles table' as source,
    COUNT(*) as rows_migrated
FROM profiles_consolidated p
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_profiles' 
    AND EXISTS (
        SELECT 1 FROM user_profiles old 
        WHERE old.user_id = p.user_id
    )
)
UNION ALL
SELECT 
    'From forum_user_profiles table' as source,
    COUNT(*) as rows_migrated
FROM profiles_consolidated p
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'forum_user_profiles' 
    AND EXISTS (
        SELECT 1 FROM forum_user_profiles old 
        WHERE old.user_id = p.user_id
    )
);
