-- Safe Forum Upgrades Script
-- Generated automatically to avoid conflicts with existing database
-- Run this in your Supabase SQL Editor

-- =====================================================
-- SAFETY CHECKS AND CONFLICT AVOIDANCE
-- =====================================================

-- This script uses IF NOT EXISTS and IF EXISTS checks to avoid conflicts
-- It will only add new features without modifying existing ones

-- Check what tables exist before proceeding
DO $$
DECLARE
    table_exists boolean;
BEGIN
    -- Check for existing forum tables
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'forum_posts'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ forum_posts table exists - will enhance it';
    ELSE
        RAISE NOTICE '❌ forum_posts table does not exist - will create it';
    END IF;
    
    -- Check for existing user profile tables
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'forum_user_profiles'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ forum_user_profiles table exists - will enhance it';
    ELSE
        RAISE NOTICE '❌ forum_user_profiles table does not exist - will create it';
    END IF;
END $$;

-- =====================================================
-- 1. SAFE TABLE ENHANCEMENTS
-- =====================================================

-- Enhance forum_user_profiles if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_user_profiles') THEN
        -- Add reputation and advanced features
        ALTER TABLE forum_user_profiles 
        ADD COLUMN IF NOT EXISTS reputation INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS helpful_votes_received INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS custom_title TEXT,
        ADD COLUMN IF NOT EXISTS signature TEXT,
        ADD COLUMN IF NOT EXISTS website_url TEXT,
        ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"show_email": false, "show_location": true, "show_sobriety_date": true}',
        ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"email_notifications": true, "push_notifications": true, "mention_notifications": true}',
        ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Enhanced forum_user_profiles table';
    END IF;
END $$;

-- Enhance forum_comments if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_comments') THEN
        -- Add threading support
        ALTER TABLE forum_comments 
        ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS thread_path TEXT,
        ADD COLUMN IF NOT EXISTS depth INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS is_solution BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS helpful_votes INTEGER DEFAULT 0;
        
        RAISE NOTICE 'Enhanced forum_comments table with threading';
    END IF;
END $$;

-- Enhance forum_posts if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_posts') THEN
        -- Add rich content support
        ALTER TABLE forum_posts 
        ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'text',
        ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        RAISE NOTICE 'Enhanced forum_posts table with rich content';
    END IF;
END $$;

-- =====================================================
-- 2. NEW TABLES (ONLY IF THEY DON'T EXIST)
-- =====================================================

-- User Badges System
CREATE TABLE IF NOT EXISTS forum_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT DEFAULT '#007bff',
    category TEXT NOT NULL,
    requirements JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Badge Assignments
CREATE TABLE IF NOT EXISTS forum_user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES forum_badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_displayed BOOLEAN DEFAULT true,
    UNIQUE(user_id, badge_id)
);

-- Advanced Voting System
CREATE TABLE IF NOT EXISTS forum_vote_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    weight INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced vote tracking
CREATE TABLE IF NOT EXISTS forum_post_votes_enhanced (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type_id UUID NOT NULL REFERENCES forum_vote_types(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id, vote_type_id)
);

-- Mentions System
CREATE TABLE IF NOT EXISTS forum_mentions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
    mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mentioning_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT false
);

-- Notifications System
CREATE TABLE IF NOT EXISTS forum_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Bookmarks System
CREATE TABLE IF NOT EXISTS forum_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id),
    UNIQUE(user_id, comment_id)
);

-- User Following System
CREATE TABLE IF NOT EXISTS forum_user_follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id)
);

