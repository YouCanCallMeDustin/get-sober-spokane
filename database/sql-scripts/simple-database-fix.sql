-- Simple Database Fix for Missing Columns
-- This script directly fixes the missing columns issue

-- First, let's see what the current forum_votes table looks like
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'forum_votes'
ORDER BY ordinal_position;

-- Add missing columns one by one
-- Add target_user_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'forum_votes' AND column_name = 'target_user_id'
  ) THEN
    ALTER TABLE forum_votes ADD COLUMN target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added target_user_id column';
  ELSE
    RAISE NOTICE 'target_user_id column already exists';
  END IF;
END $$;

-- Add vote_type column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'forum_votes' AND column_name = 'vote_type'
  ) THEN
    ALTER TABLE forum_votes ADD COLUMN vote_type VARCHAR(10) CHECK (vote_type IN ('upvote', 'downvote'));
    RAISE NOTICE 'Added vote_type column';
  ELSE
    RAISE NOTICE 'vote_type column already exists';
  END IF;
END $$;

-- Now add the unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.table_constraints 
    WHERE table_name = 'forum_votes' 
    AND constraint_name = 'forum_votes_user_target_vote_unique'
  ) THEN
    ALTER TABLE forum_votes ADD CONSTRAINT forum_votes_user_target_vote_unique 
      UNIQUE(user_id, target_user_id, vote_type);
    RAISE NOTICE 'Added unique constraint';
  ELSE
    RAISE NOTICE 'Unique constraint already exists';
  END IF;
END $$;

-- Create indexes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_indexes 
    WHERE tablename = 'forum_votes' 
    AND indexname = 'idx_forum_votes_target_user_id'
  ) THEN
    CREATE INDEX idx_forum_votes_target_user_id ON forum_votes(target_user_id);
    RAISE NOTICE 'Created target_user_id index';
  ELSE
    RAISE NOTICE 'target_user_id index already exists';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_indexes 
    WHERE tablename = 'forum_votes' 
    AND indexname = 'idx_forum_votes_vote_type'
  ) THEN
    CREATE INDEX idx_forum_votes_vote_type ON forum_votes(vote_type);
    RAISE NOTICE 'Created vote_type index';
  ELSE
    RAISE NOTICE 'vote_type index already exists';
  END IF;
END $$;

-- Verify the final structure
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'forum_votes'
ORDER BY ordinal_position;

-- Show table row count
SELECT COUNT(*) as total_rows FROM forum_votes;
