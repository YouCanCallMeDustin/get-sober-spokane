-- Advanced Forum Features Database Schema
-- This script adds advanced features to the existing forum system

-- 1. Enhanced User Profiles with Reputation System
ALTER TABLE forum_user_profiles 
ADD COLUMN IF NOT EXISTS reputation INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS helpful_votes_received INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS custom_title TEXT,
ADD COLUMN IF NOT EXISTS signature TEXT,
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Spokane, WA',
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"show_email": false, "show_location": true, "show_sobriety_date": true}',
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"email_notifications": true, "push_notifications": true, "mention_notifications": true}',
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- 2. User Badges System
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

-- 3. Advanced Voting System
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

-- Enhanced vote tracking
CREATE TABLE IF NOT EXISTS forum_post_votes_enhanced (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type_id UUID NOT NULL REFERENCES forum_vote_types(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id, vote_type_id)
);

-- 4. Threading System for Comments
ALTER TABLE forum_comments 
ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS thread_path TEXT, -- for efficient threading queries
ADD COLUMN IF NOT EXISTS depth INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_solution BOOLEAN DEFAULT false, -- mark as solution to a question
ADD COLUMN IF NOT EXISTS helpful_votes INTEGER DEFAULT 0;

-- 5. Mentions System
CREATE TABLE IF NOT EXISTS forum_mentions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
    mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mentioning_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT false
);

-- 6. Notifications System
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

-- 7. Bookmarks System
CREATE TABLE IF NOT EXISTS forum_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id),
    UNIQUE(user_id, comment_id)
);

-- 8. User Following System
CREATE TABLE IF NOT EXISTS forum_user_follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id)
);

-- 9. Enhanced Categories with Subcategories
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

-- 10. Post Tags System (enhanced)
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

-- 11. Rich Content Support
ALTER TABLE forum_posts 
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'text', -- 'text', 'markdown', 'html'
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]', -- array of file attachments
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 12. Moderation System
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

-- 13. Reports System (enhanced)
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_user_profiles_reputation ON forum_user_profiles(reputation DESC);
CREATE INDEX IF NOT EXISTS idx_forum_user_profiles_last_seen ON forum_user_profiles(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_forum_user_badges_user_id ON forum_user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_mentions_mentioned_user ON forum_mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_forum_mentions_unread ON forum_mentions(mentioned_user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_forum_notifications_user_unread ON forum_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_forum_comments_thread_path ON forum_comments(thread_path);
CREATE INDEX IF NOT EXISTS idx_forum_comments_parent ON forum_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_forum_bookmarks_user ON forum_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_user_follows_follower ON forum_user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_forum_user_follows_following ON forum_user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_forum_categories_parent ON forum_categories_enhanced(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_tags_post ON forum_post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_tags_tag ON forum_post_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_pinned ON forum_posts(is_pinned, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_activity ON forum_posts(last_activity DESC);

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

-- Create RLS policies for new tables
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

-- Grant permissions
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
