# Database Troubleshooting Guide

## Error: `column "target_user_id" does not exist`

### Problem Description
The user profile system is trying to query a `forum_votes` table that doesn't have the expected `target_user_id` column.

### Root Cause
This error occurs when:
1. The database tables were created with a different schema than expected
2. The `forum_votes` table is missing the `target_user_id` column
3. There's a mismatch between the database structure and the code

### Solution

#### Option 1: Run the Simple Fix Script (Recommended)
Execute the `simple-database-fix.sql` script in your Supabase SQL editor:

```sql
-- This script will:
-- 1. Check existing table structure
-- 2. Add missing columns one by one
-- 3. Add constraints and indexes safely
-- 4. Verify the final structure
```

#### Option 2: Run the Comprehensive Fix Script
Execute the `check-and-fix-database.sql` script in your Supabase SQL editor:

```sql
-- This script will:
-- 1. Check existing table structure
-- 2. Add missing columns if needed
-- 3. Create missing tables if needed
-- 4. Verify the final structure
```

#### Option 3: Manual Fix
If you prefer to fix manually, run these commands in order:

```sql
-- First, check what columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'forum_votes';

-- Add target_user_id column
ALTER TABLE forum_votes ADD COLUMN target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add vote_type column
ALTER TABLE forum_votes ADD COLUMN vote_type VARCHAR(10) CHECK (vote_type IN ('upvote', 'downvote'));

-- Add unique constraint
ALTER TABLE forum_votes ADD CONSTRAINT forum_votes_user_target_vote_unique 
  UNIQUE(user_id, target_user_id, vote_type);

-- Create indexes for performance
CREATE INDEX idx_forum_votes_target_user_id ON forum_votes(target_user_id);
CREATE INDEX idx_forum_votes_vote_type ON forum_votes(vote_type);
```

#### Option 4: Recreate the Table
If the table structure is completely wrong, drop and recreate:

```sql
-- Drop existing table (WARNING: This will delete all data)
DROP TABLE IF EXISTS forum_votes CASCADE;

-- Recreate with correct structure
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
```

## Error: `column "vote_type" named in key does not exist`

### Problem Description
This error occurs when trying to add a unique constraint that references a `vote_type` column that doesn't exist.

### Root Cause
The `forum_votes` table is missing multiple columns:
1. `target_user_id` column
2. `vote_type` column

### Solution
Use the `simple-database-fix.sql` script which adds columns one by one before attempting to add constraints.

### Verification
After fixing, verify the structure:

```sql
-- Check table structure
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'forum_votes'
ORDER BY ordinal_position;

-- Expected result should include:
-- id, user_id, target_user_id, vote_type, created_at
```

### Prevention
To avoid this issue in the future:

1. **Always run the complete database setup script** before testing the application
2. **Use the simple-database-fix.sql script** to verify database integrity
3. **Keep database schema files in version control** alongside your code
4. **Test database operations** in a development environment first

### Related Files
- `user-profile-database-setup.sql` - Complete database setup
- `check-and-fix-database.sql` - Comprehensive database verification and fix script
- `simple-database-fix.sql` - Simple, direct fix for missing columns
- `controllers/userController.js` - Code that queries the database
- `routes/user.js` - Routes that use the controller

### Next Steps
After fixing the database:

1. Restart your application
2. Test the user profile routes (`/user/:id`)
3. Verify that profile data loads correctly
4. Check server logs for any remaining errors

### Support
If you continue to have issues:

1. Check the server logs for detailed error messages
2. Verify your Supabase connection settings
3. Ensure all environment variables are set correctly
4. Test with a simple database query to verify connectivity
