# Database Setup Guide - Get Sober Spokane

## Overview

This guide provides the SQL commands needed to set up the required database tables and policies in Supabase to resolve the "Error loading user data" issue.

## Required Tables and Policies

### 1. Create the user_profiles table

```sql
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    email TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    sobriety_date DATE,
    recovery_milestones JSONB DEFAULT '[]'::jsonb,
    favorite_resources TEXT[] DEFAULT '{}',
    preferences JSONB DEFAULT '{
        "notifications_enabled": true,
        "privacy_level": "standard",
        "theme": "light"
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
```

### 2. Create RLS Policies for user_profiles

```sql
-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.user_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON public.user_profiles
FOR DELETE USING (auth.uid() = user_id);

-- Policy: Users can view public profiles (for community features)
CREATE POLICY "Users can view public profiles" ON public.user_profiles
FOR SELECT USING (
    preferences->>'privacy_level' = 'public' OR 
    auth.uid() = user_id
);
```

### 3. Create forum_posts table (for community features)

```sql
-- Create forum_posts table
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    is_anonymous BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON public.forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_status ON public.forum_posts(status);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON public.forum_posts(category);
```

### 4. Create RLS Policies for forum_posts

```sql
-- Policy: Users can view approved posts
CREATE POLICY "Users can view approved posts" ON public.forum_posts
FOR SELECT USING (status = 'approved');

-- Policy: Users can create posts
CREATE POLICY "Users can create posts" ON public.forum_posts
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own posts
CREATE POLICY "Users can update own posts" ON public.forum_posts
FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own posts
CREATE POLICY "Users can delete own posts" ON public.forum_posts
FOR DELETE USING (auth.uid() = user_id);
```

### 5. Create success_stories table

```sql
-- Create success_stories table
CREATE TABLE IF NOT EXISTS public.success_stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    media_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_success_stories_user_id ON public.success_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_success_stories_status ON public.success_stories(status);
```

### 6. Create RLS Policies for success_stories

```sql
-- Policy: Users can view approved stories
CREATE POLICY "Users can view approved stories" ON public.success_stories
FOR SELECT USING (status = 'approved');

-- Policy: Users can create stories
CREATE POLICY "Users can create stories" ON public.success_stories
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own stories
CREATE POLICY "Users can update own stories" ON public.success_stories
FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own stories
CREATE POLICY "Users can delete own stories" ON public.success_stories
FOR DELETE USING (auth.uid() = user_id);
```

### 7. Create forum_comments table

```sql
-- Create forum_comments table
CREATE TABLE IF NOT EXISTS public.forum_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_forum_comments_post_id ON public.forum_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_user_id ON public.forum_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_status ON public.forum_comments(status);
```

### 8. Create RLS Policies for forum_comments

```sql
-- Policy: Users can view approved comments
CREATE POLICY "Users can view approved comments" ON public.forum_comments
FOR SELECT USING (status = 'approved');

-- Policy: Users can create comments
CREATE POLICY "Users can create comments" ON public.forum_comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own comments
CREATE POLICY "Users can update own comments" ON public.forum_comments
FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON public.forum_comments
FOR DELETE USING (auth.uid() = user_id);
```

## How to Apply These Changes

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the "SQL Editor" section
3. Copy and paste each SQL block above
4. Execute them one by one in the order shown

### Option 2: Using Supabase CLI

1. Install Supabase CLI if you haven't already
2. Create a migration file with these SQL commands
3. Run `supabase db push` to apply the changes

## Verification

After applying these changes, you can verify the setup by:

1. Checking that the tables exist in the "Table Editor"
2. Verifying that RLS is enabled for each table
3. Confirming that the policies are listed in the "Authentication > Policies" section

## Troubleshooting

### Common Issues

1. **"relation does not exist" error**: Make sure you're connected to the correct database and the tables were created successfully.

2. **"permission denied" error**: Ensure that RLS policies are properly configured and the user has the necessary permissions.

3. **"foreign key constraint" error**: Verify that the `auth.users` table exists and the foreign key references are correct.

### Testing the Setup

You can test the setup by:

1. Creating a test user account
2. Attempting to log in
3. Checking if the user profile is created automatically
4. Verifying that the sobriety counter and other features work correctly

## Next Steps

After setting up the database:

1. Rebuild your project: `npm run build`
2. Start the server: `npm start`
3. Test the login functionality
4. Verify that user data loads correctly after login

## Support

If you continue to experience issues after following this guide:

1. Check the browser console for specific error messages
2. Verify your Supabase URL and API keys are correct
3. Ensure your Supabase project has the correct authentication settings
4. Contact support with specific error messages and steps to reproduce 