-- Fix Sponsor Profiles Relationship with Profiles Consolidated
-- This script fixes the foreign key relationship issue between sponsor_profiles and profiles_consolidated

-- First, let's check if the tables exist and their current structure
SELECT 'Checking current table structure...' as status;

-- Check if sponsor_profiles table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sponsor_profiles') 
        THEN '✅ sponsor_profiles table exists'
        ELSE '❌ sponsor_profiles table does not exist'
    END as sponsor_profiles_status;

-- Check if profiles_consolidated table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles_consolidated') 
        THEN '✅ profiles_consolidated table exists'
        ELSE '❌ profiles_consolidated table does not exist'
    END as profiles_consolidated_status;

-- Check current foreign key constraints on sponsor_profiles
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'sponsor_profiles';

-- Step 1: Ensure profiles_consolidated table exists with proper structure
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

-- Step 2: Create sponsor_profiles table with proper foreign key to profiles_consolidated
CREATE TABLE IF NOT EXISTS sponsor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    profile_id UUID REFERENCES profiles_consolidated(id) ON DELETE CASCADE,
    
    -- Sponsor-specific information
    is_available_sponsor BOOLEAN DEFAULT false,
    max_sponsees INTEGER DEFAULT 3 CHECK (max_sponsees >= 1 AND max_sponsees <= 10),
    years_sober INTEGER,
    recovery_program TEXT, -- e.g., "AA", "NA", "SMART Recovery", "Other"
    recovery_program_other TEXT, -- if "Other" is selected
    
    -- Availability and preferences
    preferred_contact_method TEXT DEFAULT 'message' CHECK (preferred_contact_method IN ('message', 'email', 'phone')),
    availability_notes TEXT,
    timezone TEXT DEFAULT 'America/Los_Angeles',
    
    -- Experience and qualifications
    sponsor_experience_years INTEGER DEFAULT 0,
    has_completed_sponsor_training BOOLEAN DEFAULT false,
    specializations TEXT[], -- e.g., ["early_recovery", "relapse_prevention", "family_support"]
    
    -- Location and meeting preferences
    meeting_preferences TEXT[] DEFAULT '{}', -- e.g., ["in_person", "online", "phone"]
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

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_consolidated_user_id ON profiles_consolidated(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_consolidated_sobriety_date ON profiles_consolidated(sobriety_date);
CREATE INDEX IF NOT EXISTS idx_profiles_consolidated_location ON profiles_consolidated(location);
CREATE INDEX IF NOT EXISTS idx_profiles_consolidated_privacy ON profiles_consolidated(privacy_level);

CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_user_id ON sponsor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_profile_id ON sponsor_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_available ON sponsor_profiles(is_available_sponsor) WHERE is_available_sponsor = true;
CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_verified ON sponsor_profiles(is_verified_sponsor) WHERE is_verified_sponsor = true;
CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_recovery_program ON sponsor_profiles(recovery_program);

-- Step 4: Enable Row Level Security
ALTER TABLE profiles_consolidated ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
-- Profiles consolidated policies
CREATE POLICY "Users can view public profiles" ON profiles_consolidated
    FOR SELECT USING (privacy_level = 'public' OR auth.uid() = user_id);

CREATE POLICY "Users can view their own profile" ON profiles_consolidated
    FOR ALL USING (auth.uid() = user_id);

-- Sponsor profiles policies
CREATE POLICY "Users can view available sponsor profiles" ON sponsor_profiles
    FOR SELECT USING (is_available_sponsor = true);

CREATE POLICY "Users can view their own sponsor profile" ON sponsor_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Step 6: Create function to sync profile_id when sponsor profile is created
CREATE OR REPLACE FUNCTION sync_sponsor_profile_id()
RETURNS TRIGGER AS $$
BEGIN
    -- If profile_id is not set, find the corresponding profile
    IF NEW.profile_id IS NULL THEN
        SELECT id INTO NEW.profile_id 
        FROM profiles_consolidated 
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync profile_id
DROP TRIGGER IF EXISTS sync_sponsor_profile_id_trigger ON sponsor_profiles;
CREATE TRIGGER sync_sponsor_profile_id_trigger
    BEFORE INSERT OR UPDATE ON sponsor_profiles
    FOR EACH ROW EXECUTE FUNCTION sync_sponsor_profile_id();

-- Step 7: Create function to automatically create sponsor profile when user profile is created
CREATE OR REPLACE FUNCTION create_sponsor_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create if user doesn't already have a sponsor profile
    IF NOT EXISTS (SELECT 1 FROM sponsor_profiles WHERE user_id = NEW.user_id) THEN
        INSERT INTO sponsor_profiles (user_id, profile_id, is_available_sponsor)
        VALUES (NEW.user_id, NEW.id, false);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to create sponsor profile when user profile is created
DROP TRIGGER IF EXISTS create_sponsor_profile_trigger ON profiles_consolidated;
CREATE TRIGGER create_sponsor_profile_trigger
    AFTER INSERT ON profiles_consolidated
    FOR EACH ROW EXECUTE FUNCTION create_sponsor_profile();

-- Step 8: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles_consolidated TO anon, authenticated;
GRANT ALL ON sponsor_profiles TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 9: Update existing sponsor profiles to have profile_id
UPDATE sponsor_profiles 
SET profile_id = pc.id
FROM profiles_consolidated pc
WHERE sponsor_profiles.user_id = pc.user_id
AND sponsor_profiles.profile_id IS NULL;

-- Step 10: Verification
SELECT 'Verification - Checking relationships...' as status;

-- Check if foreign key relationship exists
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'sponsor_profiles'
    AND ccu.table_name = 'profiles_consolidated';

-- Check sponsor profiles with profile_id
SELECT 
    COUNT(*) as total_sponsor_profiles,
    COUNT(profile_id) as profiles_with_profile_id,
    COUNT(*) - COUNT(profile_id) as profiles_missing_profile_id
FROM sponsor_profiles;

SELECT '✅ Database relationship fix completed!' as status;
