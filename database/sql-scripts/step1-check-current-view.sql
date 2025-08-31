-- Step 1: Check Current View Structure
-- Run this first to see what we're working with

-- Check what the current forum_user_profiles view looks like
SELECT 'Current forum_user_profiles view definition:' as info;
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname = 'forum_user_profiles';

-- Check the current columns in the view
SELECT 'Current forum_user_profiles view columns:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'forum_user_profiles'
ORDER BY ordinal_position;

-- Check the underlying profiles_consolidated table structure
SELECT 'profiles_consolidated table structure:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles_consolidated'
ORDER BY ordinal_position;
