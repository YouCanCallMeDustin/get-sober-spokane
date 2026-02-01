-- Quick Fix for Sponsor Requests Table
-- This script adds the missing columns that are causing the form submission error

-- Add missing columns to sponsor_requests table
ALTER TABLE sponsor_requests 
ADD COLUMN IF NOT EXISTS availability_notes TEXT,
ADD COLUMN IF NOT EXISTS sponsor_experience TEXT,
ADD COLUMN IF NOT EXISTS support_offer TEXT;

-- Verify the columns were added
SELECT 'Updated sponsor_requests table structure:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'sponsor_requests'
ORDER BY ordinal_position;
