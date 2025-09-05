-- Forum Upgrades Based on Existing Database Structure
-- This script enhances your existing forum system without conflicts
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. ENHANCE EXISTING TABLES WITH NEW FEATURES
-- =====================================================

-- Enhance forum_user_profiles with reputation and advanced features
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

-- Enhance forum_posts with rich content features
ALTER TABLE forum_posts 
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'text', -- 'text', 'markdown', 'html'
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]', -- array of file attachments
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS thread_path TEXT, -- for threading
ADD COLUMN IF NOT EXISTS depth INTEGER DEFAULT 0; -- for threading

-- Enhance forum_comments with threading support
ALTER TABLE forum_comments 
ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS thread_path TEXT, -- for efficient threading queries
ADD COLUMN IF NOT EXISTS depth INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_solution BOOLEAN DEFAULT false, -- mark as solution to a question
ADD COLUMN IF NOT EXISTS helpful_votes INTEGER DEFAULT 0;

-- =====================================================
-- 2. NEW TABLES FOR ADVANCED FEATURES
-- =====================================================

-- Mentions System (if not exists)
CREATE TABLE IF NOT EXISTS forum_mentions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
    mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mentioning_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT false
);

-- Bookmarks System (if not exists)
CREATE TABLE IF NOT EXISTS forum_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id),
    UNIQUE(user_id, comment_id)
);

