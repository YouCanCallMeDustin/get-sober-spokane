-- Step 4: Drop and recreate forum_user_profiles view
-- Run this after Step 3

-- First, let's see what depends on this view
SELECT 'Dependencies on forum_user_profiles view:' as info;
SELECT 
    dependent_ns.nspname as dependent_schema,
    dependent_view.relname as dependent_view
FROM pg_depend 
JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid 
JOIN pg_class as dependent_view ON pg_rewrite.ev_class = dependent_view.oid 
JOIN pg_class as source_view ON pg_depend.refobjid = source_view.oid 
JOIN pg_namespace dependent_ns ON dependent_view.relnamespace = dependent_ns.oid 
JOIN pg_namespace source_ns ON source_view.relnamespace = source_ns.oid 
WHERE source_view.relname = 'forum_user_profiles' 
AND source_ns.nspname = 'public';

-- Drop the view completely
DROP VIEW IF EXISTS forum_user_profiles CASCADE;

-- Recreate the view with the last_active column
CREATE VIEW forum_user_profiles AS
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
    -- Add default values for missing columns to maintain compatibility
    FALSE as is_verified,
    created_at as join_date
FROM profiles_consolidated;

-- Verify the view was created correctly
SELECT 'Verification - forum_user_profiles view structure:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'forum_user_profiles'
ORDER BY ordinal_position;

-- Test that the view works and has the last_active column
SELECT 'Test - forum_user_profiles view with last_active:' as info;
SELECT 
    user_id,
    display_name,
    last_active
FROM forum_user_profiles 
LIMIT 3;
