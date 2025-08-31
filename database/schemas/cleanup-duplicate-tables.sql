-- Cleanup Duplicate Profile Tables
-- WARNING: Only run this AFTER running consolidated-profile-schema.sql and verifying data migration
-- This script removes the duplicate tables that were causing conflicts

-- Step 1: Verify the consolidated table has data
DO $$
BEGIN
    DECLARE
        row_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO row_count FROM profiles_consolidated;
        
        IF row_count = 0 THEN
            RAISE EXCEPTION 'profiles_consolidated table is empty. Do not proceed with cleanup until data migration is verified.';
        END IF;
        
        RAISE NOTICE 'profiles_consolidated table has % rows. Proceeding with cleanup...', row_count;
    END;
END $$;

-- Step 2: Drop the old duplicate tables (only if they exist and are not views)
-- Note: Views were already replaced in the consolidation script

-- Drop the original 'profiles' table if it exists and is not a view
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'profiles' 
        AND table_type = 'BASE TABLE'
    ) THEN
        DROP TABLE profiles CASCADE;
        RAISE NOTICE 'Dropped original profiles table';
    ELSE
        RAISE NOTICE 'profiles table is already a view or does not exist';
    END IF;
END $$;

-- Drop the 'user_profiles' table if it exists and is not a view
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_profiles' 
        AND table_type = 'BASE TABLE'
    ) THEN
        DROP TABLE user_profiles CASCADE;
        RAISE NOTICE 'Dropped original user_profiles table';
    ELSE
        RAISE NOTICE 'user_profiles table is already a view or does not exist';
    END IF;
END $$;

-- Drop the 'forum_user_profiles' table if it exists and is not a view
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'forum_user_profiles' 
        AND table_type = 'BASE TABLE'
    ) THEN
        DROP TABLE forum_user_profiles CASCADE;
        RAISE NOTICE 'Dropped original forum_user_profiles table';
    ELSE
        RAISE NOTICE 'forum_user_profiles table is already a view or does not exist';
    END IF;
END $$;

-- Step 3: Verify the cleanup
SELECT 'Tables after cleanup:' as info;
SELECT 
    table_name, 
    table_type,
    CASE 
        WHEN table_type = 'VIEW' THEN 'View (backward compatible)'
        WHEN table_type = 'BASE TABLE' THEN 'Base table'
        ELSE table_type
    END as status
FROM information_schema.tables 
WHERE table_name IN ('profiles', 'user_profiles', 'forum_user_profiles', 'profiles_consolidated')
ORDER BY table_name;

-- Step 4: Test the views to ensure they work
SELECT 'Testing view compatibility:' as info;
SELECT 
    'profiles view' as view_name,
    COUNT(*) as row_count
FROM profiles
UNION ALL
SELECT 
    'user_profiles view' as view_name,
    COUNT(*) as row_count
FROM user_profiles
UNION ALL
SELECT 
    'forum_user_profiles view' as view_name,
    COUNT(*) as row_count
FROM forum_user_profiles;

-- Step 5: Show final table structure
SELECT 'Final consolidated table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles_consolidated'
ORDER BY ordinal_position;

RAISE NOTICE 'Cleanup completed successfully! All duplicate tables have been removed and replaced with views.';
RAISE NOTICE 'Your application should now work consistently with a single source of truth for user profiles.';
