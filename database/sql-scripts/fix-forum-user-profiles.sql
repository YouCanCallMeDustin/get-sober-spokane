-- Fix forum_user_profiles table - Add missing updated_at column
-- Run this script in your Supabase SQL editor

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'forum_user_profiles' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE forum_user_profiles 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Update existing rows to have updated_at value
UPDATE forum_user_profiles 
SET updated_at = COALESCE(last_active, join_date, NOW()) 
WHERE updated_at IS NULL;

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_forum_user_profiles_updated_at ON forum_user_profiles;
CREATE TRIGGER update_forum_user_profiles_updated_at 
    BEFORE UPDATE ON forum_user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'forum_user_profiles' 
ORDER BY ordinal_position;
