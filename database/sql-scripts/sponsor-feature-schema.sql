-- Sponsor Feature Database Schema for Sober Spokane
-- This script creates the necessary tables and relationships for the sponsor matching system

-- =====================================================
-- SPONSOR PROFILES TABLE
-- =====================================================

-- Table to store sponsor-specific information
CREATE TABLE IF NOT EXISTS sponsor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
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

-- =====================================================
-- SPONSOR RELATIONSHIPS TABLE
-- =====================================================

-- Table to manage sponsor-sponsee relationships
CREATE TABLE IF NOT EXISTS sponsor_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    sponsee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Relationship details
    relationship_status TEXT DEFAULT 'pending' CHECK (relationship_status IN ('pending', 'active', 'paused', 'ended', 'declined')),
    relationship_type TEXT DEFAULT 'sponsor' CHECK (relationship_type IN ('sponsor', 'mentor', 'accountability_partner')),
    
    -- Relationship timeline
    started_date DATE,
    ended_date DATE,
    last_contact_date DATE,
    
    -- Communication preferences
    contact_frequency TEXT DEFAULT 'weekly' CHECK (contact_frequency IN ('daily', 'weekly', 'bi_weekly', 'monthly', 'as_needed')),
    preferred_contact_method TEXT DEFAULT 'message' CHECK (preferred_contact_method IN ('message', 'email', 'phone', 'in_person')),
    
    -- Relationship notes
    sponsor_notes TEXT,
    sponsee_notes TEXT,
    shared_goals TEXT,
    
    -- Safety and boundaries
    emergency_contact_provided BOOLEAN DEFAULT false,
    boundaries_discussed BOOLEAN DEFAULT false,
    safety_plan_created BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one active sponsor relationship per sponsee
    UNIQUE(sponsee_id, relationship_status) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- SPONSOR REQUESTS TABLE
-- =====================================================

