-- Update Sponsor Requests Table
-- Add new columns for sponsor-specific questions

-- Add new columns
ALTER TABLE sponsor_requests 
ADD COLUMN IF NOT EXISTS sponsor_experience TEXT,
ADD COLUMN IF NOT EXISTS support_offer TEXT;

-- Drop old columns if they exist
ALTER TABLE sponsor_requests 
DROP COLUMN IF EXISTS current_challenges,
DROP COLUMN IF EXISTS what_you_need;

-- Update any existing records to have default values
UPDATE sponsor_requests 
SET sponsor_experience = 'No experience specified',
    support_offer = 'No support details specified'
WHERE sponsor_experience IS NULL OR support_offer IS NULL;
