-- Fix missing columns in user_profiles table
-- Run this in your Supabase SQL Editor

-- Add missing location column
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT 'Spokane, WA';

-- Add missing privacy_settings column if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS privacy_settings VARCHAR(50) DEFAULT 'public';

-- Add missing updated_at column if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check existing data
SELECT * FROM user_profiles LIMIT 5;
