-- Comprehensive Database Analysis Script
-- This script will examine ALL tables, views, columns, constraints, and policies in your database
-- Run this in your Supabase SQL Editor to get a complete picture

-- =====================================================
-- 1. ALL TABLES AND VIEWS IN DATABASE
-- =====================================================
SELECT '=== ALL TABLES AND VIEWS ===' as section;
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

-- =====================================================
-- 2. DETAILED COLUMN STRUCTURE FOR ALL TABLES
-- =====================================================
SELECT '=== ALL TABLE COLUMNS ===' as section;
SELECT 
    table_schema,
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- =====================================================
-- 3. ALL FOREIGN KEY RELATIONSHIPS
-- =====================================================
SELECT '=== FOREIGN KEY RELATIONSHIPS ===' as section;
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

-- =====================================================
-- 4. ALL PRIMARY KEYS
-- =====================================================
SELECT '=== PRIMARY KEYS ===' as section;
SELECT 
    tc.table_name, 
    kcu.column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- =====================================================
-- 5. ALL UNIQUE CONSTRAINTS
-- =====================================================
SELECT '=== UNIQUE CONSTRAINTS ===' as section;
SELECT 
    tc.table_name, 
    kcu.column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- 6. ALL INDEXES
-- =====================================================
SELECT '=== ALL INDEXES ===' as section;
SELECT 
    pg_indexes.schemaname,
    pg_indexes.tablename,
    pg_indexes.indexname,
    pg_indexes.indexdef
FROM pg_indexes
WHERE pg_indexes.schemaname = 'public'
ORDER BY pg_indexes.tablename, pg_indexes.indexname;

-- =====================================================
-- 7. ALL ROW LEVEL SECURITY POLICIES
-- =====================================================
SELECT '=== ROW LEVEL SECURITY POLICIES ===' as section;
SELECT 
    pg_policies.schemaname,
    pg_policies.tablename,
    pg_policies.policyname,
    pg_policies.permissive,
    pg_policies.roles,
    pg_policies.cmd,
    pg_policies.qual,
    pg_policies.with_check
FROM pg_policies
WHERE pg_policies.schemaname = 'public'
ORDER BY pg_policies.tablename, pg_policies.policyname;

-- =====================================================
-- 8. ALL TRIGGERS
-- =====================================================
SELECT '=== ALL TRIGGERS ===' as section;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- 9. ALL FUNCTIONS
-- =====================================================
SELECT '=== ALL FUNCTIONS ===' as section;
SELECT 
    routine_name,
    routine_type,
    data_type,
    LEFT(routine_definition, 200) as routine_definition_preview
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- =====================================================
-- 10. ALL VIEWS WITH DEFINITIONS
-- =====================================================
SELECT '=== ALL VIEWS ===' as section;
SELECT 
    pg_views.schemaname,
    pg_views.viewname,
    LEFT(pg_views.definition, 500) as definition_preview
FROM pg_views 
WHERE pg_views.schemaname = 'public'
ORDER BY pg_views.viewname;

