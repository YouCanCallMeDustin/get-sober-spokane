-- Forum Upgrades - Incremental Additions
-- This script adds advanced forum features to your existing database structure
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. ENHANCE EXISTING TABLES
-- =====================================================

-- Add reputation and advanced features to forum_user_profiles
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

-- Add threading support to forum_comments
ALTER TABLE forum_comments 
ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS thread_path TEXT, -- for efficient threading queries
ADD COLUMN IF NOT EXISTS depth INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_solution BOOLEAN DEFAULT false, -- mark as solution to a question
ADD COLUMN IF NOT EXISTS helpful_votes INTEGER DEFAULT 0;

-- Add rich content support to forum_posts
ALTER TABLE forum_posts 
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'text', -- 'text', 'markdown', 'html'
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]', -- array of file attachments
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =====================================================
-- 2. NEW TABLES FOR ADVANCED FEATURES
-- =====================================================

-- User Badges System
CREATE TABLE IF NOT EXISTS forum_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT DEFAULT '#007bff',
    category TEXT NOT NULL, -- 'achievement', 'milestone', 'moderation', 'special'
    requirements JSONB NOT NULL DEFAULT '{}', -- criteria for earning the badge
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
    weight INTEGER DEFAULT 1, -- how much this vote type affects reputation
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced vote tracking (replaces simple upvote/downvote)
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
    type TEXT NOT NULL, -- 'mention', 'reply', 'vote', 'badge_earned', 'post_approved', etc.
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- additional data for the notification
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

-- Enhanced Categories with Subcategories
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

-- Post Tags System (enhanced)
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
    target_type TEXT NOT NULL, -- 'post', 'comment', 'user'
    target_id UUID NOT NULL,
    action_type TEXT NOT NULL, -- 'approve', 'reject', 'edit', 'delete', 'warn', 'ban'
    reason TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports System (enhanced)
CREATE TABLE IF NOT EXISTS forum_reports_enhanced (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL, -- 'post', 'comment', 'user'
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
    moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
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
-- 4. INSERT DEFAULT DATA
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

-- Insert enhanced categories (migrate from existing categories)
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
-- 5. ENABLE ROW LEVEL SECURITY
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

-- =====================================================
-- 6. CREATE RLS POLICIES
-- =====================================================

-- Badges (read-only for all, write for admins)
CREATE POLICY "Anyone can view badges" ON forum_badges FOR SELECT USING (true);
CREATE POLICY "Users can view their own badges" ON forum_user_badges FOR SELECT USING (true);
CREATE POLICY "Users can view others' badges" ON forum_user_badges FOR SELECT USING (true);

-- Vote types (read-only for all)
CREATE POLICY "Anyone can view vote types" ON forum_vote_types FOR SELECT USING (true);

-- Enhanced votes
CREATE POLICY "Users can view all votes" ON forum_post_votes_enhanced FOR SELECT USING (true);
CREATE POLICY "Users can create votes" ON forum_post_votes_enhanced FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own votes" ON forum_post_votes_enhanced FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own votes" ON forum_post_votes_enhanced FOR DELETE USING (auth.uid() = user_id);

-- Mentions
CREATE POLICY "Users can view mentions of them" ON forum_mentions FOR SELECT USING (auth.uid() = mentioned_user_id);
CREATE POLICY "Users can create mentions" ON forum_mentions FOR INSERT WITH CHECK (auth.uid() = mentioning_user_id);

-- Notifications
CREATE POLICY "Users can view their own notifications" ON forum_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON forum_notifications FOR UPDATE USING (auth.uid() = user_id);

-- Bookmarks
CREATE POLICY "Users can view their own bookmarks" ON forum_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bookmarks" ON forum_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookmarks" ON forum_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- User follows
CREATE POLICY "Users can view all follows" ON forum_user_follows FOR SELECT USING (true);
CREATE POLICY "Users can create their own follows" ON forum_user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete their own follows" ON forum_user_follows FOR DELETE USING (auth.uid() = follower_id);

-- Categories
CREATE POLICY "Anyone can view categories" ON forum_categories_enhanced FOR SELECT USING (true);

-- Tags
CREATE POLICY "Anyone can view tags" ON forum_tags FOR SELECT USING (true);

-- Post tags
CREATE POLICY "Anyone can view post tags" ON forum_post_tags FOR SELECT USING (true);
CREATE POLICY "Users can create post tags" ON forum_post_tags FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM forum_posts WHERE id = post_id AND user_id = auth.uid())
);

-- Reports
CREATE POLICY "Users can view their own reports" ON forum_reports_enhanced FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Users can create reports" ON forum_reports_enhanced FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- =====================================================
-- 7. GRANT PERMISSIONS
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
-- 8. CREATE HELPFUL VIEWS
-- =====================================================

