-- Database Consolidation Plan for Sober Spokane
-- This script consolidates scattered tables into a clean, organized structure

-- =====================================================
-- STEP 1: ANALYZE CURRENT STRUCTURE
-- =====================================================

-- Check what profile-related tables exist and their data
SELECT 'PROFILE TABLES ANALYSIS:' as info;
SELECT 
    table_name,
    table_type,
    CASE 
        WHEN table_type = 'VIEW' THEN 'View (derived from base table)'
        WHEN table_type = 'BASE TABLE' THEN 'Base Table (stores data)'
        ELSE table_type
    END as description
FROM information_schema.tables 
WHERE table_name IN (
    'profiles',
    'user_profiles', 
    'forum_user_profiles',
    'profiles_consolidated',
    'forum_users'
)
ORDER BY table_type, table_name;

-- Check data counts in profile tables
SELECT 'PROFILE TABLES DATA COUNTS:' as info;
SELECT 
    'profiles' as table_name,
    COUNT(*) as row_count
FROM profiles
UNION ALL
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as row_count
FROM user_profiles
UNION ALL
SELECT 
    'profiles_consolidated' as table_name,
    COUNT(*) as row_count
FROM profiles_consolidated
UNION ALL
SELECT 
    'forum_users' as table_name,
    COUNT(*) as row_count
FROM forum_users;

-- =====================================================
-- STEP 2: CONSOLIDATE PROFILE TABLES
-- =====================================================

