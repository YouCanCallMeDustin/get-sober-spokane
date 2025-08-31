-- Fix Missing last_active Column Issue
-- Run this in your Supabase SQL Editor to resolve the forum error

-- Step 1: Check if forum_user_profiles table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_user_profiles') THEN
        RAISE NOTICE 'Creating forum_user_profiles table...';
        
        -- Create the forum_user_profiles table with all required columns
        CREATE TABLE forum_user_profiles (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            display_name VARCHAR(100),
            bio TEXT,
            avatar_url TEXT,
            location VARCHAR(200),
            sobriety_date DATE,
            privacy_level VARCHAR(20) DEFAULT 'community' CHECK (privacy_level IN ('public', 'community', 'private')),
            is_verified BOOLEAN DEFAULT FALSE,
            join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Add unique constraint on user_id
        ALTER TABLE forum_user_profiles ADD CONSTRAINT forum_user_profiles_user_id_key UNIQUE (user_id);
        
        -- Create indexes
        CREATE INDEX idx_forum_user_profiles_user_id ON forum_user_profiles(user_id);
        CREATE INDEX idx_forum_user_profiles_last_active ON forum_user_profiles(last_active);
        
        RAISE NOTICE 'forum_user_profiles table created successfully';
    ELSE
        RAISE NOTICE 'forum_user_profiles table already exists';
    END IF;
END $$;

-- Step 2: Add last_active column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'forum_user_profiles' AND column_name = 'last_active'
    ) THEN
        RAISE NOTICE 'Adding last_active column to forum_user_profiles...';
        ALTER TABLE forum_user_profiles ADD COLUMN last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        CREATE INDEX idx_forum_user_profiles_last_active ON forum_user_profiles(last_active);
        RAISE NOTICE 'last_active column added successfully';
    ELSE
        RAISE NOTICE 'last_active column already exists';
    END IF;
END $$;

-- Step 3: Create or replace the update_user_last_active function
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE forum_user_profiles 
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

-- Step 5: Ensure forum_user_profiles table has proper permissions
GRANT ALL ON forum_user_profiles TO anon, authenticated;
GRANT USAGE ON SEQUENCE forum_user_profiles_id_seq TO anon, authenticated;

-- Step 6: Create a function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO forum_user_profiles (user_id, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create trigger for new user creation (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION handle_new_user();
        RAISE NOTICE 'New user trigger created successfully';
    ELSE
        RAISE NOTICE 'New user trigger already exists';
    END IF;
END $$;

-- Step 8: Verify the fix
SELECT 'Verification - forum_user_profiles table structure:' as info;
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
            WHERE table_name = 'forum_user_profiles' AND column_name = 'last_active'
        ) THEN 'SUCCESS: last_active column exists'
        ELSE 'ERROR: last_active column still missing'
    END as status;
