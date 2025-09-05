-- Fix RLS policies for forum_comments table
-- This will allow authenticated users to insert comments

-- Step 1: Check current RLS policies
SELECT 'Current RLS policies for forum_comments:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'forum_comments';

-- Step 2: Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert their own comments" ON forum_comments;
DROP POLICY IF EXISTS "Users can view all comments" ON forum_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON forum_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON forum_comments;

-- Step 3: Create new, working RLS policies
CREATE POLICY "Enable insert for authenticated users" ON forum_comments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for all users" ON forum_comments
    FOR SELECT USING (true);

CREATE POLICY "Enable update for users based on user_id" ON forum_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON forum_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Step 4: Ensure RLS is enabled
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;

-- Step 5: Verify the new policies
SELECT 'New RLS policies for forum_comments:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'forum_comments';

SELECT 'RLS policies updated successfully!' as result;
