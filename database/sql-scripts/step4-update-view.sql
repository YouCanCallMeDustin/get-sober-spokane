-- Step 4: Update forum_user_profiles view to include last_active column
-- Run this after Step 3

-- Now we can safely update the view since the triggers are fixed
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

-- Test that the view works and has the last_active column
SELECT 'Test - forum_user_profiles view with last_active:' as info;
SELECT 
    user_id,
    display_name,
    last_active
FROM forum_user_profiles 
LIMIT 3;

