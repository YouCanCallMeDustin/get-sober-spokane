-- Simple fix for sponsor profiles relationship issue
-- This script ensures the basic tables exist and can be queried together

-- Step 1: Ensure profiles_consolidated table exists
CREATE TABLE IF NOT EXISTS profiles_consolidated (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Basic profile information
    email TEXT,
    display_name TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    bio TEXT,
    avatar_url TEXT,
    
    -- Location and privacy
    location VARCHAR(100) DEFAULT 'Spokane, WA',
    privacy_level TEXT DEFAULT 'standard' CHECK (privacy_level IN ('public', 'standard', 'high')),
    privacy_settings VARCHAR(20) DEFAULT 'public' CHECK (privacy_settings IN ('public', 'community', 'private')),
    
    -- Sobriety tracking
    sobriety_date DATE,
    sobriety_start_date DATE,
    last_checkin DATE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    
    -- Recovery information
    recovery_goals TEXT,
    support_network TEXT,
    emergency_contacts JSONB DEFAULT '[]',
    
    -- User preferences
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    email_notifications BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Ensure sponsor_profiles table exists (without profile_id for now)
CREATE TABLE IF NOT EXISTS sponsor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Sponsor-specific information
    is_available_sponsor BOOLEAN DEFAULT false,
    max_sponsees INTEGER DEFAULT 3 CHECK (max_sponsees >= 1 AND max_sponsees <= 10),
    years_sober INTEGER,
    recovery_program TEXT,
    recovery_program_other TEXT,
    
    -- Availability and preferences
    preferred_contact_method TEXT DEFAULT 'message' CHECK (preferred_contact_method IN ('message', 'email', 'phone')),
    availability_notes TEXT,
    timezone TEXT DEFAULT 'America/Los_Angeles',
    
    -- Experience and qualifications
    sponsor_experience_years INTEGER DEFAULT 0,
    has_completed_sponsor_training BOOLEAN DEFAULT false,
    specializations TEXT[],
    
    -- Location and meeting preferences
    meeting_preferences TEXT[] DEFAULT '{}',
    max_distance_miles INTEGER DEFAULT 25,
    
    -- Bio and approach
    sponsor_bio TEXT,
    recovery_approach TEXT,
    what_you_offer TEXT,
    what_you_expect TEXT,
    
    -- Verification and safety
    is_verified_sponsor BOOLEAN DEFAULT false,
    background_check_date DATE,
    references_provided BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_consolidated_user_id ON profiles_consolidated(user_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_user_id ON sponsor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_available ON sponsor_profiles(is_available_sponsor) WHERE is_available_sponsor = true;
CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_verified ON sponsor_profiles(is_verified_sponsor) WHERE is_verified_sponsor = true;

-- Step 4: Enable RLS
ALTER TABLE profiles_consolidated ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create basic RLS policies
-- Profiles consolidated policies
DROP POLICY IF EXISTS "Users can view public profiles" ON profiles_consolidated;
CREATE POLICY "Users can view public profiles" ON profiles_consolidated
    FOR SELECT USING (privacy_level = 'public' OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles_consolidated;
CREATE POLICY "Users can view their own profile" ON profiles_consolidated
    FOR ALL USING (auth.uid() = user_id);

-- Sponsor profiles policies
DROP POLICY IF EXISTS "Users can view available sponsor profiles" ON sponsor_profiles;
CREATE POLICY "Users can view available sponsor profiles" ON sponsor_profiles
    FOR SELECT USING (is_available_sponsor = true);

DROP POLICY IF EXISTS "Users can view their own sponsor profile" ON sponsor_profiles;
CREATE POLICY "Users can view their own sponsor profile" ON sponsor_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Step 6: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles_consolidated TO anon, authenticated;
GRANT ALL ON sponsor_profiles TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 7: Verification
SELECT 'Verification - Checking table structure...' as status;

-- Check if tables exist
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles_consolidated') 
        THEN '✅ profiles_consolidated table exists'
        ELSE '❌ profiles_consolidated table missing'
    END as profiles_status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sponsor_profiles') 
        THEN '✅ sponsor_profiles table exists'
        ELSE '❌ sponsor_profiles table missing'
    END as sponsor_status;

-- Check record counts
SELECT 
    (SELECT COUNT(*) FROM profiles_consolidated) as profiles_count,
    (SELECT COUNT(*) FROM sponsor_profiles) as sponsors_count;

SELECT '✅ Simple fix completed! Tables are ready for separate queries.' as status;
