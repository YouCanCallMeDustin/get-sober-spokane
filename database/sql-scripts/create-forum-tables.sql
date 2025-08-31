-- Create Forum Tables for Dashboard Recent Activity
-- Run this script in your Supabase SQL editor

-- First, drop existing tables and views if they exist
DROP TABLE IF EXISTS forum_user_profiles CASCADE;
DROP VIEW IF EXISTS recent_activity CASCADE;

-- Create forum_posts table
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

-- Create forum_comments table
CREATE TABLE IF NOT EXISTS forum_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_user_profiles table (as a table, not a view)
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_forum_posts_tags ON forum_posts USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_forum_comments_post_id ON forum_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_user_id ON forum_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_created_at ON forum_comments(created_at);

CREATE INDEX IF NOT EXISTS idx_forum_user_profiles_user_id ON forum_user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_user_profiles_privacy_level ON forum_user_profiles(privacy_level);

-- Enable Row Level Security
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_user_profiles ENABLE ROW LEVEL SECURITY;

-- Now drop existing policies if they exist (after tables are created)
DROP POLICY IF EXISTS "Users can view all public posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can create posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON forum_posts;

DROP POLICY IF EXISTS "Users can view all comments" ON forum_comments;
DROP POLICY IF EXISTS "Users can create comments" ON forum_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON forum_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON forum_comments;

DROP POLICY IF EXISTS "Users can view public profiles" ON forum_user_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON forum_user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON forum_user_profiles;

-- RLS Policies for forum_posts
CREATE POLICY "Users can view all public posts" ON forum_posts
    FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON forum_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id OR is_anonymous = true);

CREATE POLICY "Users can update their own posts" ON forum_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON forum_posts
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for forum_comments
CREATE POLICY "Users can view all comments" ON forum_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON forum_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON forum_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON forum_comments
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for forum_user_profiles
CREATE POLICY "Users can view public profiles" ON forum_user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own profile" ON forum_user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON forum_user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function for updating last_active column
CREATE OR REPLACE FUNCTION update_last_active_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_active = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_forum_posts_updated_at ON forum_posts;
CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_forum_comments_updated_at ON forum_comments;
CREATE TRIGGER update_forum_comments_updated_at BEFORE UPDATE ON forum_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_forum_user_profiles_last_active ON forum_user_profiles;
CREATE TRIGGER update_forum_user_profiles_last_active BEFORE UPDATE ON forum_user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_last_active_column();

-- Insert some sample data for testing (only if table is empty)
INSERT INTO forum_posts (title, content, category, tags, user_id, is_anonymous)
SELECT 
    'Welcome to the Recovery Community',
    'Hello everyone! I''m new here and looking forward to connecting with others on their recovery journey. This community has already been so helpful.',
    'General Discussion',
    ARRAY['welcome', 'new', 'community'],
    NULL,
    true
WHERE NOT EXISTS (SELECT 1 FROM forum_posts LIMIT 1);

INSERT INTO forum_posts (title, content, category, tags, user_id, is_anonymous)
SELECT 
    'Tips for Staying Sober During Holidays',
    'The holidays can be challenging for those in recovery. Here are some strategies that have worked for me...',
    'Recovery Support',
    ARRAY['holidays', 'tips', 'recovery'],
    NULL,
    true
WHERE NOT EXISTS (SELECT 1 FROM forum_posts WHERE title = 'Tips for Staying Sober During Holidays');

INSERT INTO forum_posts (title, content, category, tags, user_id, is_anonymous)
SELECT 
    'Local AA Meeting Schedule',
    'I found this great AA meeting schedule for the Spokane area. Thought I''d share it with everyone.',
    'Treatment & Resources',
    ARRAY['AA', 'meetings', 'spokane'],
    NULL,
    true
WHERE NOT EXISTS (SELECT 1 FROM forum_posts WHERE title = 'Local AA Meeting Schedule');

-- Create a view for recent activity
CREATE OR REPLACE VIEW recent_activity AS
SELECT 
    'post' as type,
    id,
    title as content_title,
    content,
    category,
    created_at,
    user_id,
    is_anonymous,
    upvotes,
    downvotes,
    NULL as post_id
FROM forum_posts
UNION ALL
SELECT 
    'comment' as type,
    id,
    NULL as content_title,
    content,
    NULL as category,
    created_at,
    user_id,
    false as is_anonymous,
    0 as upvotes,
    0 as downvotes,
    post_id
FROM forum_comments
ORDER BY created_at DESC;

-- Grant necessary permissions
GRANT SELECT ON forum_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON forum_posts TO authenticated;
GRANT SELECT ON forum_comments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON forum_comments TO authenticated;
GRANT SELECT ON forum_user_profiles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON forum_user_profiles TO authenticated;
GRANT SELECT ON recent_activity TO anon, authenticated;