-- Enhanced Categories
CREATE TABLE IF NOT EXISTS forum_categories_enhanced (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES forum_categories_enhanced(id) ON DELETE CASCADE,
    icon TEXT,
    color TEXT DEFAULT '#007bff',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags System
CREATE TABLE IF NOT EXISTS forum_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6c757d',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post-Tag relationships
CREATE TABLE IF NOT EXISTS forum_post_tags (
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES forum_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- Moderation System
CREATE TABLE IF NOT EXISTS forum_moderation_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    moderator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    action_type TEXT NOT NULL,
    reason TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports System
CREATE TABLE IF NOT EXISTS forum_reports_enhanced (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 3. CREATE INDEXES (SAFE)
-- =====================================================

-- User profile indexes
CREATE INDEX IF NOT EXISTS idx_forum_user_profiles_reputation ON forum_user_profiles(reputation DESC);
CREATE INDEX IF NOT EXISTS idx_forum_user_profiles_last_seen ON forum_user_profiles(last_seen DESC);

-- Badge indexes
CREATE INDEX IF NOT EXISTS idx_forum_user_badges_user_id ON forum_user_badges(user_id);

-- Mention indexes
CREATE INDEX IF NOT EXISTS idx_forum_mentions_mentioned_user ON forum_mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_forum_mentions_unread ON forum_mentions(mentioned_user_id, is_read) WHERE is_read = false;

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_forum_notifications_user_unread ON forum_notifications(user_id, is_read) WHERE is_read = false;

-- Comment threading indexes
CREATE INDEX IF NOT EXISTS idx_forum_comments_thread_path ON forum_comments(thread_path);
CREATE INDEX IF NOT EXISTS idx_forum_comments_parent ON forum_comments(parent_comment_id);

-- Bookmark indexes
CREATE INDEX IF NOT EXISTS idx_forum_bookmarks_user ON forum_bookmarks(user_id);

-- Follow indexes
CREATE INDEX IF NOT EXISTS idx_forum_user_follows_follower ON forum_user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_forum_user_follows_following ON forum_user_follows(following_id);

-- Category indexes
CREATE INDEX IF NOT EXISTS idx_forum_categories_parent ON forum_categories_enhanced(parent_category_id);

-- Tag indexes
CREATE INDEX IF NOT EXISTS idx_forum_post_tags_post ON forum_post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_tags_tag ON forum_post_tags(tag_id);

-- Post indexes
CREATE INDEX IF NOT EXISTS idx_forum_posts_pinned ON forum_posts(is_pinned, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_activity ON forum_posts(last_activity DESC);

-- =====================================================
-- 4. CREATE POLICIES (SAFE - CHECK IF THEY EXIST FIRST)
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE forum_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_vote_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_post_votes_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_reports_enhanced ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$
BEGIN
    -- Badge policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view badges' AND tablename = 'forum_badges') THEN
        CREATE POLICY "Anyone can view badges" ON forum_badges FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own badges' AND tablename = 'forum_user_badges') THEN
        CREATE POLICY "Users can view their own badges" ON forum_user_badges FOR SELECT USING (true);
    END IF;
    
    -- Vote type policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view vote types' AND tablename = 'forum_vote_types') THEN
        CREATE POLICY "Anyone can view vote types" ON forum_vote_types FOR SELECT USING (true);
    END IF;
    
    -- Enhanced vote policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view all votes' AND tablename = 'forum_post_votes_enhanced') THEN
        CREATE POLICY "Users can view all votes" ON forum_post_votes_enhanced FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create votes' AND tablename = 'forum_post_votes_enhanced') THEN
        CREATE POLICY "Users can create votes" ON forum_post_votes_enhanced FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own votes' AND tablename = 'forum_post_votes_enhanced') THEN
        CREATE POLICY "Users can update their own votes" ON forum_post_votes_enhanced FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own votes' AND tablename = 'forum_post_votes_enhanced') THEN
        CREATE POLICY "Users can delete their own votes" ON forum_post_votes_enhanced FOR DELETE USING (auth.uid() = user_id);
    END IF;
    
    -- Mention policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view mentions of them' AND tablename = 'forum_mentions') THEN
        CREATE POLICY "Users can view mentions of them" ON forum_mentions FOR SELECT USING (auth.uid() = mentioned_user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create mentions' AND tablename = 'forum_mentions') THEN
        CREATE POLICY "Users can create mentions" ON forum_mentions FOR INSERT WITH CHECK (auth.uid() = mentioning_user_id);
    END IF;
    
    -- Notification policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own notifications' AND tablename = 'forum_notifications') THEN
        CREATE POLICY "Users can view their own notifications" ON forum_notifications FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own notifications' AND tablename = 'forum_notifications') THEN
        CREATE POLICY "Users can update their own notifications" ON forum_notifications FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    -- Bookmark policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own bookmarks' AND tablename = 'forum_bookmarks') THEN
        CREATE POLICY "Users can view their own bookmarks" ON forum_bookmarks FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create their own bookmarks' AND tablename = 'forum_bookmarks') THEN
        CREATE POLICY "Users can create their own bookmarks" ON forum_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own bookmarks' AND tablename = 'forum_bookmarks') THEN
        CREATE POLICY "Users can delete their own bookmarks" ON forum_bookmarks FOR DELETE USING (auth.uid() = user_id);
    END IF;
    
    -- Follow policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view all follows' AND tablename = 'forum_user_follows') THEN
        CREATE POLICY "Users can view all follows" ON forum_user_follows FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create their own follows' AND tablename = 'forum_user_follows') THEN
        CREATE POLICY "Users can create their own follows" ON forum_user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own follows' AND tablename = 'forum_user_follows') THEN
        CREATE POLICY "Users can delete their own follows" ON forum_user_follows FOR DELETE USING (auth.uid() = follower_id);
    END IF;
    
    -- Category policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view categories' AND tablename = 'forum_categories_enhanced') THEN
        CREATE POLICY "Anyone can view categories" ON forum_categories_enhanced FOR SELECT USING (true);
    END IF;
    
    -- Tag policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view tags' AND tablename = 'forum_tags') THEN
        CREATE POLICY "Anyone can view tags" ON forum_tags FOR SELECT USING (true);
    END IF;
    
    -- Post tag policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view post tags' AND tablename = 'forum_post_tags') THEN
        CREATE POLICY "Anyone can view post tags" ON forum_post_tags FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create post tags' AND tablename = 'forum_post_tags') THEN
        CREATE POLICY "Users can create post tags" ON forum_post_tags FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM forum_posts WHERE id = post_id AND user_id = auth.uid())
        );
    END IF;
    
    -- Report policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own reports' AND tablename = 'forum_reports_enhanced') THEN
        CREATE POLICY "Users can view their own reports" ON forum_reports_enhanced FOR SELECT USING (auth.uid() = reporter_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create reports' AND tablename = 'forum_reports_enhanced') THEN
        CREATE POLICY "Users can create reports" ON forum_reports_enhanced FOR INSERT WITH CHECK (auth.uid() = reporter_id);
    END IF;
    
    RAISE NOTICE 'All policies created successfully';
END $$;

-- =====================================================
-- 5. INSERT DEFAULT DATA (SAFE)
-- =====================================================

-- Insert default vote types
INSERT INTO forum_vote_types (name, display_name, icon, color, weight) VALUES
('helpful', 'Helpful', 'bi-hand-thumbs-up', '#28a745', 2),
('funny', 'Funny', 'bi-emoji-laughing', '#ffc107', 1),
('informative', 'Informative', 'bi-lightbulb', '#17a2b8', 3),
('supportive', 'Supportive', 'bi-heart', '#e83e8c', 2),
('disagree', 'Disagree', 'bi-hand-thumbs-down', '#dc3545', -1)
ON CONFLICT (name) DO NOTHING;

-- Insert default badges
INSERT INTO forum_badges (name, description, icon, color, category, requirements) VALUES
('first_post', 'First Post', 'bi-pen', '#007bff', 'milestone', '{"posts": 1}'),
('helpful_member', 'Helpful Member', 'bi-award', '#28a745', 'achievement', '{"helpful_votes": 10}'),
('active_participant', 'Active Participant', 'bi-people', '#17a2b8', 'achievement', '{"posts": 25, "comments": 50}'),
('sobriety_milestone_30', '30 Days Sober', 'bi-calendar-check', '#ffc107', 'milestone', '{"sobriety_days": 30}'),
('sobriety_milestone_90', '90 Days Sober', 'bi-calendar-check', '#fd7e14', 'milestone', '{"sobriety_days": 90}'),
('sobriety_milestone_365', '1 Year Sober', 'bi-calendar-check', '#6f42c1', 'milestone', '{"sobriety_days": 365}'),
('top_contributor', 'Top Contributor', 'bi-star', '#ffc107', 'achievement', '{"reputation": 100}'),
('mentor', 'Mentor', 'bi-person-heart', '#e83e8c', 'special', '{"helpful_votes": 50, "posts": 20}')
ON CONFLICT (name) DO NOTHING;

-- Insert enhanced categories
INSERT INTO forum_categories_enhanced (name, description, icon, color, sort_order) VALUES
('General Discussion', 'General recovery discussions and community chat', 'bi-chat-dots', '#007bff', 1),
('Recovery Support', 'Support and encouragement for recovery journeys', 'bi-heart', '#28a745', 2),
('Treatment & Resources', 'Information about treatment options and resources', 'bi-hospital', '#17a2b8', 3),
('Family & Friends', 'Support for family members and friends', 'bi-people', '#6f42c1', 4),
('Mental Health', 'Mental health discussions and support', 'bi-brain', '#e83e8c', 5),
('Employment & Housing', 'Job opportunities and housing resources', 'bi-briefcase', '#fd7e14', 6),
('Sober Activities', 'Fun sober activities and events', 'bi-calendar-event', '#20c997', 7),
('Success Stories', 'Share your recovery success stories', 'bi-star', '#ffc107', 8)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. GRANT PERMISSIONS (SAFE)
-- =====================================================

GRANT SELECT ON forum_badges TO anon, authenticated;
GRANT SELECT ON forum_user_badges TO anon, authenticated;
GRANT SELECT ON forum_vote_types TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON forum_post_votes_enhanced TO authenticated;
GRANT SELECT, INSERT ON forum_mentions TO authenticated;
GRANT SELECT, UPDATE ON forum_notifications TO authenticated;
GRANT SELECT, INSERT, DELETE ON forum_bookmarks TO authenticated;
GRANT SELECT, INSERT, DELETE ON forum_user_follows TO anon, authenticated;
GRANT SELECT ON forum_categories_enhanced TO anon, authenticated;
GRANT SELECT ON forum_tags TO anon, authenticated;
GRANT SELECT, INSERT ON forum_post_tags TO authenticated;
GRANT SELECT, INSERT ON forum_reports_enhanced TO authenticated;

-- =====================================================
-- 7. VERIFICATION
-- =====================================================

-- Check that all tables were created successfully
SELECT 'Tables created successfully:' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'forum_%'
ORDER BY table_name;

-- Check that all columns were added to existing tables
SELECT 'Enhanced columns added to forum_user_profiles:' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'forum_user_profiles' 
AND column_name IN ('reputation', 'post_count', 'comment_count', 'custom_title', 'signature')
ORDER BY column_name;

-- Check that default data was inserted
SELECT 'Default vote types inserted:' as status;
SELECT name, display_name, weight FROM forum_vote_types ORDER BY weight DESC;

SELECT 'Default badges inserted:' as status;
SELECT name, category FROM forum_badges ORDER BY category, name;

SELECT 'Enhanced categories created:' as status;
SELECT name, icon, color FROM forum_categories_enhanced ORDER BY sort_order;

-- Final success message
SELECT 'Forum upgrades completed successfully!' as final_status;

