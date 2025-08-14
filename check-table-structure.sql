-- Diagnostic Script: Check Your Existing Table Structure
-- Run this first to see what columns your tables actually have

-- Check profiles table structure
SELECT 'profiles table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check recovery_milestones table structure
SELECT 'recovery_milestones table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'recovery_milestones'
ORDER BY ordinal_position;

-- Check if RLS is already enabled
SELECT 'RLS Status:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'recovery_milestones');

-- Check existing policies
SELECT 'Existing Policies:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'recovery_milestones');
