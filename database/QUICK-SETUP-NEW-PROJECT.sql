-- =====================================================
-- QUICK SETUP SCRIPT FOR NEW SUPABASE PROJECT
-- =====================================================
-- This script sets up all the essential tables for Sober Spokane
-- Run this in your new Supabase project's SQL Editor
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE (Consolidated)
-- =====================================================
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

-- Create indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_consolidated_user_id ON profiles_consolidated(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_consolidated_sobriety_date ON profiles_consolidated(sobriety_date);

-- Enable RLS on profiles
ALTER TABLE profiles_consolidated ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles_consolidated;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles_consolidated;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles_consolidated;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles_consolidated;

CREATE POLICY "Users can view own profile" ON profiles_consolidated
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own profile" ON profiles_consolidated
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own profile" ON profiles_consolidated
    FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own profile" ON profiles_consolidated
    FOR DELETE USING ((select auth.uid()) = user_id);

-- =====================================================
-- 2. FORUM TABLES
-- =====================================================

-- Forum posts table
CREATE TABLE IF NOT EXISTS forum_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General Discussion',
    tags TEXT[] DEFAULT '{}',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_anonymous BOOLEAN DEFAULT false,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum comments table
CREATE TABLE IF NOT EXISTS forum_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum user profiles table
CREATE TABLE IF NOT EXISTS forum_user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    sobriety_date DATE,
    bio TEXT,
    location TEXT DEFAULT 'Spokane, WA',
    privacy_level TEXT DEFAULT 'public',
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for forum tables
CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_forum_comments_post_id ON forum_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_user_id ON forum_comments(user_id);

-- Enable RLS on forum tables
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_posts
DROP POLICY IF EXISTS "Users can view all public posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can create posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON forum_posts;

CREATE POLICY "Users can view all public posts" ON forum_posts
    FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON forum_posts
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id OR is_anonymous = true);

CREATE POLICY "Users can update their own posts" ON forum_posts
    FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own posts" ON forum_posts
    FOR DELETE USING ((select auth.uid()) = user_id);

-- RLS Policies for forum_comments
DROP POLICY IF EXISTS "Users can view all comments" ON forum_comments;
DROP POLICY IF EXISTS "Users can create comments" ON forum_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON forum_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON forum_comments;

CREATE POLICY "Users can view all comments" ON forum_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON forum_comments
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own comments" ON forum_comments
    FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own comments" ON forum_comments
    FOR DELETE USING ((select auth.uid()) = user_id);

-- RLS Policies for forum_user_profiles
DROP POLICY IF EXISTS "Users can view public profiles" ON forum_user_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON forum_user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON forum_user_profiles;

CREATE POLICY "Users can view public profiles" ON forum_user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own profile" ON forum_user_profiles
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own profile" ON forum_user_profiles
    FOR UPDATE USING ((select auth.uid()) = user_id);

-- =====================================================
-- 3. CHAT TABLES
-- =====================================================

-- Chat rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    max_users INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    room TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- User presence table
CREATE TABLE IF NOT EXISTS user_presence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    room TEXT NOT NULL,
    username TEXT NOT NULL,
    status TEXT DEFAULT 'online' CHECK (status IN ('online', 'away', 'offline')),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    socket_id TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, room)
);

-- Create indexes for chat tables
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_room ON user_presence(room);
CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON user_presence(user_id);

-- Enable RLS on chat tables
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages (allow all authenticated users to read/write)
DROP POLICY IF EXISTS "Authenticated users can read messages" ON messages;
DROP POLICY IF EXISTS "Authenticated users can write messages" ON messages;

CREATE POLICY "Authenticated users can read messages" ON messages
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can write messages" ON messages
    FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for user_presence
DROP POLICY IF EXISTS "Users can manage own presence" ON user_presence;

CREATE POLICY "Users can manage own presence" ON user_presence
    FOR ALL USING ((select auth.uid()) = user_id);

-- =====================================================
-- 4. SPONSOR TABLES (Basic Setup)
-- =====================================================

-- Sponsor profiles table
CREATE TABLE IF NOT EXISTS sponsor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    is_available_sponsor BOOLEAN DEFAULT false,
    max_sponsees INTEGER DEFAULT 3 CHECK (max_sponsees >= 1 AND max_sponsees <= 10),
    years_sober INTEGER,
    recovery_program TEXT,
    availability_notes TEXT,
    sponsor_bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sponsor requests table
