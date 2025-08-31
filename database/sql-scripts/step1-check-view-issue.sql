-- Step 1: Check what's causing the view column error
-- Run this first to diagnose the issue

-- Check if profiles_unified table was created successfully
SELECT 'profiles_unified table exists:' as info;
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'profiles_unified' AND table_type = 'BASE TABLE'
);

-- Check the actual structure of profiles_unified
SELECT 'profiles_unified STRUCTURE:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles_unified'
ORDER BY ordinal_position;

-- Check if any views currently exist that might conflict
SELECT 'EXISTING VIEWS:' as info;
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_name IN ('profiles', 'user_profiles', 'forum_user_profiles')
AND table_type = 'VIEW';

-- Check if there are any existing view definitions
SELECT 'EXISTING VIEW DEFINITIONS:' as info;
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views
WHERE viewname IN ('profiles', 'user_profiles', 'forum_user_profiles');
