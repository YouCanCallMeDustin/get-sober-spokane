-- Check Current sponsor_requests Table Structure
-- Run this in your Supabase SQL Editor to diagnose the availability_notes column issue

-- Check if sponsor_requests table exists
SELECT 'Table existence check:' as info;
SELECT 
    table_name, 
    table_type
FROM information_schema.tables 
WHERE table_name = 'sponsor_requests';

-- Check sponsor_requests table structure (if it exists)
SELECT 'sponsor_requests table structure:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_name = 'sponsor_requests'
ORDER BY ordinal_position;

-- Check if availability_notes column exists specifically
SELECT 'availability_notes column check:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'sponsor_requests' 
AND column_name = 'availability_notes';

-- Check all sponsor-related tables
SELECT 'All sponsor-related tables:' as info;
SELECT 
    table_name, 
    table_type
FROM information_schema.tables 
WHERE table_name LIKE '%sponsor%'
ORDER BY table_name;
