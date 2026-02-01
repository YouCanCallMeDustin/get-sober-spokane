-- Fix Missing availability_notes Column in sponsor_requests Table
-- Run this in your Supabase SQL Editor to add the missing column

-- First, check if the table exists
DO $$
BEGIN
    -- Check if sponsor_requests table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sponsor_requests') THEN
        RAISE NOTICE 'sponsor_requests table does not exist. Creating it...';
        
        -- Create the complete sponsor_requests table
        CREATE TABLE sponsor_requests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            requested_sponsor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            
            -- Request details
            request_type TEXT DEFAULT 'find_sponsor' CHECK (request_type IN ('find_sponsor', 'request_specific_sponsor', 'become_sponsor')),
            request_status TEXT DEFAULT 'pending' CHECK (request_status IN ('pending', 'approved', 'declined', 'expired', 'cancelled')),
            
            -- Request information
            sobriety_date DATE,
            recovery_program TEXT,
            current_challenges TEXT,
            what_you_need TEXT,
            what_you_offer TEXT, -- for those wanting to become sponsors
            preferred_sponsor_qualities TEXT,
            
            -- Contact and availability
            preferred_contact_method TEXT DEFAULT 'message',
            availability_notes TEXT,
            timezone TEXT DEFAULT 'America/Los_Angeles',
            
            -- Location preferences
            meeting_preferences TEXT[] DEFAULT '{}',
            max_distance_miles INTEGER DEFAULT 25,
            
            -- Request timeline
            expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
            responded_at TIMESTAMP WITH TIME ZONE,
            response_notes TEXT,
            
            -- Timestamps
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'sponsor_requests table created successfully.';
    ELSE
        RAISE NOTICE 'sponsor_requests table exists. Checking for missing columns...';
        
        -- Check if availability_notes column exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'sponsor_requests' 
            AND column_name = 'availability_notes'
        ) THEN
            RAISE NOTICE 'availability_notes column is missing. Adding it...';
            ALTER TABLE sponsor_requests ADD COLUMN availability_notes TEXT;
            RAISE NOTICE 'availability_notes column added successfully.';
        ELSE
            RAISE NOTICE 'availability_notes column already exists.';
        END IF;
        
        -- Check for other potentially missing columns from the schema
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'sponsor_requests' 
            AND column_name = 'sponsor_experience'
        ) THEN
            RAISE NOTICE 'sponsor_experience column is missing. Adding it...';
            ALTER TABLE sponsor_requests ADD COLUMN sponsor_experience TEXT;
            RAISE NOTICE 'sponsor_experience column added successfully.';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'sponsor_requests' 
            AND column_name = 'support_offer'
        ) THEN
            RAISE NOTICE 'support_offer column is missing. Adding it...';
            ALTER TABLE sponsor_requests ADD COLUMN support_offer TEXT;
            RAISE NOTICE 'support_offer column added successfully.';
        END IF;
    END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE sponsor_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$
BEGIN
    -- Check if policies exist and create them if they don't
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sponsor_requests' 
        AND policyname = 'Users can view their own requests'
    ) THEN
        CREATE POLICY "Users can view their own requests" ON sponsor_requests
            FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = requested_sponsor_id);
        RAISE NOTICE 'Created policy: Users can view their own requests';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sponsor_requests' 
        AND policyname = 'Users can create their own requests'
    ) THEN
        CREATE POLICY "Users can create their own requests" ON sponsor_requests
            FOR INSERT WITH CHECK (auth.uid() = requester_id);
        RAISE NOTICE 'Created policy: Users can create their own requests';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sponsor_requests' 
        AND policyname = 'Users can update their own requests'
    ) THEN
        CREATE POLICY "Users can update their own requests" ON sponsor_requests
            FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = requested_sponsor_id);
        RAISE NOTICE 'Created policy: Users can update their own requests';
    END IF;
END $$;

-- Grant permissions
GRANT ALL ON sponsor_requests TO anon, authenticated;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_sponsor_requests_requester ON sponsor_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_requests_sponsor ON sponsor_requests(requested_sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_requests_status ON sponsor_requests(request_status);
CREATE INDEX IF NOT EXISTS idx_sponsor_requests_type ON sponsor_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_sponsor_requests_expires ON sponsor_requests(expires_at);

-- Create trigger for updated_at if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_sponsor_requests_updated_at'
    ) THEN
        CREATE TRIGGER update_sponsor_requests_updated_at 
            BEFORE UPDATE ON sponsor_requests
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created trigger: update_sponsor_requests_updated_at';
    END IF;
END $$;

-- Final verification
SELECT 'Final table structure verification:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'sponsor_requests'
ORDER BY ordinal_position;
