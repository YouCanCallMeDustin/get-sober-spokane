-- Check Existing Table Structures
-- Run this first to see what tables exist and their column structures
-- This will help diagnose the consolidation issues

-- Check if tables exist and their types
SELECT 'Table existence check:' as info;
SELECT 
    table_name, 
    table_type,
    CASE 
        WHEN table_type = 'VIEW' THEN 'View'
        WHEN table_type = 'BASE TABLE' THEN 'Base table'
        ELSE table_type
    END as status
FROM information_schema.tables 
WHERE table_name IN ('profiles', 'user_profiles', 'forum_user_profiles')
ORDER BY table_name;

-- Check profiles table structure (if it exists)
SELECT 'Profiles table structure:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check user_profiles table structure (if it exists)
SELECT 'User_profiles table structure:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check forum_user_profiles table structure (if it exists)
SELECT 'Forum_user_profiles table structure:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_name = 'forum_user_profiles'
ORDER BY ordinal_position;

-- Check for any foreign key constraints
SELECT 'Foreign key constraints:' as info;
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('profiles', 'user_profiles', 'forum_user_profiles');

-- Check for any data in these tables
SELECT 'Data count in existing tables:' as info;
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
    'forum_user_profiles' as table_name,
    COUNT(*) as row_count
FROM forum_user_profiles;

-- Check auth.users table structure (for reference)
SELECT 'Auth.users table structure (for reference):' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'auth' AND table_name = 'users'
ORDER BY ordinal_position;