-- Enhanced Tags System (if not exists)
CREATE TABLE IF NOT EXISTS forum_tags_enhanced (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6c757d',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post-Tag relationships (if not exists)
CREATE TABLE IF NOT EXISTS forum_post_tags_enhanced (
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES forum_tags_enhanced(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- Moderation Actions (if not exists)
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

-- Enhanced Reports System (if not exists)
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
CREATE INDEX IF NOT EXISTS idx_forum_user_profiles_is_online ON forum_user_profiles(is_online) WHERE is_online = true;

-- Mention indexes
CREATE INDEX IF NOT EXISTS idx_forum_mentions_mentioned_user ON forum_mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_forum_mentions_unread ON forum_mentions(mentioned_user_id, is_read) WHERE is_read = false;

-- Bookmark indexes
CREATE INDEX IF NOT EXISTS idx_forum_bookmarks_user ON forum_bookmarks(user_id);

-- Comment threading indexes
CREATE INDEX IF NOT EXISTS idx_forum_comments_thread_path ON forum_comments(thread_path);
CREATE INDEX IF NOT EXISTS idx_forum_comments_parent ON forum_comments(parent_comment_id);

-- Post indexes
CREATE INDEX IF NOT EXISTS idx_forum_posts_pinned ON forum_posts(is_pinned, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_activity ON forum_posts(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_thread_path ON forum_posts(thread_path);

-- Tag indexes
CREATE INDEX IF NOT EXISTS idx_forum_post_tags_enhanced_post ON forum_post_tags_enhanced(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_tags_enhanced_tag ON forum_post_tags_enhanced(tag_id);

-- =====================================================
-- 4. INSERT DEFAULT DATA
-- =====================================================

-- Insert enhanced tags
INSERT INTO forum_tags_enhanced (name, description, color) VALUES
('recovery', 'Recovery and sobriety related content', '#28a745'),
('support', 'Support and encouragement', '#17a2b8'),
('advice', 'Advice and guidance', '#ffc107'),
('spokane', 'Spokane specific content', '#6f42c1'),
('milestone', 'Sobriety milestones and achievements', '#fd7e14'),
('mental-health', 'Mental health discussions', '#e83e8c'),
('family', 'Family and friends support', '#20c997'),
('resources', 'Resources and information', '#6c757d')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE forum_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_tags_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_post_tags_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_reports_enhanced ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist, then create new ones
-- Mentions policies
DROP POLICY IF EXISTS "Users can view mentions of them" ON forum_mentions;
CREATE POLICY "Users can view mentions of them" ON forum_mentions 
    FOR SELECT USING (auth.uid() = mentioned_user_id);

DROP POLICY IF EXISTS "Users can create mentions" ON forum_mentions;
CREATE POLICY "Users can create mentions" ON forum_mentions 
    FOR INSERT WITH CHECK (auth.uid() = mentioning_user_id);

-- Bookmarks policies
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON forum_bookmarks;
CREATE POLICY "Users can view their own bookmarks" ON forum_bookmarks 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own bookmarks" ON forum_bookmarks;
CREATE POLICY "Users can create their own bookmarks" ON forum_bookmarks 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON forum_bookmarks;
CREATE POLICY "Users can delete their own bookmarks" ON forum_bookmarks 
    FOR DELETE USING (auth.uid() = user_id);

-- Tags policies
DROP POLICY IF EXISTS "Anyone can view tags" ON forum_tags_enhanced;
CREATE POLICY "Anyone can view tags" ON forum_tags_enhanced 
    FOR SELECT USING (true);

-- Post tags policies
DROP POLICY IF EXISTS "Anyone can view post tags" ON forum_post_tags_enhanced;
CREATE POLICY "Anyone can view post tags" ON forum_post_tags_enhanced 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create post tags" ON forum_post_tags_enhanced;
CREATE POLICY "Users can create post tags" ON forum_post_tags_enhanced 
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM forum_posts WHERE id = post_id AND user_id = auth.uid())
    );

-- Reports policies
DROP POLICY IF EXISTS "Users can view their own reports" ON forum_reports_enhanced;
CREATE POLICY "Users can view their own reports" ON forum_reports_enhanced 
    FOR SELECT USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can create reports" ON forum_reports_enhanced;
CREATE POLICY "Users can create reports" ON forum_reports_enhanced 
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

GRANT SELECT, INSERT ON forum_mentions TO authenticated;
GRANT SELECT, INSERT, DELETE ON forum_bookmarks TO authenticated;
GRANT SELECT ON forum_tags_enhanced TO anon, authenticated;
GRANT SELECT, INSERT ON forum_post_tags_enhanced TO authenticated;
GRANT SELECT, INSERT ON forum_reports_enhanced TO authenticated;

-- =====================================================
-- 8. CREATE HELPFUL VIEWS
-- =====================================================

-- View for user profile with enhanced stats
CREATE OR REPLACE VIEW forum_user_profile_enhanced AS
SELECT 
    fup.*,
    COALESCE(
        (SELECT SUM(CASE WHEN fv.vote_type = 'upvote' THEN 1 WHEN fv.vote_type = 'downvote' THEN -1 ELSE 0 END)
         FROM forum_votes fv 
         JOIN forum_posts fp ON fv.post_id = fp.id 
         WHERE fp.user_id = fup.user_id), 0
    ) as total_reputation,
    COUNT(DISTINCT fub.id) as badge_count
FROM forum_user_profiles fup
LEFT JOIN user_badges fub ON fup.user_id = fub.user_id
GROUP BY fup.user_id, fup.display_name, fup.avatar_url, fup.sobriety_date, fup.bio, fup.location, fup.privacy_level, fup.join_date, fup.last_active, fup.updated_at, fup.reputation, fup.post_count, fup.comment_count, fup.helpful_votes_received, fup.custom_title, fup.signature, fup.website_url, fup.social_links, fup.privacy_settings, fup.notification_settings, fup.last_seen, fup.is_online;

-- View for posts with enhanced data
CREATE OR REPLACE VIEW forum_posts_enhanced AS
SELECT 
    fp.*,
    fup.display_name,
    fup.avatar_url,
    fup.reputation,
    COUNT(DISTINCT fc.id) as comment_count,
    COALESCE(fp.upvotes, 0) + COALESCE(fp.downvotes, 0) as vote_count,
    COALESCE(fp.upvotes, 0) - COALESCE(fp.downvotes, 0) as total_score
FROM forum_posts fp
LEFT JOIN forum_user_profiles fup ON fp.user_id = fup.user_id
LEFT JOIN forum_comments fc ON fp.id = fc.post_id
GROUP BY fp.id, fp.title, fp.content, fp.category, fp.tags, fp.user_id, fp.is_anonymous, fp.is_featured, fp.upvotes, fp.downvotes, fp.created_at, fp.updated_at, fp.content_type, fp.attachments, fp.is_pinned, fp.is_locked, fp.view_count, fp.last_activity, fp.thread_path, fp.depth, fup.display_name, fup.avatar_url, fup.reputation;

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
        SELECT COALESCE(SUM(CASE WHEN fv.vote_type = 'upvote' THEN 1 WHEN fv.vote_type = 'downvote' THEN -1 ELSE 0 END), 0)
        FROM forum_votes fv
        JOIN forum_posts fp ON fv.post_id = fp.id
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
    ELSIF TG_TABLE_NAME = 'forum_votes' THEN
        SELECT fp.user_id INTO user_id_val FROM forum_posts fp WHERE fp.id = NEW.post_id;
    END IF;
    
    -- Check each badge requirement
    FOR badge_record IN 
        SELECT id, name, requirements 
        FROM user_badges 
        WHERE NOT EXISTS (
            SELECT 1 FROM user_badges ub 
            WHERE ub.user_id = user_id_val AND ub.badge_id = user_badges.id
        )
    LOOP
        -- Check if user meets badge requirements
        IF badge_record.requirements->>'posts' IS NOT NULL THEN
            IF (SELECT COUNT(*) FROM forum_posts WHERE user_id = user_id_val) >= (badge_record.requirements->>'posts')::INTEGER THEN
                INSERT INTO user_badges (user_id, badge_id) VALUES (user_id_val, badge_record.id);
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

-- Drop existing triggers if they exist, then create new ones
-- Trigger to update reputation when votes change
DROP TRIGGER IF EXISTS update_reputation_on_vote ON forum_votes;
CREATE TRIGGER update_reputation_on_vote
    AFTER INSERT OR UPDATE OR DELETE ON forum_votes
    FOR EACH ROW EXECUTE FUNCTION update_user_reputation();

-- Trigger to check badges when posts are created
DROP TRIGGER IF EXISTS check_badges_on_post ON forum_posts;
CREATE TRIGGER check_badges_on_post
    AFTER INSERT ON forum_posts
    FOR EACH ROW EXECUTE FUNCTION check_user_badges();

-- Trigger to check badges when comments are created
DROP TRIGGER IF EXISTS check_badges_on_comment ON forum_comments;
CREATE TRIGGER check_badges_on_comment
    AFTER INSERT ON forum_comments
    FOR EACH ROW EXECUTE FUNCTION check_user_badges();

-- =====================================================
-- 11. VERIFICATION
-- =====================================================

-- Check that all enhancements were added successfully
SELECT 'Enhanced columns added to forum_user_profiles:' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'forum_user_profiles' 
AND column_name IN ('reputation', 'post_count', 'comment_count', 'custom_title', 'signature')
ORDER BY column_name;

-- Check that new tables were created
SELECT 'New tables created successfully:' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('forum_mentions', 'forum_bookmarks', 'forum_tags_enhanced', 'forum_post_tags_enhanced', 'forum_moderation_actions', 'forum_reports_enhanced')
ORDER BY table_name;

-- Check that default data was inserted
SELECT 'Enhanced tags inserted:' as status;
SELECT name, color FROM forum_tags_enhanced ORDER BY name;

-- Final success message
SELECT 'Forum upgrades completed successfully!' as final_status;
