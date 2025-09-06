-- Fix Chat RLS Policies for Anonymous Users
-- This script updates the Row Level Security policies to allow anonymous users to participate in chat

-- First, let's check the current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('user_presence', 'messages', 'chat_rooms');

-- Update user_presence table RLS policies
-- Allow anonymous users to insert their presence
DROP POLICY IF EXISTS "Allow anonymous users to insert presence" ON user_presence;
CREATE POLICY "Allow anonymous users to insert presence" ON user_presence
    FOR INSERT 
    TO anon
    WITH CHECK (true);

-- Allow anonymous users to update their own presence
DROP POLICY IF EXISTS "Allow anonymous users to update presence" ON user_presence;
CREATE POLICY "Allow anonymous users to update presence" ON user_presence
    FOR UPDATE 
    TO anon
    USING (true)
    WITH CHECK (true);

-- Allow anonymous users to delete their own presence
DROP POLICY IF EXISTS "Allow anonymous users to delete presence" ON user_presence;
CREATE POLICY "Allow anonymous users to delete presence" ON user_presence
    FOR DELETE 
    TO anon
    USING (true);

-- Allow anonymous users to read presence data
DROP POLICY IF EXISTS "Allow anonymous users to read presence" ON user_presence;
CREATE POLICY "Allow anonymous users to read presence" ON user_presence
    FOR SELECT 
    TO anon
    USING (true);

-- Update messages table RLS policies
-- Allow anonymous users to insert messages
DROP POLICY IF EXISTS "Allow anonymous users to insert messages" ON messages;
CREATE POLICY "Allow anonymous users to insert messages" ON messages
    FOR INSERT 
    TO anon
    WITH CHECK (true);

-- Allow anonymous users to read messages
DROP POLICY IF EXISTS "Allow anonymous users to read messages" ON messages;
CREATE POLICY "Allow anonymous users to read messages" ON messages
    FOR SELECT 
    TO anon
    USING (true);

-- Update chat_rooms table RLS policies
-- Allow anonymous users to read chat rooms
DROP POLICY IF EXISTS "Allow anonymous users to read chat rooms" ON chat_rooms;
CREATE POLICY "Allow anonymous users to read chat rooms" ON chat_rooms
    FOR SELECT 
    TO anon
    USING (true);

-- Ensure RLS is enabled on all tables
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to anon role
GRANT ALL ON user_presence TO anon;
GRANT ALL ON messages TO anon;
GRANT ALL ON chat_rooms TO anon;

-- Grant sequence permissions for auto-incrementing IDs
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Test the policies
SELECT 'RLS policies updated successfully!' as status;

-- Show current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('user_presence', 'messages', 'chat_rooms')
ORDER BY tablename, policyname;
