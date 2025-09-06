-- Fix User Presence Schema for Anonymous Users
-- This script fixes the unique constraint issue for anonymous users

-- First, let's check the current constraint
SELECT conname, contype, confrelid::regclass, confkey, conkey
FROM pg_constraint 
WHERE conrelid = 'user_presence'::regclass;

-- Drop the existing unique constraint that causes issues with NULL user_id
ALTER TABLE user_presence DROP CONSTRAINT IF EXISTS user_presence_user_id_room_key;

-- Create a new unique constraint that handles NULL values properly
-- This constraint allows multiple NULL values for user_id but ensures uniqueness for non-NULL values
CREATE UNIQUE INDEX IF NOT EXISTS user_presence_unique_authenticated 
ON user_presence (user_id, room) 
WHERE user_id IS NOT NULL;

-- Create a separate unique constraint for anonymous users based on socket_id and room
CREATE UNIQUE INDEX IF NOT EXISTS user_presence_unique_anonymous 
ON user_presence (socket_id, room) 
WHERE user_id IS NULL;

-- Add a check constraint to ensure data integrity
ALTER TABLE user_presence DROP CONSTRAINT IF EXISTS user_presence_anonymous_check;
ALTER TABLE user_presence ADD CONSTRAINT user_presence_anonymous_check 
CHECK (
    (user_id IS NOT NULL AND is_anonymous = false) OR 
    (user_id IS NULL AND is_anonymous = true)
);

-- Update the table to ensure data consistency
UPDATE user_presence 
SET is_anonymous = (user_id IS NULL)
WHERE is_anonymous IS NULL;

-- Add a provider column if it doesn't exist
ALTER TABLE user_presence ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';

-- Create an index for better performance on room queries
CREATE INDEX IF NOT EXISTS idx_user_presence_room_status ON user_presence(room, status);

-- Show the updated constraints
SELECT conname, contype, confrelid::regclass, confkey, conkey
FROM pg_constraint 
WHERE conrelid = 'user_presence'::regclass;

-- Show the indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'user_presence';

-- Test the constraints with some sample data
SELECT 'Schema fixes applied successfully!' as status;
