-- Step 2: Add last_active column to profiles_consolidated table
-- Run this after Step 1

-- Add the missing last_active column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles_consolidated' AND column_name = 'last_active'
    ) THEN
        RAISE NOTICE 'Adding last_active column to profiles_consolidated table...';
        ALTER TABLE profiles_consolidated ADD COLUMN last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        CREATE INDEX idx_profiles_consolidated_last_active ON profiles_consolidated(last_active);
        RAISE NOTICE 'last_active column added successfully to profiles_consolidated';
    ELSE
        RAISE NOTICE 'last_active column already exists in profiles_consolidated';
    END IF;
END $$;

-- Verify the column was added
SELECT 'Verification - last_active column added:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles_consolidated' AND column_name = 'last_active';
