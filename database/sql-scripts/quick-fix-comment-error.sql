-- Quick fix for comment insertion error
-- This adds the missing 'name' column that's causing the error

-- Add name column to forum_comments if it doesn't exist
ALTER TABLE forum_comments 
ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Anonymous User';

-- Update any existing comments that might have NULL names
UPDATE forum_comments 
SET name = 'Anonymous User' 
WHERE name IS NULL;

-- Make the column NOT NULL
ALTER TABLE forum_comments 
ALTER COLUMN name SET NOT NULL;
