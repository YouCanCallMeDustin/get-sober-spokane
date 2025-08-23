-- Check and Fix Database Structure
-- Run this script to verify and fix the database schema

-- First, let's check what tables exist and their current structure
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('user_profiles', 'forum_posts', 'forum_comments', 'forum_votes')
ORDER BY table_name, ordinal_position;

-- Check if forum_votes table exists and has the correct structure
DO $$
BEGIN
  -- Check if forum_votes table exists
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'forum_votes') THEN
    RAISE NOTICE 'Creating forum_votes table...';
    
    CREATE TABLE forum_votes (
      id SERIAL PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      vote_type VARCHAR(10) CHECK (vote_type IN ('upvote', 'downvote')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, target_user_id, vote_type)
    );
    
    -- Create indexes
    CREATE INDEX idx_forum_votes_target_user_id ON forum_votes(target_user_id);
    CREATE INDEX idx_forum_votes_vote_type ON forum_votes(vote_type);
    
    RAISE NOTICE 'forum_votes table created successfully';
    
  ELSE
    -- Check what columns exist and add missing ones
    RAISE NOTICE 'forum_votes table exists, checking columns...';
    
    -- Check if target_user_id column exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'forum_votes' AND column_name = 'target_user_id'
    ) THEN
      RAISE NOTICE 'Adding target_user_id column...';
      ALTER TABLE forum_votes ADD COLUMN target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    ELSE
      RAISE NOTICE 'target_user_id column already exists';
    END IF;
    
    -- Check if vote_type column exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'forum_votes' AND column_name = 'vote_type'
    ) THEN
      RAISE NOTICE 'Adding vote_type column...';
      ALTER TABLE forum_votes ADD COLUMN vote_type VARCHAR(10) CHECK (vote_type IN ('upvote', 'downvote'));
    ELSE
      RAISE NOTICE 'vote_type column already exists';
    END IF;
    
    -- Now try to add the unique constraint if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.table_constraints 
      WHERE table_name = 'forum_votes' 
      AND constraint_name = 'forum_votes_user_target_vote_unique'
    ) THEN
      RAISE NOTICE 'Adding unique constraint...';
      ALTER TABLE forum_votes ADD CONSTRAINT forum_votes_user_target_vote_unique 
        UNIQUE(user_id, target_user_id, vote_type);
    ELSE
      RAISE NOTICE 'Unique constraint already exists';
    END IF;
    
    -- Create indexes if they don't exist
    IF NOT EXISTS (
      SELECT FROM pg_indexes 
      WHERE tablename = 'forum_votes' 
      AND indexname = 'idx_forum_votes_target_user_id'
    ) THEN
      RAISE NOTICE 'Creating target_user_id index...';
      CREATE INDEX idx_forum_votes_target_user_id ON forum_votes(target_user_id);
    ELSE
      RAISE NOTICE 'target_user_id index already exists';
    END IF;
    
    IF NOT EXISTS (
      SELECT FROM pg_indexes 
      WHERE tablename = 'forum_votes' 
      AND indexname = 'idx_forum_votes_vote_type'
    ) THEN
      RAISE NOTICE 'Creating vote_type index...';
      CREATE INDEX idx_forum_votes_vote_type ON forum_votes(vote_type);
    ELSE
      RAISE NOTICE 'vote_type index already exists';
    END IF;
    
    RAISE NOTICE 'forum_votes table structure updated successfully';
  END IF;
END $$;

-- Check if user_profiles table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    RAISE NOTICE 'Creating user_profiles table...';
    
    CREATE TABLE user_profiles (
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
    
    CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
    RAISE NOTICE 'user_profiles table created successfully';
    
  ELSE
    RAISE NOTICE 'user_profiles table already exists';
  END IF;
END $$;

-- Check if forum_posts table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'forum_posts') THEN
    RAISE NOTICE 'Creating forum_posts table...';
    
    CREATE TABLE forum_posts (
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
    
    CREATE INDEX idx_forum_posts_user_id ON forum_posts(user_id);
    CREATE INDEX idx_forum_posts_created_at ON forum_posts(created_at);
    RAISE NOTICE 'forum_posts table created successfully';
    
  ELSE
    RAISE NOTICE 'forum_posts table already exists';
  END IF;
END $$;

-- Check if forum_comments table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'forum_comments') THEN
    RAISE NOTICE 'Creating forum_comments table...';
    
    CREATE TABLE forum_comments (
      id SERIAL PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      is_anonymous BOOLEAN DEFAULT FALSE
    );
    
    CREATE INDEX idx_forum_comments_user_id ON forum_comments(user_id);
    CREATE INDEX idx_forum_comments_post_id ON forum_comments(post_id);
    CREATE INDEX idx_forum_comments_created_at ON forum_comments(created_at);
    RAISE NOTICE 'forum_comments table created successfully';
    
  ELSE
    RAISE NOTICE 'forum_comments table already exists';
  END IF;
END $$;

-- Final verification - show the updated structure
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
