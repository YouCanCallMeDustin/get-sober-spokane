-- DEFINITIVE FIX for comment insertion error
-- This will fix the "column name does not exist" error

-- Step 1: Check current table structure
SELECT 'Current forum_comments table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'forum_comments' 
ORDER BY ordinal_position;

-- Step 2: Add the missing 'name' column if it doesn't exist
DO $$
BEGIN
    -- Check if 'name' column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'forum_comments' AND column_name = 'name'
    ) THEN
        -- Add the 'name' column
        ALTER TABLE forum_comments ADD COLUMN name TEXT DEFAULT 'Anonymous User';
        RAISE NOTICE 'Added name column to forum_comments table';
    ELSE
        RAISE NOTICE 'name column already exists in forum_comments table';
    END IF;
END $$;

-- Step 3: Update any existing NULL values
UPDATE forum_comments 
SET name = 'Anonymous User' 
WHERE name IS NULL;

-- Step 4: Make the column NOT NULL
ALTER TABLE forum_comments 
ALTER COLUMN name SET NOT NULL;

-- Step 5: Verify the fix
SELECT 'Updated forum_comments table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'forum_comments' 
ORDER BY ordinal_position;

-- Step 6: Test insert (this should work now)
INSERT INTO forum_comments (post_id, user_id, content, name) 
VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'Test comment', 'Test User')
ON CONFLICT DO NOTHING;

-- Clean up test data
DELETE FROM forum_comments WHERE content = 'Test comment';

SELECT 'Comment table fix completed successfully!' as result;
