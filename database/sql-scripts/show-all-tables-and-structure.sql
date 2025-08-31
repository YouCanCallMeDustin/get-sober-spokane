-- Comprehensive Database Structure Analysis
-- Run this to see all tables, views, and their structures for consolidation

-- 1. Show all tables and views in the database
SELECT 'ALL TABLES AND VIEWS:' as info;
SELECT 
    table_schema,
    table_name,
    table_type,
    CASE 
        WHEN table_type = 'VIEW' THEN 'View'
        WHEN table_type = 'BASE TABLE' THEN 'Table'
        ELSE table_type
    END as type_description
FROM information_schema.tables 
WHERE table_schema IN ('public', 'auth')
ORDER BY table_schema, table_type, table_name;

-- 2. Show detailed structure of all profile-related tables
SELECT 'PROFILE-RELATED TABLES STRUCTURE:' as info;
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_name IN (
    'profiles',
    'user_profiles', 
    'forum_user_profiles',
    'profiles_consolidated',
    'forum_users'
)
ORDER BY table_name, ordinal_position;

-- 3. Show forum-related tables structure
SELECT 'FORUM-RELATED TABLES STRUCTURE:' as info;
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_name LIKE '%forum%'
ORDER BY table_name, ordinal_position;

-- 4. Show foreign key relationships
SELECT 'FOREIGN KEY RELATIONSHIPS:' as info;
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 5. Show data counts for each table
SELECT 'DATA COUNTS BY TABLE:' as info;
SELECT 
    schemaname,
    tablename,
    n_tup_ins as rows_inserted,
    n_tup_upd as rows_updated,
    n_tup_del as rows_deleted,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables
ORDER BY schemaname, tablename;

-- 6. Show indexes for profile and forum tables
SELECT 'INDEXES FOR PROFILE AND FORUM TABLES:' as info;
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN (
    'profiles',
    'user_profiles', 
    'forum_user_profiles',
    'profiles_consolidated',
    'forum_users',
    'forum_posts',
    'forum_comments'
)
ORDER BY tablename, indexname;

-- 7. Show triggers
SELECT 'TRIGGERS:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 8. Show functions
SELECT 'FUNCTIONS:' as info;
SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 9. Show view definitions
SELECT 'VIEW DEFINITIONS:' as info;
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- 10. Show table sizes
SELECT 'TABLE SIZES:' as info;
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
