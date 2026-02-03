    -- RUN THIS IN YOUR SUPABASE SQL EDITOR
-- This script fixes the "last_active" column error preventing profile updates

-- 1. Add the missing 'last_active' column
ALTER TABLE profiles_consolidated 
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE;

-- 2. Force Supabase to refresh its cache
NOTIFY pgrst, 'reload config';