-- =====================================================
-- 11. TABLE SIZES AND ROW COUNTS
-- =====================================================
SELECT '=== TABLE SIZES AND ROW COUNTS ===' as section;
SELECT 
    pt.schemaname,
    pt.tablename,
    pg_size_pretty(pg_total_relation_size(pt.schemaname||'.'||pt.tablename)) as total_size,
    pg_size_pretty(pg_relation_size(pt.schemaname||'.'||pt.tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(pt.schemaname||'.'||pt.tablename) - pg_relation_size(pt.schemaname||'.'||pt.tablename)) as index_size,
    pst.n_live_tup as row_count
FROM pg_tables pt
LEFT JOIN pg_stat_user_tables pst ON pt.tablename = pst.relname
WHERE pt.schemaname = 'public'
ORDER BY pg_total_relation_size(pt.schemaname||'.'||pt.tablename) DESC;

-- =====================================================
-- 12. CHECK CONSTRAINTS
-- =====================================================
SELECT '=== CHECK CONSTRAINTS ===' as section;
SELECT 
    tc.table_name, 
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints AS tc 
JOIN information_schema.check_constraints AS cc
    ON tc.constraint_name = cc.constraint_name
    AND tc.table_schema = cc.constraint_schema
WHERE tc.constraint_type = 'CHECK' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- =====================================================
-- 13. DATA TYPES USED
-- =====================================================
SELECT '=== DATA TYPES USED ===' as section;
SELECT 
    data_type,
    COUNT(*) as usage_count,
    STRING_AGG(DISTINCT table_name, ', ' ORDER BY table_name) as used_in_tables
FROM information_schema.columns
WHERE table_schema = 'public'
GROUP BY data_type
ORDER BY usage_count DESC;

-- =====================================================
-- 14. TABLES WITH RLS ENABLED
-- =====================================================
SELECT '=== TABLES WITH RLS ENABLED ===' as section;
SELECT 
    pg_tables.schemaname,
    pg_tables.tablename,
    pg_tables.rowsecurity as rls_enabled
FROM pg_tables
WHERE pg_tables.schemaname = 'public' AND pg_tables.rowsecurity = true
ORDER BY pg_tables.tablename;

-- =====================================================
-- 15. SPECIFIC FORUM-RELATED TABLES ANALYSIS
-- =====================================================
SELECT '=== FORUM-RELATED TABLES DETAILED ===' as section;
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
AND (
    table_name LIKE '%forum%' OR 
    table_name LIKE '%post%' OR 
    table_name LIKE '%comment%' OR 
    table_name LIKE '%vote%' OR 
    table_name LIKE '%badge%' OR 
    table_name LIKE '%mention%' OR 
    table_name LIKE '%notification%' OR 
    table_name LIKE '%bookmark%' OR 
    table_name LIKE '%follow%' OR 
    table_name LIKE '%category%' OR 
    table_name LIKE '%tag%' OR 
    table_name LIKE '%moderation%' OR 
    table_name LIKE '%report%'
)
ORDER BY table_name, ordinal_position;

-- =====================================================
-- 16. USER PROFILE TABLES ANALYSIS
-- =====================================================
SELECT '=== USER PROFILE TABLES DETAILED ===' as section;
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
AND (
    table_name LIKE '%profile%' OR 
    table_name LIKE '%user%' OR 
    table_name LIKE '%auth%'
)
ORDER BY table_name, ordinal_position;

-- =====================================================
-- 17. EXISTING POLICIES FOR SPECIFIC TABLES
-- =====================================================
SELECT '=== EXISTING POLICIES FOR FORUM TABLES ===' as section;
SELECT 
    pg_policies.schemaname,
    pg_policies.tablename,
    pg_policies.policyname,
    pg_policies.permissive,
    pg_policies.roles,
    pg_policies.cmd,
    pg_policies.qual,
    pg_policies.with_check
FROM pg_policies
WHERE pg_policies.schemaname = 'public'
AND (
    pg_policies.tablename LIKE '%forum%' OR 
    pg_policies.tablename LIKE '%post%' OR 
    pg_policies.tablename LIKE '%comment%' OR 
    pg_policies.tablename LIKE '%vote%' OR 
    pg_policies.tablename LIKE '%badge%' OR 
    pg_policies.tablename LIKE '%mention%' OR 
    pg_policies.tablename LIKE '%notification%' OR 
    pg_policies.tablename LIKE '%bookmark%' OR 
    pg_policies.tablename LIKE '%follow%' OR 
    pg_policies.tablename LIKE '%category%' OR 
    pg_policies.tablename LIKE '%tag%' OR 
    pg_policies.tablename LIKE '%moderation%' OR 
    pg_policies.tablename LIKE '%report%'
)
ORDER BY pg_policies.tablename, pg_policies.policyname;

-- =====================================================
-- 18. SUMMARY OF EXISTING FORUM FUNCTIONALITY
-- =====================================================
SELECT '=== FORUM FUNCTIONALITY SUMMARY ===' as section;
SELECT 
    'Tables' as type,
    COUNT(*) as count,
    STRING_AGG(table_name, ', ' ORDER BY table_name) as items
FROM information_schema.tables
WHERE table_schema = 'public'
AND (
    table_name LIKE '%forum%' OR 
    table_name LIKE '%post%' OR 
    table_name LIKE '%comment%' OR 
    table_name LIKE '%vote%' OR 
    table_name LIKE '%badge%' OR 
    table_name LIKE '%mention%' OR 
    table_name LIKE '%notification%' OR 
    table_name LIKE '%bookmark%' OR 
    table_name LIKE '%follow%' OR 
    table_name LIKE '%category%' OR 
    table_name LIKE '%tag%' OR 
    table_name LIKE '%moderation%' OR 
    table_name LIKE '%report%'
)

UNION ALL

SELECT 
    'Policies' as type,
    COUNT(*) as count,
    STRING_AGG(pg_policies.policyname, ', ' ORDER BY pg_policies.policyname) as items
FROM pg_policies
WHERE pg_policies.schemaname = 'public'
AND (
    pg_policies.tablename LIKE '%forum%' OR 
    pg_policies.tablename LIKE '%post%' OR 
    pg_policies.tablename LIKE '%comment%' OR 
    pg_policies.tablename LIKE '%vote%' OR 
    pg_policies.tablename LIKE '%badge%' OR 
    pg_policies.tablename LIKE '%mention%' OR 
    pg_policies.tablename LIKE '%notification%' OR 
    pg_policies.tablename LIKE '%bookmark%' OR 
    pg_policies.tablename LIKE '%follow%' OR 
    pg_policies.tablename LIKE '%category%' OR 
    pg_policies.tablename LIKE '%tag%' OR 
    pg_policies.tablename LIKE '%moderation%' OR 
    pg_policies.tablename LIKE '%report%'
)

UNION ALL

SELECT 
    'Indexes' as type,
    COUNT(*) as count,
    STRING_AGG(pg_indexes.indexname, ', ' ORDER BY pg_indexes.indexname) as items
FROM pg_indexes
WHERE pg_indexes.schemaname = 'public'
AND (
    pg_indexes.tablename LIKE '%forum%' OR 
    pg_indexes.tablename LIKE '%post%' OR 
    pg_indexes.tablename LIKE '%comment%' OR 
    pg_indexes.tablename LIKE '%vote%' OR 
    pg_indexes.tablename LIKE '%badge%' OR 
    pg_indexes.tablename LIKE '%mention%' OR 
    pg_indexes.tablename LIKE '%notification%' OR 
    pg_indexes.tablename LIKE '%bookmark%' OR 
    pg_indexes.tablename LIKE '%follow%' OR 
    pg_indexes.tablename LIKE '%category%' OR 
    pg_indexes.tablename LIKE '%tag%' OR 
    pg_indexes.tablename LIKE '%moderation%' OR 
    pg_indexes.tablename LIKE '%report%'
);