-- Create a unified profiles table that combines all profile data
CREATE TABLE IF NOT EXISTS profiles_unified (
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
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Recovery information
    recovery_goals TEXT,
    support_network TEXT,
    emergency_contacts JSONB DEFAULT '[]',
    
    -- User preferences
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    email_notifications BOOLEAN DEFAULT false,
    
    -- Forum-specific fields
    is_verified BOOLEAN DEFAULT FALSE,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_unified_user_id ON profiles_unified(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_unified_email ON profiles_unified(email);
CREATE INDEX IF NOT EXISTS idx_profiles_unified_sobriety_date ON profiles_unified(sobriety_date);
CREATE INDEX IF NOT EXISTS idx_profiles_unified_last_active ON profiles_unified(last_active);

-- =====================================================
-- STEP 3: MIGRATE DATA FROM EXISTING TABLES
-- =====================================================

-- Migrate data from profiles_consolidated (if it exists and has data)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles_consolidated') THEN
        INSERT INTO profiles_unified (
            user_id, email, display_name, first_name, last_name, phone, bio, avatar_url,
            location, privacy_level, privacy_settings, sobriety_date, sobriety_start_date,
            last_checkin, current_streak, longest_streak, recovery_goals, support_network,
            emergency_contacts, theme, email_notifications, last_active, created_at, updated_at
        )
        SELECT 
            user_id, email, display_name, first_name, last_name, phone, bio, avatar_url,
            location, privacy_level, privacy_settings, sobriety_date, sobriety_start_date,
            last_checkin, current_streak, longest_streak, recovery_goals, support_network,
            emergency_contacts, theme, email_notifications, last_active, created_at, updated_at
        FROM profiles_consolidated
        WHERE user_id IS NOT NULL
        ON CONFLICT (user_id) DO UPDATE SET
            email = COALESCE(profiles_unified.email, EXCLUDED.email),
            display_name = COALESCE(profiles_unified.display_name, EXCLUDED.display_name),
            first_name = COALESCE(profiles_unified.first_name, EXCLUDED.first_name),
            last_name = COALESCE(profiles_unified.last_name, EXCLUDED.last_name),
            phone = COALESCE(profiles_unified.phone, EXCLUDED.phone),
            bio = COALESCE(profiles_unified.bio, EXCLUDED.bio),
            avatar_url = COALESCE(profiles_unified.avatar_url, EXCLUDED.avatar_url),
            location = COALESCE(profiles_unified.location, EXCLUDED.location),
            privacy_level = COALESCE(profiles_unified.privacy_level, EXCLUDED.privacy_level),
            privacy_settings = COALESCE(profiles_unified.privacy_settings, EXCLUDED.privacy_settings),
            sobriety_date = COALESCE(profiles_unified.sobriety_date, EXCLUDED.sobriety_date),
            sobriety_start_date = COALESCE(profiles_unified.sobriety_start_date, EXCLUDED.sobriety_start_date),
            last_checkin = COALESCE(profiles_unified.last_checkin, EXCLUDED.last_checkin),
            current_streak = COALESCE(profiles_unified.current_streak, EXCLUDED.current_streak),
            longest_streak = COALESCE(profiles_unified.longest_streak, EXCLUDED.longest_streak),
            recovery_goals = COALESCE(profiles_unified.recovery_goals, EXCLUDED.recovery_goals),
            support_network = COALESCE(profiles_unified.support_network, EXCLUDED.support_network),
            emergency_contacts = COALESCE(profiles_unified.emergency_contacts, EXCLUDED.emergency_contacts),
            theme = COALESCE(profiles_unified.theme, EXCLUDED.theme),
            email_notifications = COALESCE(profiles_unified.email_notifications, EXCLUDED.email_notifications),
            last_active = COALESCE(profiles_unified.last_active, EXCLUDED.last_active),
            updated_at = NOW();
            
        RAISE NOTICE 'Migrated data from profiles_consolidated';
    END IF;
END $$;

-- Migrate data from user_profiles (if it exists and has data)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        INSERT INTO profiles_unified (
            user_id, sobriety_date, bio, location, privacy_settings, created_at, updated_at
        )
        SELECT 
            user_id, sobriety_date, bio, location, privacy_settings, created_at, updated_at
        FROM user_profiles
        WHERE user_id IS NOT NULL
        ON CONFLICT (user_id) DO UPDATE SET
            sobriety_date = COALESCE(profiles_unified.sobriety_date, EXCLUDED.sobriety_date),
            bio = COALESCE(profiles_unified.bio, EXCLUDED.bio),
            location = COALESCE(profiles_unified.location, EXCLUDED.location),
            privacy_settings = COALESCE(profiles_unified.privacy_settings, EXCLUDED.privacy_settings),
            updated_at = NOW();
            
        RAISE NOTICE 'Migrated data from user_profiles';
    END IF;
END $$;

-- Migrate data from forum_users (if it exists and has data)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_users') THEN
        INSERT INTO profiles_unified (
            user_id, display_name, avatar_url, sobriety_date, created_at, updated_at
        )
        SELECT 
            user_id, display_name, avatar_url, sobriety_date, created_at, updated_at
        FROM forum_users
        WHERE user_id IS NOT NULL
        ON CONFLICT (user_id) DO UPDATE SET
            display_name = COALESCE(profiles_unified.display_name, EXCLUDED.display_name),
            avatar_url = COALESCE(profiles_unified.avatar_url, EXCLUDED.avatar_url),
            sobriety_date = COALESCE(profiles_unified.sobriety_date, EXCLUDED.sobriety_date),
            updated_at = NOW();
            
        RAISE NOTICE 'Migrated data from forum_users';
    END IF;
END $$;

-- =====================================================
-- STEP 4: CREATE UNIFIED VIEWS
-- =====================================================

-- Create unified profiles view
CREATE OR REPLACE VIEW profiles AS
SELECT * FROM profiles_unified;

-- Create unified user_profiles view
CREATE OR REPLACE VIEW user_profiles AS
SELECT * FROM profiles_unified;

-- Create unified forum_user_profiles view
CREATE OR REPLACE VIEW forum_user_profiles AS
SELECT 
    id,
    user_id,
    display_name,
    bio,
    avatar_url,
    location,
    sobriety_date,
    privacy_level,
    created_at,
    updated_at,
    last_active,
    is_verified,
    join_date
FROM profiles_unified;

-- =====================================================
-- STEP 5: UPDATE FUNCTIONS AND TRIGGERS
-- =====================================================

-- Update the last_active function to work with profiles_unified
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles_unified 
    SET last_active = NOW() 
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles_unified (user_id, display_name, avatar_url, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.email
    )
    ON CONFLICT (user_id) DO UPDATE SET
        display_name = COALESCE(profiles_unified.display_name, EXCLUDED.display_name),
        avatar_url = COALESCE(profiles_unified.avatar_url, EXCLUDED.avatar_url),
        email = COALESCE(profiles_unified.email, EXCLUDED.email),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 6: VERIFICATION
-- =====================================================

-- Show the consolidated structure
SELECT 'CONSOLIDATED PROFILES STRUCTURE:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles_unified'
ORDER BY ordinal_position;

-- Show data migration results
SELECT 'MIGRATION RESULTS:' as info;
SELECT 
    'profiles_unified' as table_name,
    COUNT(*) as total_rows
FROM profiles_unified
UNION ALL
SELECT 
    'profiles view' as table_name,
    COUNT(*) as total_rows
FROM profiles
UNION ALL
SELECT 
    'user_profiles view' as table_name,
    COUNT(*) as total_rows
FROM user_profiles
UNION ALL
SELECT 
    'forum_user_profiles view' as table_name,
    COUNT(*) as total_rows
FROM forum_user_profiles;

-- Show sample data
SELECT 'SAMPLE CONSOLIDATED DATA:' as info;
SELECT 
    user_id,
    display_name,
    email,
    sobriety_date,
    last_active
FROM profiles_unified 
LIMIT 5;
