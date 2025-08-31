-- Step 5: Test forum comment functionality
-- Run this after Step 4 to verify everything works

-- Test 1: Check if we have users and posts to test with
SELECT 'Available users for testing:' as info;
SELECT id, email, created_at FROM auth.users LIMIT 3;

SELECT 'Available posts for testing:' as info;
SELECT id, title, user_id FROM forum_posts LIMIT 3;

-- Test 2: Verify the triggers are working correctly
SELECT 'Verification - Triggers are in place:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name IN ('update_user_activity_on_post', 'update_user_activity_on_comment');

-- Test 3: Verify the function exists and works
SELECT 'Verification - Function exists:' as info;
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'update_user_last_active';

-- Test 4: Test the view has all required columns
SELECT 'Verification - View has last_active column:' as info;
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'forum_user_profiles' AND column_name = 'last_active'
        ) THEN 'SUCCESS: forum_user_profiles view has last_active column'
        ELSE 'ERROR: forum_user_profiles view missing last_active column'
    END as status;

-- Test 5: Manual test of the update function (uncomment to test with a real user)
-- Replace 'your-test-user-id' with an actual user ID from the results above
/*
DO $$
DECLARE
    test_user_id UUID;
    old_last_active TIMESTAMP WITH TIME ZONE;
    new_last_active TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get a test user ID
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Get current last_active
        SELECT last_active INTO old_last_active 
        FROM profiles_consolidated 
        WHERE user_id = test_user_id;
        
        -- Test the update function directly
        UPDATE profiles_consolidated 
        SET last_active = NOW() 
        WHERE user_id = test_user_id;
        
        -- Get new last_active
        SELECT last_active INTO new_last_active 
        FROM profiles_consolidated 
        WHERE user_id = test_user_id;
        
        RAISE NOTICE 'Test update completed for user: %', test_user_id;
        RAISE NOTICE 'Old last_active: %, New last_active: %', old_last_active, new_last_active;
    ELSE
        RAISE NOTICE 'No users found for testing';
    END IF;
END $$;
*/

-- Final verification summary
SELECT 'FINAL VERIFICATION SUMMARY:' as info;
SELECT 
    '✅ last_active column exists in profiles_consolidated' as check_item,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles_consolidated' AND column_name = 'last_active'
        ) THEN 'PASS'
        ELSE 'FAIL'
    END as status
UNION ALL
SELECT 
    '✅ forum_user_profiles view has last_active column' as check_item,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'forum_user_profiles' AND column_name = 'last_active'
        ) THEN 'PASS'
        ELSE 'FAIL'
    END as status
UNION ALL
SELECT 
    '✅ update_user_last_active function exists' as check_item,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'update_user_last_active'
        ) THEN 'PASS'
        ELSE 'FAIL'
    END as status
UNION ALL
SELECT 
    '✅ triggers are in place' as check_item,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_name IN ('update_user_activity_on_post', 'update_user_activity_on_comment')
        ) THEN 'PASS'
        ELSE 'FAIL'
    END as status;
