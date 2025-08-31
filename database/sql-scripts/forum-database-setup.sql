-- Forum Database Setup for Sober Spokane Community
-- This file creates the necessary tables for the community forum functionality

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create forum_posts table
CREATE TABLE IF NOT EXISTS forum_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_comments table
CREATE TABLE IF NOT EXISTS forum_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_categories table for better category management
CREATE TABLE IF NOT EXISTS forum_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#007bff',
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_user_profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS forum_user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    location VARCHAR(200),
    sobriety_date DATE,
    privacy_level VARCHAR(20) DEFAULT 'community' CHECK (privacy_level IN ('public', 'community', 'private')),
    is_verified BOOLEAN DEFAULT FALSE,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_user_achievements table
CREATE TABLE IF NOT EXISTS forum_user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_user_follows table for following other users
CREATE TABLE IF NOT EXISTS forum_user_follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Create forum_post_reports table for moderation
CREATE TABLE IF NOT EXISTS forum_post_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    moderator_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_comment_reports table for comment moderation
CREATE TABLE IF NOT EXISTS forum_comment_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES forum_comments(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    moderator_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default forum categories
INSERT INTO forum_categories (name, description, color, icon, sort_order) VALUES
('General Discussion', 'General topics and conversations about recovery', '#007bff', 'bi-chat-dots', 1),
('Recovery Support', 'Support and encouragement for recovery journey', '#28a745', 'bi-heart', 2),
('Treatment & Resources', 'Information about treatment options and resources', '#17a2b8', 'bi-stethoscope', 3),
('Family & Friends', 'Support for family members and friends', '#6f42c1', 'bi-people', 4),
('Mental Health', 'Mental health discussions and support', '#fd7e14', 'bi-brain', 5),
('Employment & Housing', 'Job and housing support for recovery', '#20c997', 'bi-briefcase', 6),
('Sober Activities', 'Fun activities and events for sober living', '#e83e8c', 'bi-calendar-event', 7),
('Success Stories', 'Celebrating recovery milestones and achievements', '#ffc107', 'bi-star', 8)
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_forum_posts_is_featured ON forum_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_forum_posts_tags ON forum_posts USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_forum_comments_post_id ON forum_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_user_id ON forum_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_created_at ON forum_comments(created_at);

CREATE INDEX IF NOT EXISTS idx_forum_user_profiles_user_id ON forum_user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_user_profiles_privacy_level ON forum_user_profiles(privacy_level);

CREATE INDEX IF NOT EXISTS idx_forum_user_follows_follower ON forum_user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_forum_user_follows_following ON forum_user_follows(following_id);

-- Create RLS (Row Level Security) policies for data protection
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comment_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policy for forum_posts
CREATE POLICY "Users can view all public posts" ON forum_posts
    FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON forum_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON forum_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON forum_posts
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policy for forum_comments
CREATE POLICY "Users can view all comments" ON forum_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON forum_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON forum_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON forum_comments
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policy for forum_user_profiles
CREATE POLICY "Users can view public profiles" ON forum_user_profiles
    FOR SELECT USING (privacy_level = 'public' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" ON forum_user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON forum_user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy for forum_user_achievements
CREATE POLICY "Users can view public achievements" ON forum_user_achievements
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own achievements" ON forum_user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy for forum_user_follows
CREATE POLICY "Users can view follows" ON forum_user_follows
    FOR SELECT USING (true);

CREATE POLICY "Users can create follows" ON forum_user_follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" ON forum_user_follows
    FOR DELETE USING (auth.uid() = follower_id);

-- RLS Policy for forum_post_reports
CREATE POLICY "Users can create reports" ON forum_post_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON forum_post_reports
    FOR SELECT USING (auth.uid() = reporter_id);

-- RLS Policy for forum_comment_reports
CREATE POLICY "Users can create comment reports" ON forum_comment_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own comment reports" ON forum_comment_reports
    FOR SELECT USING (auth.uid() = reporter_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_comments_updated_at BEFORE UPDATE ON forum_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_user_profiles_updated_at BEFORE UPDATE ON forum_user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_post_reports_updated_at BEFORE UPDATE ON forum_post_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_comment_reports_updated_at BEFORE UPDATE ON forum_comment_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO forum_user_profiles (user_id, display_name, join_date)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update last_active timestamp
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE forum_user_profiles 
    SET last_active = NOW() 
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update last_active when user creates posts or comments
CREATE TRIGGER update_user_activity_on_post
    AFTER INSERT ON forum_posts
    FOR EACH ROW EXECUTE FUNCTION update_user_last_active();

CREATE TRIGGER update_user_activity_on_comment
    AFTER INSERT ON forum_comments
    FOR EACH ROW EXECUTE FUNCTION update_user_last_active();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create view for forum statistics
CREATE OR REPLACE VIEW forum_stats AS
SELECT 
    (SELECT COUNT(*) FROM forum_posts) as total_posts,
    (SELECT COUNT(*) FROM forum_comments) as total_comments,
    (SELECT COUNT(*) FROM forum_user_profiles) as total_users,
    (SELECT COUNT(*) FROM forum_posts WHERE is_featured = true) as featured_stories,
    (SELECT COUNT(*) FROM forum_posts WHERE created_at >= NOW() - INTERVAL '24 hours') as posts_today,
    (SELECT COUNT(*) FROM forum_comments WHERE created_at >= NOW() - INTERVAL '24 hours') as comments_today;

-- Grant access to the view
GRANT SELECT ON forum_stats TO anon, authenticated;

-- Insert sample data for testing (optional)
-- Uncomment the following lines if you want to add sample data

/*
INSERT INTO forum_posts (title, content, category, tags, user_id, is_anonymous, upvotes, downvotes) VALUES
('Welcome to the Recovery Community', 'Hello everyone! I''m new here and looking forward to connecting with others on their recovery journey. This community has already been so helpful.', 'General Discussion', ARRAY['welcome', 'new', 'community'], '00000000-0000-0000-0000-000000000001', false, 5, 0),
('Tips for Staying Sober During Holidays', 'The holiday season can be challenging for those in recovery. Here are some strategies that have helped me: 1) Plan ahead, 2) Have sober activities ready, 3) Stay connected with support network.', 'Recovery Support', ARRAY['holidays', 'tips', 'sobriety'], '00000000-0000-0000-0000-000000000002', false, 12, 1),
('Local AA Meeting Recommendations', 'Looking for recommendations for AA meetings in the Spokane area. I''ve tried a few but would love to hear about others'' experiences.', 'Treatment & Resources', ARRAY['AA', 'meetings', 'Spokane', 'recommendations'], '00000000-0000-0000-0000-000000000003', false, 8, 0);
*/
