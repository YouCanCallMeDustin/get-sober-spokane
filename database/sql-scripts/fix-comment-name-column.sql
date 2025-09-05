-- Fix for missing 'name' column in forum_comments table
-- This script adds the missing column that's causing the comment insertion error

-- Add name column to forum_comments if it doesn't exist
ALTER TABLE forum_comments 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Update existing comments to have a default name if they don't have one
UPDATE forum_comments 
SET name = 'Anonymous User' 
WHERE name IS NULL;

-- Make name column NOT NULL with a default value
ALTER TABLE forum_comments 
ALTER COLUMN name SET DEFAULT 'Anonymous User';

-- Alternative: If you want to remove the name column entirely (recommended)
-- Uncomment the following lines and comment out the above lines:

-- ALTER TABLE forum_comments DROP COLUMN IF EXISTS name;

-- This will remove the name column since it's not needed
-- The user information should come from the forum_user_profiles table
-- via the user_id foreign key relationship
