-- REPAIR SCRIPT: Fix missing columns in sponsor_profiles
-- Run this in your Supabase SQL Editor to ensure all required columns exist.

DO $$ 
BEGIN
    -- Add is_verified_sponsor if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sponsor_profiles' AND column_name='is_verified_sponsor') THEN
        ALTER TABLE sponsor_profiles ADD COLUMN is_verified_sponsor BOOLEAN DEFAULT false;
    END IF;

    -- Add is_available_sponsor if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sponsor_profiles' AND column_name='is_available_sponsor') THEN
        ALTER TABLE sponsor_profiles ADD COLUMN is_available_sponsor BOOLEAN DEFAULT false;
    END IF;

    -- Add years_sober if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sponsor_profiles' AND column_name='years_sober') THEN
        ALTER TABLE sponsor_profiles ADD COLUMN years_sober INTEGER;
    END IF;

    -- Add recovery_program if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sponsor_profiles' AND column_name='recovery_program') THEN
        ALTER TABLE sponsor_profiles ADD COLUMN recovery_program TEXT;
    END IF;

    -- Add sponsor_bio if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sponsor_profiles' AND column_name='sponsor_bio') THEN
        ALTER TABLE sponsor_profiles ADD COLUMN sponsor_bio TEXT;
    END IF;

    -- Add what_you_offer if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sponsor_profiles' AND column_name='what_you_offer') THEN
        ALTER TABLE sponsor_profiles ADD COLUMN what_you_offer TEXT;
    END IF;
END $$;

-- After running this, try approving the request again in the Table Editor.
