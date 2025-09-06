-- Fix Profiles Consolidated RLS Policies
-- This script ensures proper RLS policies for the profiles_consolidated table

-- Enable RLS on profiles_consolidated table
ALTER TABLE profiles_consolidated ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles_consolidated;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles_consolidated;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles_consolidated;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles_consolidated;

-- Create comprehensive RLS policies for profiles_consolidated

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles_consolidated
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles_consolidated
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles_consolidated
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile" ON profiles_consolidated
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = user_id);

-- Allow anonymous users to read public profile information (for chat usernames)
CREATE POLICY "Anonymous users can read public profiles" ON profiles_consolidated
    FOR SELECT 
    TO anon
    USING (privacy_level = 'public' OR privacy_settings = 'public');

-- Allow authenticated users to read public profiles of other users
CREATE POLICY "Authenticated users can read public profiles" ON profiles_consolidated
    FOR SELECT 
    TO authenticated
    USING (
        auth.uid() = user_id OR 
        privacy_level = 'public' OR 
        privacy_settings = 'public'
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON profiles_consolidated TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON profiles_consolidated TO authenticated;

-- Create a function to get user display name for chat
CREATE OR REPLACE FUNCTION get_user_display_name(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    display_name TEXT;
BEGIN
    SELECT COALESCE(display_name, email, 'Anonymous')
    INTO display_name
    FROM profiles_consolidated
    WHERE user_id = user_uuid;
    
    RETURN COALESCE(display_name, 'Anonymous');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_display_name(UUID) TO anon, authenticated;

-- Test the function
SELECT 'RLS policies and functions created successfully!' as status;

-- Show current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles_consolidated'
ORDER BY policyname;
