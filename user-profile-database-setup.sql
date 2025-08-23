-- User Profile System Database Setup
-- Run this script in your Supabase SQL editor or PostgreSQL database

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (Dashboard DB)
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sobriety_date DATE,
  bio TEXT,
  location VARCHAR(100) DEFAULT 'Spokane, WA',
  privacy_settings VARCHAR(20) DEFAULT 'public' CHECK (privacy_settings IN ('public', 'community', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Forum posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT FALSE
);

-- Forum comments table
CREATE TABLE IF NOT EXISTS forum_comments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_anonymous BOOLEAN DEFAULT FALSE
);

-- Forum votes table - tracks upvotes/downvotes on posts and comments
-- This table structure supports the userController.js queries
CREATE TABLE IF NOT EXISTS forum_votes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- User giving the vote
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- User receiving the vote
  vote_type VARCHAR(10) CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, target_user_id, vote_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_forum_comments_user_id ON forum_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_post_id ON forum_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_created_at ON forum_comments(created_at);
CREATE INDEX IF NOT EXISTS idx_forum_votes_target_user_id ON forum_votes(target_user_id);
CREATE INDEX IF NOT EXISTS idx_forum_votes_vote_type ON forum_votes(vote_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at 
  BEFORE UPDATE ON forum_posts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_comments_updated_at 
  BEFORE UPDATE ON forum_comments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
-- Uncomment these lines if you want to test with sample data

/*
INSERT INTO user_profiles (user_id, sobriety_date, bio, location, privacy_settings) VALUES
  ('00000000-0000-0000-0000-000000000001', '2024-01-01', 'Recovery is a journey, not a destination.', 'Spokane, WA', 'public'),
  ('00000000-0000-0000-0000-000000000002', '2024-06-15', 'One day at a time.', 'Spokane, WA', 'community');

INSERT INTO forum_posts (user_id, title, content, upvotes) VALUES
  ('00000000-0000-0000-0000-000000000001', 'My Recovery Story', 'I started my recovery journey in January 2024...', 5),
  ('00000000-0000-0000-0000-000000000002', 'Tips for Staying Sober', 'Here are some strategies that helped me...', 3);

INSERT INTO forum_comments (user_id, post_id, content) VALUES
  ('00000000-0000-0000-0000-000000000002', 1, 'Thank you for sharing your story. It gives me hope.'),
  ('00000000-0000-0000-0000-000000000001', 2, 'Great tips! I especially like the one about...');

INSERT INTO forum_votes (user_id, target_user_id, vote_type) VALUES
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'upvote'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'upvote');
*/

-- Grant permissions (adjust as needed for your setup)
-- These are example permissions - modify based on your security requirements

-- Grant read access to authenticated users
GRANT SELECT ON user_profiles TO authenticated;
GRANT SELECT ON forum_posts TO authenticated;
GRANT SELECT ON forum_comments TO authenticated;
GRANT SELECT ON forum_votes TO authenticated;

-- Grant insert/update access to authenticated users for their own data
GRANT INSERT, UPDATE ON user_profiles TO authenticated;
GRANT INSERT, UPDATE ON forum_posts TO authenticated;
GRANT INSERT, UPDATE ON forum_comments TO authenticated;
GRANT INSERT, UPDATE ON forum_votes TO authenticated;

-- Create Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view public profiles" ON user_profiles
  FOR SELECT USING (
    privacy_settings = 'public' OR 
    auth.uid() = user_id OR
    (privacy_settings = 'community' AND auth.uid() IS NOT NULL)
  );

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Forum posts policies
CREATE POLICY "Users can view all posts" ON forum_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON forum_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON forum_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON forum_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Forum comments policies
CREATE POLICY "Users can view all comments" ON forum_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON forum_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON forum_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON forum_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Forum votes policies
CREATE POLICY "Users can view all votes" ON forum_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can create votes" ON forum_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON forum_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON forum_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Verify tables were created
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('user_profiles', 'forum_posts', 'forum_comments', 'forum_votes')
ORDER BY table_name, ordinal_position;

-- Show table row counts
SELECT 
  'user_profiles' as table_name, COUNT(*) as row_count FROM user_profiles
UNION ALL
SELECT 
  'forum_posts' as table_name, COUNT(*) as row_count FROM forum_posts
UNION ALL
SELECT 
  'forum_comments' as table_name, COUNT(*) as row_count FROM forum_comments
UNION ALL
SELECT 
  'forum_votes' as table_name, COUNT(*) as row_count FROM forum_votes;
