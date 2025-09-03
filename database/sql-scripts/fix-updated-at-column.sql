-- Fix missing updated_at column in forum_user_profiles table
-- This script addresses the error: "Could not find the 'updated_at' column of 'forum_user_profiles' in the schema cache"
-- Run this script in your Supabase SQL editor

-- First, create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at column to forum_user_profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'forum_user_profiles' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE forum_user_profiles 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        RAISE NOTICE 'Added updated_at column to forum_user_profiles table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in forum_user_profiles table';
    END IF;
END $$;

-- Update existing rows to have updated_at value
UPDATE forum_user_profiles 
SET updated_at = COALESCE(last_active, join_date, NOW()) 
WHERE updated_at IS NULL;

-- Create or replace trigger for updated_at
DROP TRIGGER IF EXISTS update_forum_user_profiles_updated_at ON forum_user_profiles;
CREATE TRIGGER update_forum_user_profiles_updated_at 
    BEFORE UPDATE ON forum_user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'forum_user_profiles' 
ORDER BY ordinal_position;

-- Test the trigger by updating a row
UPDATE forum_user_profiles 
SET bio = bio 
WHERE user_id = (SELECT user_id FROM forum_user_profiles LIMIT 1);

-- Verify the trigger worked
SELECT user_id, bio, updated_at 
FROM forum_user_profiles 
ORDER BY updated_at DESC 
LIMIT 5;