-- Table to manage sponsor requests and applications
CREATE TABLE IF NOT EXISTS sponsor_requests (
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

-- =====================================================
-- SPONSOR REVIEWS TABLE
-- =====================================================

-- Table to store reviews and feedback for sponsors
CREATE TABLE IF NOT EXISTS sponsor_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    relationship_id UUID REFERENCES sponsor_relationships(id) ON DELETE CASCADE,
    
    -- Review details
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    would_recommend BOOLEAN,
    
    -- Review categories
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    support_rating INTEGER CHECK (support_rating >= 1 AND support_rating <= 5),
    availability_rating INTEGER CHECK (availability_rating >= 1 AND availability_rating <= 5),
    knowledge_rating INTEGER CHECK (knowledge_rating >= 1 AND knowledge_rating <= 5),
    
    -- Review status
    is_verified BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one review per relationship
    UNIQUE(reviewer_id, relationship_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Sponsor profiles indexes
CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_user_id ON sponsor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_available ON sponsor_profiles(is_available_sponsor) WHERE is_available_sponsor = true;
CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_verified ON sponsor_profiles(is_verified_sponsor) WHERE is_verified_sponsor = true;
CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_recovery_program ON sponsor_profiles(recovery_program);

-- Sponsor relationships indexes
CREATE INDEX IF NOT EXISTS idx_sponsor_relationships_sponsor ON sponsor_relationships(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_relationships_sponsee ON sponsor_relationships(sponsee_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_relationships_status ON sponsor_relationships(relationship_status);
CREATE INDEX IF NOT EXISTS idx_sponsor_relationships_active ON sponsor_relationships(sponsee_id, relationship_status) WHERE relationship_status = 'active';

-- Sponsor requests indexes
CREATE INDEX IF NOT EXISTS idx_sponsor_requests_requester ON sponsor_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_requests_sponsor ON sponsor_requests(requested_sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_requests_status ON sponsor_requests(request_status);
CREATE INDEX IF NOT EXISTS idx_sponsor_requests_type ON sponsor_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_sponsor_requests_expires ON sponsor_requests(expires_at);

-- Sponsor reviews indexes
CREATE INDEX IF NOT EXISTS idx_sponsor_reviews_sponsor ON sponsor_reviews(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_reviews_reviewer ON sponsor_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_reviews_rating ON sponsor_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_sponsor_reviews_public ON sponsor_reviews(is_public) WHERE is_public = true;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE sponsor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_reviews ENABLE ROW LEVEL SECURITY;

-- Sponsor profiles policies
CREATE POLICY "Users can view available sponsor profiles" ON sponsor_profiles
    FOR SELECT USING (is_available_sponsor = true);

CREATE POLICY "Users can view their own sponsor profile" ON sponsor_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Sponsor relationships policies
CREATE POLICY "Users can view their own relationships" ON sponsor_relationships
    FOR SELECT USING (auth.uid() = sponsor_id OR auth.uid() = sponsee_id);

CREATE POLICY "Users can create relationships where they are sponsor or sponsee" ON sponsor_relationships
    FOR INSERT WITH CHECK (auth.uid() = sponsor_id OR auth.uid() = sponsee_id);

CREATE POLICY "Users can update their own relationships" ON sponsor_relationships
    FOR UPDATE USING (auth.uid() = sponsor_id OR auth.uid() = sponsee_id);

-- Sponsor requests policies
CREATE POLICY "Users can view their own requests" ON sponsor_requests
    FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = requested_sponsor_id);

CREATE POLICY "Users can create their own requests" ON sponsor_requests
    FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their own requests" ON sponsor_requests
    FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = requested_sponsor_id);

-- Sponsor reviews policies
CREATE POLICY "Users can view public reviews" ON sponsor_reviews
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own reviews" ON sponsor_reviews
    FOR SELECT USING (auth.uid() = reviewer_id OR auth.uid() = sponsor_id);

CREATE POLICY "Users can create reviews for their relationships" ON sponsor_reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews" ON sponsor_reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_sponsor_profiles_updated_at BEFORE UPDATE ON sponsor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsor_relationships_updated_at BEFORE UPDATE ON sponsor_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsor_requests_updated_at BEFORE UPDATE ON sponsor_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsor_reviews_updated_at BEFORE UPDATE ON sponsor_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create sponsor profile when user becomes available
CREATE OR REPLACE FUNCTION create_sponsor_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create if user doesn't already have a sponsor profile
    IF NOT EXISTS (SELECT 1 FROM sponsor_profiles WHERE user_id = NEW.user_id) THEN
        INSERT INTO sponsor_profiles (user_id, is_available_sponsor)
        VALUES (NEW.user_id, false);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create sponsor profile when user profile is created
CREATE TRIGGER create_sponsor_profile_trigger
    AFTER INSERT ON profiles_consolidated
    FOR EACH ROW EXECUTE FUNCTION create_sponsor_profile();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON sponsor_profiles TO anon, authenticated;
GRANT ALL ON sponsor_relationships TO anon, authenticated;
GRANT ALL ON sponsor_requests TO anon, authenticated;
GRANT ALL ON sponsor_reviews TO anon, authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Uncomment the following section to add sample data for testing

/*
-- Sample sponsor profiles
INSERT INTO sponsor_profiles (user_id, is_available_sponsor, years_sober, recovery_program, sponsor_bio, is_verified_sponsor)
VALUES 
    ('00000000-0000-0000-0000-000000000001', true, 5, 'AA', 'I have been sober for 5 years and have helped many people in their recovery journey. I believe in the power of community and mutual support.', true),
    ('00000000-0000-0000-0000-000000000002', true, 3, 'NA', 'Three years clean and committed to helping others. I specialize in early recovery and relapse prevention.', true);

-- Sample sponsor requests
INSERT INTO sponsor_requests (requester_id, request_type, sobriety_date, recovery_program, current_challenges, what_you_need)
VALUES 
    ('00000000-0000-0000-0000-000000000003', 'find_sponsor', '2024-01-01', 'AA', 'Early recovery, dealing with cravings', 'Need someone to check in with daily and help me work the steps');
*/
