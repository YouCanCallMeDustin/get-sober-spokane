-- Test Forum Comment Functionality
-- Run this after applying the fix to verify everything works

-- Test 1: Check if we can insert a test comment (this will trigger the last_active update)
-- Note: Replace 'your-test-user-id' with an actual user ID from your auth.users table

-- First, let's see if there are any existing users and posts to test with
SELECT 'Available users:' as info;
SELECT id, email, created_at FROM auth.users LIMIT 5;

SELECT 'Available posts:' as info;
SELECT id, title, user_id FROM forum_posts LIMIT 5;

-- Test 2: Check if the triggers exist
SELECT 'Checking triggers:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name IN ('update_user_activity_on_post', 'update_user_activity_on_comment');

-- Test 3: Check if the function exists
SELECT 'Checking function:' as info;
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'update_user_last_active';

-- Test 4: Check if the view is working
SELECT 'Testing forum_user_profiles view:' as info;
SELECT 
    user_id,
    display_name,
    last_active
FROM forum_user_profiles 
LIMIT 5;

-- Test 5: Manual test of the update function (replace with actual user_id)
-- Uncomment and modify the following lines to test with a real user:
/*
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get a test user ID
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Test the update function directly
        UPDATE profiles_consolidated 
        SET last_active = NOW() 
        WHERE user_id = test_user_id;
        
        RAISE NOTICE 'Test update completed for user: %', test_user_id;
    ELSE
        RAISE NOTICE 'No users found for testing';
    END IF;
END $$;
*/
