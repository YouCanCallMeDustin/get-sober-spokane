-- Step 3: Fix database triggers to work with profiles_consolidated table
-- Run this after Step 2

-- First, let's see what triggers currently exist
SELECT 'Current triggers that might be causing issues:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%user_activity%' OR trigger_name LIKE '%last_active%';

-- Drop any existing problematic triggers
DO $$
BEGIN
    -- Drop triggers that might be trying to update the view
    DROP TRIGGER IF EXISTS update_user_activity_on_post ON forum_posts;
    DROP TRIGGER IF EXISTS update_user_activity_on_comment ON forum_comments;
    
    RAISE NOTICE 'Dropped existing triggers';
END $$;

-- Create or replace the update function to work with profiles_consolidated
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles_consolidated 
    SET last_active = NOW() 
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new triggers that work with the underlying table
CREATE TRIGGER update_user_activity_on_post
    AFTER INSERT ON forum_posts
    FOR EACH ROW EXECUTE FUNCTION update_user_last_active();

CREATE TRIGGER update_user_activity_on_comment
    AFTER INSERT ON forum_comments
    FOR EACH ROW EXECUTE FUNCTION update_user_last_active();

-- Verify the triggers were created
SELECT 'Verification - New triggers created:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name IN ('update_user_activity_on_post', 'update_user_activity_on_comment');
