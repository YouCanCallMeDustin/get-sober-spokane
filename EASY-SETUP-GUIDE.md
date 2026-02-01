# Easy Setup Guide - New Supabase Project (No Backup Needed!)

Since you're on the free plan and can't restore backups, here's the **easiest way** to get your website working:

## 🚀 Quick Setup (5 Steps)

### Step 1: Create New Supabase Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Name**: "Sober Spokane"
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for it to be ready

### Step 2: Get Your Credentials
1. In your new project, go to **Settings** → **API**
2. Copy these three values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJhbGci...`)
   - **service_role** key (long string starting with `eyJhbGci...`) - **Keep this secret!**

### Step 3: Set Up Your Database
1. In your new project, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file: `database/QUICK-SETUP-NEW-PROJECT.sql` from your project
4. Copy the **entire contents** of that file
5. Paste it into the SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. Wait for it to complete (should take 10-20 seconds)
8. You should see "✅ Database setup complete!" message

### Step 4: Configure Google OAuth
1. In your new project, go to **Authentication** → **Providers**
2. Find **Google** and click **Enable**
3. Enter your Google OAuth credentials:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
4. Click **Save**

### Step 5: Set Redirect URLs
1. Go to **Authentication** → **URL Configuration**
2. Add these **Redirect URLs**:
   ```
   http://localhost:3000/auth/google/callback
   http://localhost:3000/dashboard
   ```
3. Set **Site URL** to: `http://localhost:3000`
4. Click **Save**

### Step 6: Update Your Code
Once you have your new credentials, I can help you update:
- `.env` file
- `src/js/config.js` file
- Any other configuration files

Just share your new credentials with me and I'll update everything automatically!

## ✅ That's It!

After these steps:
1. Your database will have all the tables it needs
2. Google OAuth will be configured
3. You can test your website at `http://localhost:3000`

## 📝 Notes

- **No data loss**: Since you're starting fresh, you won't have old user data, but that's okay for testing
- **Users can sign up**: New users can create accounts and everything will work
- **All features work**: Forum, chat, profiles, sponsor finder - everything is set up

## 🆘 Need Help?

If you run into any issues:
1. Check the SQL Editor for error messages
2. Make sure you copied the entire SQL file
3. Verify your Google OAuth credentials are correct
4. Let me know what error you see and I'll help fix it!

---

**Next Step**: Create your new project, run the SQL script, then share your new credentials with me and I'll update all your configuration files! 🎉
