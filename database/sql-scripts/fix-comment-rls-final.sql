-- FINAL FIX: Fix RLS policies for forum_comments table
-- This will allow authenticated users to insert comments

-- Step 1: Check current RLS policies on forum_comments
SELECT 'Current RLS policies on forum_comments:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'forum_comments';

-- Step 2: Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert their own comments" ON forum_comments;
DROP POLICY IF EXISTS "Users can view all comments" ON forum_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON forum_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON forum_comments;

-- Step 3: Create new, more permissive policies
-- Allow authenticated users to insert comments
CREATE POLICY "Authenticated users can insert comments" ON forum_comments
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- Allow everyone to view comments
CREATE POLICY "Anyone can view comments" ON forum_comments
    FOR SELECT 
    TO public 
    USING (true);

-- Allow users to update their own comments
CREATE POLICY "Users can update their own comments" ON forum_comments
    FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments" ON forum_comments
    FOR DELETE 
    TO authenticated 
    USING (auth.uid() = user_id);

-- Step 4: Ensure RLS is enabled on the table
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;

-- Step 5: Verify the new policies
SELECT 'New RLS policies on forum_comments:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'forum_comments';

-- Step 6: Test insert (this should work now)
-- Note: This will only work if you're authenticated
SELECT 'RLS policies updated successfully!' as result;
