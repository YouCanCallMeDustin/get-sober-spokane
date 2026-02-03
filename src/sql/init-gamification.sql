-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id TEXT NOT NULL,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, badge_id)
);

-- Enable RLS for user_badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own badges
CREATE POLICY "Users can view their own badges" 
  ON user_badges FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own badges (or server logic? For now let's allow basic interaction)
-- ideally badges are awarded by the system, but for this app structure, client might trigger it or server
-- Let's allow insert for now if user matches
CREATE POLICY "Users can insert their own badges"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- Create user_journal table
CREATE TABLE IF NOT EXISTS user_journal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
  gratitude_text TEXT,
  entry_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_journal
ALTER TABLE user_journal ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own journal entries
CREATE POLICY "Users can view their own journal" 
  ON user_journal FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own journal entries
CREATE POLICY "Users can insert their own journal"
  ON user_journal FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own journal entries
CREATE POLICY "Users can update their own journal"
  ON user_journal FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own journal entries
CREATE POLICY "Users can delete their own journal"
  ON user_journal FOR DELETE
  USING (auth.uid() = user_id);


-- Create user_meetings table
CREATE TABLE IF NOT EXISTS user_meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meeting_type TEXT NOT NULL, -- 'AA', 'NA', 'Smart', 'Other'
  meeting_name TEXT,
  attended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Enable RLS for user_meetings
ALTER TABLE user_meetings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own meetings
CREATE POLICY "Users can view their own meetings" 
  ON user_meetings FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own meetings
CREATE POLICY "Users can insert their own meetings"
  ON user_meetings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own meetings
CREATE POLICY "Users can update their own meetings"
  ON user_meetings FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own meetings
CREATE POLICY "Users can delete their own meetings"
  ON user_meetings FOR DELETE
  USING (auth.uid() = user_id);
