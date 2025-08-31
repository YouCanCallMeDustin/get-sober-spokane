# Supabase Setup for Get Sober Spokane Dashboard

This guide will help you set up the Supabase backend for the Get Sober Spokane dashboard to enable user profile persistence and data storage.

## Prerequisites

1. A Supabase account and project
2. Your Supabase project URL and anon key (already configured in `docs/js/config.js`)
3. **Existing tables**: `profiles` and `recovery_milestones` (already in your database)

## Database Setup

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to the "SQL Editor" section in the left sidebar
3. Click "New Query"

### Step 2: Run the Database Update Script

1. Copy the contents of `check-existing-tables.sql`
2. Paste it into the SQL Editor
3. Click "Run" to execute the script

This script will:
- **Check your existing table structures** without modifying your data
- **Add missing columns** to your existing `profiles` table if needed
- **Add missing columns** to your existing `recovery_milestones` table if needed
- **Set up Row Level Security (RLS) policies** for data security
- **Create necessary indexes** for performance
- **Set up automatic profile creation** on user signup

### Step 3: Verify Tables Updated

1. Go to "Table Editor" in the left sidebar
2. You should see your existing `profiles` and `recovery_milestones` tables
3. Click on each table to verify the structure includes the new columns

## What This Enables

### User Profiles (using your existing `profiles` table)
- **Display Name**: Custom name for the user
- **Bio**: Personal description
- **Privacy Level**: Public, Standard, or High privacy settings
- **Theme**: Light, Dark, or Auto theme preference
- **Email Notifications**: Toggle for various notification types
- **Sobriety Date**: The user's sobriety start date

### Recovery Milestones (using your existing `recovery_milestones` table)
- **Title**: Milestone name
- **Description**: Details about the achievement
- **Date**: When the milestone was achieved
- **User Association**: Each milestone is tied to the authenticated user

### Data Security
- **Row Level Security (RLS)**: Users can only access their own data
- **Automatic Profile Creation**: Profiles are created when users sign up
- **Cascade Deletion**: User data is automatically cleaned up when accounts are deleted

## Testing the Integration

1. **Sign up/Login**: Create a new account or sign in with an existing one
2. **Navigate to Dashboard**: Go to the dashboard page
3. **Update Profile**: Try updating your display name, bio, or other profile fields
4. **Set Sobriety Date**: Set your sobriety date and verify it persists
5. **Add Milestones**: Create recovery milestones and verify they're saved
6. **Check Persistence**: Refresh the page and verify your data is still there

## Troubleshooting

### Common Issues

1. **"No authenticated user found"**
   - Ensure you're logged in
   - Check that `auth-guard.js` is properly loaded

2. **"Error loading profile"**
   - Verify the `profiles` table exists and has the required columns
   - Check RLS policies are enabled
   - Ensure the user has a profile record

3. **"Error updating profile"**
   - Check that the user is authenticated
   - Verify the `profiles` table structure includes the expected columns

### Database Schema Verification

Run this query to verify your tables are set up correctly:

```sql
-- Check table structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'recovery_milestones')
ORDER BY table_name, ordinal_position;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'recovery_milestones');
```

## Next Steps

Once the database is set up:

1. **Test Profile Updates**: Verify that profile changes are saved to Supabase
2. **Test Sobriety Date**: Ensure the sobriety date is user-specific and persists
3. **Test Milestones**: Verify that milestones are saved per user
4. **Monitor Performance**: Check the Supabase dashboard for any performance issues

## Security Notes

- All data is protected by Row Level Security
- Users can only access their own profile and milestones
- The `auth.uid()` function ensures data isolation
- Profile creation is automatic and secure

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify the Supabase connection in the Network tab
3. Check the Supabase logs for any backend errors
4. Ensure all required JavaScript files are loaded in the correct order

## Important Notes

- **Your existing data is preserved** - this setup only adds missing columns
- **No duplicate tables are created** - we use your existing `profiles` and `recovery_milestones`
- **The JavaScript code has been updated** to work with your existing table names
- **RLS policies are added** to ensure data security without affecting existing functionality
