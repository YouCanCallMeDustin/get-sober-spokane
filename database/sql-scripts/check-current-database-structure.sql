-- Check Current Database Structure
-- Run this in your Supabase SQL Editor to diagnose the last_active column issue

-- Check if forum_user_profiles table exists and its structure
SELECT 'Checking forum_user_profiles table structure:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_name = 'forum_user_profiles'
ORDER BY ordinal_position;

-- Check if the table exists at all
SELECT 'Table existence check:' as info;
SELECT 
    table_name, 
    table_type
FROM information_schema.tables 
WHERE table_name = 'forum_user_profiles';

-- Check if there are any views with this name
SELECT 'View existence check:' as info;
SELECT 
    table_name, 
    table_type
FROM information_schema.tables 
WHERE table_name LIKE '%forum_user_profiles%';

-- Check if profiles_consolidated table exists (from consolidation scripts)
SELECT 'Checking profiles_consolidated table structure:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_name = 'profiles_consolidated'
ORDER BY ordinal_position;

-- Check all profile-related tables
SELECT 'All profile-related tables:' as info;
SELECT 
    table_name, 
    table_type
FROM information_schema.tables 
WHERE table_name LIKE '%profile%' OR table_name LIKE '%forum%'
ORDER BY table_name;
