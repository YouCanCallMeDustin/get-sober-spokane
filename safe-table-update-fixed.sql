-- Safe Table Update Script for Get Sober Spokane Dashboard (Fixed for UUID types)
-- This script first checks your table structure, then safely adds missing columns
-- Run this AFTER running check-table-structure.sql

-- First, let's see what we're working with
DO $$
DECLARE
    profile_id_col text;
    milestone_user_col text;
    profile_id_type text;
    milestone_user_type text;
BEGIN
    -- Find the primary key column in profiles table
    SELECT column_name, data_type INTO profile_id_col, profile_id_type
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name IN ('id', 'user_id', 'userid', 'uid')
    LIMIT 1;
    
    -- Find the user reference column in recovery_milestones table
    SELECT column_name, data_type INTO milestone_user_col, milestone_user_type
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'recovery_milestones' 
    AND column_name IN ('user_id', 'userid', 'uid', 'id')
    LIMIT 1;
    
    -- Add missing columns to profiles table if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'bio'
    ) THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
        RAISE NOTICE 'Added bio column to profiles table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'privacy_level'
    ) THEN
        ALTER TABLE profiles ADD COLUMN privacy_level TEXT DEFAULT 'standard';
        RAISE NOTICE 'Added privacy_level column to profiles table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'theme'
    ) THEN
        ALTER TABLE profiles ADD COLUMN theme TEXT DEFAULT 'light';
        RAISE NOTICE 'Added theme column to profiles table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'email_notifications'
    ) THEN
        ALTER TABLE profiles ADD COLUMN email_notifications BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added email_notifications column to profiles table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to profiles table';
    END IF;

    -- Ensure RLS is enabled on both tables
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE recovery_milestones ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on both tables';

    -- Create RLS policies for profiles table using the correct column name and type
    IF profile_id_col IS NOT NULL THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
        
        -- Create new policies using the correct column name and proper type casting
        IF profile_id_type = 'uuid' THEN
            -- For UUID columns, compare directly with auth.uid()
            EXECUTE format('CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = %I)', profile_id_col);
            EXECUTE format('CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = %I)', profile_id_col);
            EXECUTE format('CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = %I)', profile_id_col);
            EXECUTE format('CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE USING (auth.uid() = %I)', profile_id_col);
        ELSE
            -- For text columns, cast auth.uid() to text
            EXECUTE format('CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid()::text = %I)', profile_id_col);
            EXECUTE format('CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid()::text = %I)', profile_id_col);
            EXECUTE format('CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid()::text = %I)', profile_id_col);
            EXECUTE format('CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE USING (auth.uid()::text = %I)', profile_id_col);
        END IF;
        
        RAISE NOTICE 'Created RLS policies for profiles table using column: % (type: %)', profile_id_col, profile_id_type;
    ELSE
        RAISE NOTICE 'Could not determine primary key column for profiles table. RLS policies not created.';
    END IF;

    -- Create RLS policies for recovery_milestones table using the correct column name and type
    IF milestone_user_col IS NOT NULL THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can view own milestones" ON recovery_milestones;
        DROP POLICY IF EXISTS "Users can insert own milestones" ON recovery_milestones;
        DROP POLICY IF EXISTS "Users can update own milestones" ON recovery_milestones;
        DROP POLICY IF EXISTS "Users can delete own milestones" ON recovery_milestones;
        
        -- Create new policies using the correct column name and proper type casting
        IF milestone_user_type = 'uuid' THEN
            -- For UUID columns, compare directly with auth.uid()
            EXECUTE format('CREATE POLICY "Users can view own milestones" ON recovery_milestones FOR SELECT USING (auth.uid() = %I)', milestone_user_col);
            EXECUTE format('CREATE POLICY "Users can insert own milestones" ON recovery_milestones FOR INSERT WITH CHECK (auth.uid() = %I)', milestone_user_col);
            EXECUTE format('CREATE POLICY "Users can update own milestones" ON recovery_milestones FOR UPDATE USING (auth.uid() = %I)', milestone_user_col);
            EXECUTE format('CREATE POLICY "Users can delete own milestones" ON recovery_milestones FOR DELETE USING (auth.uid() = %I)', milestone_user_col);
        ELSE
            -- For text columns, cast auth.uid() to text
            EXECUTE format('CREATE POLICY "Users can view own milestones" ON recovery_milestones FOR SELECT USING (auth.uid()::text = %I)', milestone_user_col);
            EXECUTE format('CREATE POLICY "Users can insert own milestones" ON recovery_milestones FOR INSERT WITH CHECK (auth.uid()::text = %I)', milestone_user_col);
            EXECUTE format('CREATE POLICY "Users can update own milestones" ON recovery_milestones FOR UPDATE USING (auth.uid() = %I)', milestone_user_col);
            EXECUTE format('CREATE POLICY "Users can delete own milestones" ON recovery_milestones FOR DELETE USING (auth.uid() = %I)', milestone_user_col);
        END IF;
        
        RAISE NOTICE 'Created RLS policies for recovery_milestones table using column: % (type: %)', milestone_user_col, milestone_user_type;
    ELSE
        RAISE NOTICE 'Could not determine user reference column for recovery_milestones table. RLS policies not created.';
    END IF;

END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.recovery_milestones TO anon, authenticated;

-- Show the final table structures
SELECT 'Final profiles table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

SELECT 'Final recovery_milestones table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'recovery_milestones'
ORDER BY ordinal_position;

-- Show RLS status
SELECT 'RLS Status:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'recovery_milestones');

-- Show created policies
SELECT 'Created Policies:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'recovery_milestones');
