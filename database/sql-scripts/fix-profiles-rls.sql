-- FIX: Allow all users to view profiles_consolidated
-- This ensures the Sponsor Finder and other public pages can display user names and avatars instead of falling back to "Anonymous".

-- Ensure RLS is enabled on the table
ALTER TABLE IF EXISTS profiles_consolidated ENABLE ROW LEVEL SECURITY;

-- First, remove any existing select policy that might be too restrictive
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles_consolidated;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles_consolidated;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles_consolidated;

-- Create a straightforward policy allowing everyone (or at least authenticated users) to see profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles_consolidated 
FOR SELECT 
USING (true);
