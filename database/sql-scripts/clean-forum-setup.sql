-- CLEAN FORUM DATABASE SETUP
-- This creates a fresh, simple database structure that matches the current code

-- Step 1: Drop existing tables (if they exist) to start fresh
DROP TABLE IF EXISTS forum_comments CASCADE;
DROP TABLE IF EXISTS forum_posts CASCADE;
DROP TABLE IF EXISTS forum_user_profiles CASCADE;
DROP TABLE IF EXISTS forum_votes CASCADE;
DROP TABLE IF EXISTS forum_categories CASCADE;
DROP TABLE IF EXISTS forum_tags CASCADE;
DROP TABLE IF EXISTS forum_post_tags CASCADE;

-- Step 2: Create forum_categories table
CREATE TABLE forum_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#007bff',
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create forum_user_profiles table
CREATE TABLE forum_user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    location VARCHAR(100),
    sobriety_date DATE,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    post_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    reputation INTEGER DEFAULT 0,
    is_moderator BOOLEAN DEFAULT false,
    is_banned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create forum_posts table
CREATE TABLE forum_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'General Discussion',
    tags TEXT[] DEFAULT '{}',
    user_id UUID NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'approved',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create forum_comments table (SIMPLE VERSION)
CREATE TABLE forum_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'approved',
    parent_comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
    thread_path TEXT,
    depth INTEGER DEFAULT 0,
    is_solution BOOLEAN DEFAULT false,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create forum_votes table
CREATE TABLE forum_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id),
    UNIQUE(user_id, comment_id)
);

-- Step 7: Create indexes for performance
CREATE INDEX idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX idx_forum_posts_category ON forum_posts(category);
CREATE INDEX idx_forum_posts_created_at ON forum_posts(created_at DESC);
CREATE INDEX idx_forum_posts_status ON forum_posts(status);

CREATE INDEX idx_forum_comments_post_id ON forum_comments(post_id);
CREATE INDEX idx_forum_comments_user_id ON forum_comments(user_id);
CREATE INDEX idx_forum_comments_created_at ON forum_comments(created_at DESC);
CREATE INDEX idx_forum_comments_parent_id ON forum_comments(parent_comment_id);

CREATE INDEX idx_forum_votes_user_id ON forum_votes(user_id);
CREATE INDEX idx_forum_votes_post_id ON forum_votes(post_id);
CREATE INDEX idx_forum_votes_comment_id ON forum_votes(comment_id);

-- Step 8: Insert default categories
INSERT INTO forum_categories (name, description, color, icon, sort_order) VALUES
('General Discussion', 'General recovery discussions', '#007bff', 'chat', 1),
('Recovery Support', 'Support and encouragement', '#28a745', 'heart', 2),
('Treatment & Resources', 'Treatment options and resources', '#ffc107', 'medical-kit', 3),
('Success Stories', 'Share your recovery journey', '#17a2b8', 'star', 4),
('Family & Friends', 'Support for loved ones', '#6f42c1', 'people', 5);

-- Step 9: Enable Row Level Security (RLS) with simple policies
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies - allow all authenticated users
CREATE POLICY "Anyone can view posts" ON forum_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert posts" ON forum_posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update their own posts" ON forum_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON forum_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view comments" ON forum_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert comments" ON forum_comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update their own comments" ON forum_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON forum_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view profiles" ON forum_user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own profile" ON forum_user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON forum_user_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view votes" ON forum_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own votes" ON forum_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own votes" ON forum_votes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own votes" ON forum_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Step 10: Create a function to update comment counts
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE forum_posts 
        SET comments_count = (
            SELECT COUNT(*) 
            FROM forum_comments 
            WHERE post_id = NEW.post_id AND status = 'approved'
        )
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE forum_posts 
        SET comments_count = (
            SELECT COUNT(*) 
            FROM forum_comments 
            WHERE post_id = OLD.post_id AND status = 'approved'
        )
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 11: Create trigger to automatically update comment counts
CREATE TRIGGER trigger_update_post_comment_count
    AFTER INSERT OR UPDATE OR DELETE ON forum_comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- Step 12: Insert some sample data
INSERT INTO forum_posts (title, content, category, tags, user_id, upvotes, downvotes, comments_count) VALUES
('Welcome to the Recovery Community', 'Hello everyone! I''m new here and looking forward to connecting with others on their recovery journey.', 'General Discussion', ARRAY['welcome', 'new'], '00000000-0000-0000-0000-000000000000', 5, 0, 0),
('Tips for Staying Sober During Holidays', 'The holiday season can be challenging. Here are some strategies that have helped me...', 'Recovery Support', ARRAY['holidays', 'tips'], '00000000-0000-0000-0000-000000000000', 12, 1, 0),
('Local AA Meeting Recommendations', 'Looking for recommendations for AA meetings in the Spokane area.', 'Treatment & Resources', ARRAY['AA', 'meetings'], '00000000-0000-0000-0000-000000000000', 8, 0, 0);

-- Step 13: Success message
SELECT 'Clean forum database setup completed successfully!' as result;
SELECT 'You can now test comment insertion - it should work perfectly!' as next_step;
