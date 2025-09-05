-- Complete fix for comment insertion error
-- This script ensures the forum_comments table has all necessary columns

-- First, let's see what columns currently exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'forum_comments' 
ORDER BY ordinal_position;

-- Add any missing columns that might be expected
ALTER TABLE forum_comments 
ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Anonymous User',
ADD COLUMN IF NOT EXISTS user_name TEXT DEFAULT 'Anonymous User',
ADD COLUMN IF NOT EXISTS display_name TEXT DEFAULT 'Anonymous User';

-- Update existing comments to have proper names
UPDATE forum_comments 
SET name = 'Anonymous User' 
WHERE name IS NULL;

UPDATE forum_comments 
SET user_name = 'Anonymous User' 
WHERE user_name IS NULL;

UPDATE forum_comments 
SET display_name = 'Anonymous User' 
WHERE display_name IS NULL;

-- Make sure the essential columns are NOT NULL
ALTER TABLE forum_comments 
ALTER COLUMN name SET NOT NULL,
ALTER COLUMN user_name SET NOT NULL,
ALTER COLUMN display_name SET NOT NULL;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'forum_comments' 
ORDER BY ordinal_position;
