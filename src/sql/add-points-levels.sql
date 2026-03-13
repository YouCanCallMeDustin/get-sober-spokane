-- Add Points and Levels to Consolidated Profiles
ALTER TABLE profiles_consolidated 
ADD COLUMN IF NOT EXISTS experience_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_checkin_points TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN profiles_consolidated.experience_points IS 'User total experience points for gamification';
COMMENT ON COLUMN profiles_consolidated.level IS 'User recovery level based on XP';
COMMENT ON COLUMN profiles_consolidated.last_checkin_points IS 'Last time the user earned daily check-in points';

-- Upate existing view to include new columns
CREATE OR REPLACE VIEW profiles AS
SELECT * FROM profiles_consolidated;

CREATE OR REPLACE VIEW user_profiles AS
SELECT * FROM profiles_consolidated;
