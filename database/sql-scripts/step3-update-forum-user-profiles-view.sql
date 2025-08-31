-- Step 3: Update forum_user_profiles view to include last_active column
-- Run this after Step 2

-- Update the forum_user_profiles view to include the last_active column
CREATE OR REPLACE VIEW forum_user_profiles AS
SELECT 
    id,
    user_id,
    display_name,
    bio,
    avatar_url,
    location,
    sobriety_date,
    privacy_level,
    created_at,
    updated_at,
    last_active,
    -- Add default values for missing columns to maintain compatibility
    FALSE as is_verified,
    created_at as join_date
FROM profiles_consolidated;

-- Verify the view was updated correctly
SELECT 'Verification - forum_user_profiles view structure:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'forum_user_profiles'
ORDER BY ordinal_position;

-- Test that the view works
SELECT 'Test - forum_user_profiles view data:' as info;
SELECT 
    user_id,
    display_name,
    last_active
FROM forum_user_profiles 
LIMIT 3;
