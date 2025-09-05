-- FINAL FIX: Add missing 'name' column to forum_comments table
-- This will resolve the "column name does not exist" error

-- Step 1: Add the missing 'name' column
ALTER TABLE forum_comments 
ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Anonymous User';

-- Step 2: Update any existing comments that might have NULL names
UPDATE forum_comments 
SET name = 'Anonymous User' 
WHERE name IS NULL;

-- Step 3: Make the column NOT NULL to prevent future issues
ALTER TABLE forum_comments 
ALTER COLUMN name SET NOT NULL;

-- Step 4: Verify the fix worked
SELECT 'SUCCESS: name column added to forum_comments table' as result;

-- Step 5: Show the updated table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'forum_comments' 
ORDER BY ordinal_position;
