-- Migration: Add profile_id column to sponsor_profiles table
-- This script adds the missing profile_id column and establishes the proper relationship

-- Step 1: Check current structure of sponsor_profiles table
SELECT 'Checking current sponsor_profiles table structure...' as status;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'sponsor_profiles'
ORDER BY ordinal_position;

-- Step 2: Add the profile_id column to sponsor_profiles table
ALTER TABLE sponsor_profiles 
ADD COLUMN IF NOT EXISTS profile_id UUID;

-- Step 3: Create the foreign key relationship
-- First, let's check if the foreign key already exists
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

-- Add the foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY' 
        AND table_name = 'sponsor_profiles' 
        AND constraint_name LIKE '%profile_id%'
    ) THEN
        ALTER TABLE sponsor_profiles 
        ADD CONSTRAINT fk_sponsor_profiles_profile_id 
        FOREIGN KEY (profile_id) REFERENCES profiles_consolidated(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint for profile_id';
    ELSE
        RAISE NOTICE 'Foreign key constraint for profile_id already exists';
    END IF;
END $$;

-- Step 4: Populate the profile_id column for existing records
UPDATE sponsor_profiles 
SET profile_id = pc.id
FROM profiles_consolidated pc
WHERE sponsor_profiles.user_id = pc.user_id
AND sponsor_profiles.profile_id IS NULL;

-- Step 5: Create index on profile_id for performance
CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_profile_id ON sponsor_profiles(profile_id);

-- Step 6: Create or replace the sync function
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

-- Step 7: Create or replace the trigger
DROP TRIGGER IF EXISTS sync_sponsor_profile_id_trigger ON sponsor_profiles;
CREATE TRIGGER sync_sponsor_profile_id_trigger
    BEFORE INSERT OR UPDATE ON sponsor_profiles
    FOR EACH ROW EXECUTE FUNCTION sync_sponsor_profile_id();

-- Step 8: Verification
SELECT 'Verification - Checking migration results...' as status;

-- Check if profile_id column exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'sponsor_profiles' AND column_name = 'profile_id'
        ) 
        THEN '✅ profile_id column exists'
        ELSE '❌ profile_id column missing'
    END as profile_id_status;

-- Check if foreign key relationship exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_type = 'FOREIGN KEY' 
            AND table_name = 'sponsor_profiles' 
            AND constraint_name LIKE '%profile_id%'
        ) 
        THEN '✅ Foreign key relationship exists'
        ELSE '❌ Foreign key relationship missing'
    END as foreign_key_status;

-- Check how many sponsor profiles have profile_id populated
SELECT 
    COUNT(*) as total_sponsor_profiles,
    COUNT(profile_id) as profiles_with_profile_id,
    COUNT(*) - COUNT(profile_id) as profiles_missing_profile_id
FROM sponsor_profiles;

-- Show the foreign key relationship details
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

SELECT '✅ Migration completed successfully!' as status;