-- View for user profile with reputation and stats
CREATE OR REPLACE VIEW forum_user_profile_enhanced AS
SELECT 
    fup.*,
    COALESCE(SUM(fpv.weight), 0) as total_reputation,
    COUNT(DISTINCT fp.id) as post_count,
    COUNT(DISTINCT fc.id) as comment_count,
    COUNT(DISTINCT fub.id) as badge_count
FROM forum_user_profiles fup
LEFT JOIN forum_posts fp ON fup.user_id = fp.user_id
LEFT JOIN forum_comments fc ON fup.user_id = fc.user_id
LEFT JOIN forum_user_badges fub ON fup.user_id = fub.user_id
LEFT JOIN forum_post_votes_enhanced fpv ON fup.user_id = fpv.user_id
GROUP BY fup.user_id, fup.display_name, fup.avatar_url, fup.sobriety_date, fup.bio, fup.location, fup.privacy_level, fup.join_date, fup.last_active, fup.updated_at, fup.reputation, fup.post_count, fup.comment_count, fup.helpful_votes_received, fup.custom_title, fup.signature, fup.website_url, fup.social_links, fup.privacy_settings, fup.notification_settings, fup.last_seen, fup.is_online;

-- View for posts with enhanced data
CREATE OR REPLACE VIEW forum_posts_enhanced AS
SELECT 
    fp.*,
    fup.display_name,
    fup.avatar_url,
    fup.reputation,
    COUNT(DISTINCT fc.id) as comment_count,
    COUNT(DISTINCT fpv.id) as vote_count,
    COALESCE(SUM(fpv.weight), 0) as total_score
FROM forum_posts fp
LEFT JOIN forum_user_profiles fup ON fp.user_id = fup.user_id
LEFT JOIN forum_comments fc ON fp.id = fc.post_id
LEFT JOIN forum_post_votes_enhanced fpv ON fp.id = fpv.post_id
GROUP BY fp.id, fp.title, fp.content, fp.category, fp.tags, fp.user_id, fp.is_anonymous, fp.is_featured, fp.upvotes, fp.downvotes, fp.created_at, fp.updated_at, fp.content_type, fp.attachments, fp.is_pinned, fp.is_locked, fp.view_count, fp.last_activity, fup.display_name, fup.avatar_url, fup.reputation;

-- =====================================================
-- 9. CREATE FUNCTIONS FOR AUTOMATION
-- =====================================================

-- Function to update user reputation
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS TRIGGER AS $$
BEGIN
    -- Update reputation based on votes received
    UPDATE forum_user_profiles 
    SET reputation = (
        SELECT COALESCE(SUM(fvt.weight), 0)
        FROM forum_post_votes_enhanced fpv
        JOIN forum_vote_types fvt ON fpv.vote_type_id = fvt.id
        JOIN forum_posts fp ON fpv.post_id = fp.id
        WHERE fp.user_id = NEW.user_id
    )
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_user_badges()
RETURNS TRIGGER AS $$
DECLARE
    user_id_val UUID;
    badge_record RECORD;
BEGIN
    -- Get the user_id from the trigger context
    IF TG_TABLE_NAME = 'forum_posts' THEN
        user_id_val := NEW.user_id;
    ELSIF TG_TABLE_NAME = 'forum_comments' THEN
        user_id_val := NEW.user_id;
    ELSIF TG_TABLE_NAME = 'forum_post_votes_enhanced' THEN
        SELECT fp.user_id INTO user_id_val FROM forum_posts fp WHERE fp.id = NEW.post_id;
    END IF;
    
    -- Check each badge requirement
    FOR badge_record IN 
        SELECT id, name, requirements 
        FROM forum_badges 
        WHERE NOT EXISTS (
            SELECT 1 FROM forum_user_badges fub 
            WHERE fub.user_id = user_id_val AND fub.badge_id = forum_badges.id
        )
    LOOP
        -- Check if user meets badge requirements
        IF badge_record.requirements->>'posts' IS NOT NULL THEN
            IF (SELECT COUNT(*) FROM forum_posts WHERE user_id = user_id_val) >= (badge_record.requirements->>'posts')::INTEGER THEN
                INSERT INTO forum_user_badges (user_id, badge_id) VALUES (user_id_val, badge_record.id);
            END IF;
        END IF;
        
        -- Add more badge checks as needed
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. CREATE TRIGGERS
-- =====================================================

-- Trigger to update reputation when votes change
CREATE TRIGGER update_reputation_on_vote
    AFTER INSERT OR UPDATE OR DELETE ON forum_post_votes_enhanced
    FOR EACH ROW EXECUTE FUNCTION update_user_reputation();

-- Trigger to check badges when posts are created
CREATE TRIGGER check_badges_on_post
    AFTER INSERT ON forum_posts
    FOR EACH ROW EXECUTE FUNCTION check_user_badges();

-- Trigger to check badges when comments are created
CREATE TRIGGER check_badges_on_comment
    AFTER INSERT ON forum_comments
    FOR EACH ROW EXECUTE FUNCTION check_user_badges();

-- =====================================================
-- 11. VERIFICATION QUERIES
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