CREATE TABLE IF NOT EXISTS sponsor_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    requested_sponsor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    request_type TEXT DEFAULT 'find_sponsor' CHECK (request_type IN ('find_sponsor', 'request_specific_sponsor', 'become_sponsor')),
    request_status TEXT DEFAULT 'pending' CHECK (request_status IN ('pending', 'approved', 'declined', 'expired', 'cancelled')),
    sobriety_date DATE,
    recovery_program TEXT,
    current_challenges TEXT,
    what_you_need TEXT,
    availability_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for sponsor tables
CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_user_id ON sponsor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_available ON sponsor_profiles(is_available_sponsor) WHERE is_available_sponsor = true;
CREATE INDEX IF NOT EXISTS idx_sponsor_requests_requester ON sponsor_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_requests_status ON sponsor_requests(request_status);

-- Enable RLS on sponsor tables
ALTER TABLE sponsor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sponsor_profiles
DROP POLICY IF EXISTS "Users can view available sponsor profiles" ON sponsor_profiles;
DROP POLICY IF EXISTS "Users can manage their own sponsor profile" ON sponsor_profiles;

CREATE POLICY "Users can view available sponsor profiles" ON sponsor_profiles
    FOR SELECT USING (is_available_sponsor = true);

CREATE POLICY "Users can manage their own sponsor profile" ON sponsor_profiles
    FOR ALL USING ((select auth.uid()) = user_id);

-- RLS Policies for sponsor_requests
DROP POLICY IF EXISTS "Users can view their own requests" ON sponsor_requests;
DROP POLICY IF EXISTS "Users can create their own requests" ON sponsor_requests;
DROP POLICY IF EXISTS "Users can update their own requests" ON sponsor_requests;

CREATE POLICY "Users can view their own requests" ON sponsor_requests
    FOR SELECT USING ((select auth.uid()) = requester_id OR (select auth.uid()) = requested_sponsor_id);

CREATE POLICY "Users can create their own requests" ON sponsor_requests
    FOR INSERT WITH CHECK ((select auth.uid()) = requester_id);

CREATE POLICY "Users can update their own requests" ON sponsor_requests
    FOR UPDATE USING ((select auth.uid()) = requester_id OR (select auth.uid()) = requested_sponsor_id);

-- =====================================================
-- 5. RECOVERY MILESTONES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS recovery_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recovery_milestones_user_id ON recovery_milestones(user_id);

ALTER TABLE recovery_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own milestones" ON recovery_milestones;
DROP POLICY IF EXISTS "Users can insert own milestones" ON recovery_milestones;
DROP POLICY IF EXISTS "Users can update own milestones" ON recovery_milestones;
DROP POLICY IF EXISTS "Users can delete own milestones" ON recovery_milestones;

CREATE POLICY "Users can view own milestones" ON recovery_milestones
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own milestones" ON recovery_milestones
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own milestones" ON recovery_milestones
    FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own milestones" ON recovery_milestones
    FOR DELETE USING ((select auth.uid()) = user_id);

-- =====================================================
-- 6. TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
DROP TRIGGER IF EXISTS update_profiles_consolidated_updated_at ON profiles_consolidated;
CREATE TRIGGER update_profiles_consolidated_updated_at BEFORE UPDATE ON profiles_consolidated
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_forum_posts_updated_at ON forum_posts;
CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_forum_comments_updated_at ON forum_comments;
CREATE TRIGGER update_forum_comments_updated_at BEFORE UPDATE ON forum_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sponsor_profiles_updated_at ON sponsor_profiles;
CREATE TRIGGER update_sponsor_profiles_updated_at BEFORE UPDATE ON sponsor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sponsor_requests_updated_at ON sponsor_requests;
CREATE TRIGGER update_sponsor_requests_updated_at BEFORE UPDATE ON sponsor_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recovery_milestones_updated_at ON recovery_milestones;
CREATE TRIGGER update_recovery_milestones_updated_at BEFORE UPDATE ON recovery_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles_consolidated TO anon, authenticated;
GRANT ALL ON forum_posts TO anon, authenticated;
GRANT ALL ON forum_comments TO anon, authenticated;
GRANT ALL ON forum_user_profiles TO anon, authenticated;
GRANT ALL ON messages TO anon, authenticated;
GRANT ALL ON user_presence TO anon, authenticated;
GRANT ALL ON sponsor_profiles TO anon, authenticated;
GRANT ALL ON sponsor_requests TO anon, authenticated;
GRANT ALL ON recovery_milestones TO anon, authenticated;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Database setup complete!';
    RAISE NOTICE 'All tables, indexes, RLS policies, and triggers have been created.';
    RAISE NOTICE 'Your Sober Spokane application is ready to use!';
END $$;
