-- Fix Forum User Profiles View Issue
-- Run this in your Supabase SQL Editor to resolve the last_active column error

-- Step 1: Add last_active column to the underlying profiles_consolidated table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles_consolidated' AND column_name = 'last_active'
    ) THEN
        RAISE NOTICE 'Adding last_active column to profiles_consolidated table...';
        ALTER TABLE profiles_consolidated ADD COLUMN last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        CREATE INDEX idx_profiles_consolidated_last_active ON profiles_consolidated(last_active);
        RAISE NOTICE 'last_active column added successfully to profiles_consolidated';
    ELSE
        RAISE NOTICE 'last_active column already exists in profiles_consolidated';
    END IF;
END $$;

-- Step 2: Update the forum_user_profiles view to include last_active
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

-- Step 3: Create or replace the update_user_last_active function to work with profiles_consolidated
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles_consolidated 
    SET last_active = NOW() 
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create triggers to update last_active when users create posts or comments
DO $$
BEGIN
    -- Drop existing triggers if they exist
    DROP TRIGGER IF EXISTS update_user_activity_on_post ON forum_posts;
    DROP TRIGGER IF EXISTS update_user_activity_on_comment ON forum_comments;
    
    -- Create new triggers
    CREATE TRIGGER update_user_activity_on_post
        AFTER INSERT ON forum_posts
        FOR EACH ROW EXECUTE FUNCTION update_user_last_active();
    
    CREATE TRIGGER update_user_activity_on_comment
        AFTER INSERT ON forum_comments
        FOR EACH ROW EXECUTE FUNCTION update_user_last_active();
    
    RAISE NOTICE 'Triggers created successfully';
END $$;

-- Step 5: Update the handle_new_user function to work with profiles_consolidated
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles_consolidated (user_id, display_name, avatar_url, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.email
    )
    ON CONFLICT (user_id) DO UPDATE SET
        display_name = COALESCE(profiles_consolidated.display_name, EXCLUDED.display_name),
        avatar_url = COALESCE(profiles_consolidated.avatar_url, EXCLUDED.avatar_url),
        email = COALESCE(profiles_consolidated.email, EXCLUDED.email),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Ensure proper permissions
GRANT ALL ON profiles_consolidated TO anon, authenticated;
GRANT SELECT ON forum_user_profiles TO anon, authenticated;

-- Step 7: Verify the fix
SELECT 'Verification - profiles_consolidated table structure:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles_consolidated'
ORDER BY ordinal_position;

SELECT 'Verification - forum_user_profiles view structure:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'forum_user_profiles'
ORDER BY ordinal_position;

SELECT 'Verification - last_active column exists:' as info;
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles_consolidated' AND column_name = 'last_active'
        ) THEN 'SUCCESS: last_active column exists in profiles_consolidated'
        ELSE 'ERROR: last_active column still missing from profiles_consolidated'
    END as status;

SELECT 'Verification - view has last_active column:' as info;
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'forum_user_profiles' AND column_name = 'last_active'
        ) THEN 'SUCCESS: forum_user_profiles view has last_active column'
        ELSE 'ERROR: forum_user_profiles view missing last_active column'
    END as status;
