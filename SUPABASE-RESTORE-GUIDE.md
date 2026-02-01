# Supabase Project Restore Guide

## Current Situation
Your Supabase project "Get Sober Spokane" has been paused for over 90 days and cannot be restored through the dashboard. However, your data is intact and can be restored to a new project.

## Step-by-Step Restoration Process

### Step 1: Download Your Backup
1. In the Supabase dashboard for "Get Sober Spokane"
2. Click **"Download backups"** or **"Export your data"**
3. Save the backup file to your computer (it will be a `.sql` or `.tar` file)

### Step 2: Create a New Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: "Sober Spokane" (or "Get Sober Spokane")
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to be fully provisioned

### Step 3: Get Your New Project Credentials
1. In your new project dashboard, go to **Settings** → **API**
2. Copy these values (you'll need them):
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (starts with `eyJhbGci...`)
   - **service_role** key (starts with `eyJhbGci...`) - **Keep this secret!**

### Step 4: Restore Your Database Backup

#### Option A: Using Supabase Dashboard (Recommended)
1. Go to **Settings** → **Database** → **Backups**
2. Click **"Restore from backup"** or **"Upload backup"**
3. Upload the backup file you downloaded
4. Wait for the restoration to complete

#### Option B: Using SQL Editor
1. Go to **SQL Editor** in your new project
2. If your backup is a `.sql` file:
   - Open the SQL Editor
   - Copy and paste the contents of your `.sql` file
   - Click **"Run"**
3. If your backup is a `.tar` file, you may need to use `pg_restore` command line tool

### Step 5: Update Your Application Configuration

After restoration, update these files with your new project credentials:

#### Update `.env` file:
```env
SUPABASE_URL=https://your-new-project-id.supabase.co
SUPABASE_ANON_KEY=your_new_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key_here
```

#### Update `src/js/config.js`:
Replace the old Supabase URL and keys with your new ones.

### Step 6: Configure Google OAuth in New Project

1. In your new Supabase project, go to **Authentication** → **Providers**
2. Find **Google** and click **Enable**
3. Enter your Google OAuth credentials:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
4. Save the settings

### Step 7: Configure Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add these **Redirect URLs**:
   - `http://localhost:3000/auth/google/callback`
   - `http://localhost:3000/auth/login.html`
   - `http://localhost:3000/dashboard`
   - (Add your production URL when ready)
3. Set **Site URL** to: `http://localhost:3000` (for development)

### Step 8: Update Google Cloud Console (if needed)

If you're using Google OAuth, make sure your Google Cloud Console has the correct redirect URI:
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Navigate to **APIs & Services** → **Credentials**
- Find your OAuth 2.0 Client ID
- Add this authorized redirect URI:
  - `https://your-new-project-id.supabase.co/auth/v1/callback`

### Step 9: Test Your Application

1. Restart your server:
   ```bash
   npm run start:server
   ```
2. Go to `http://localhost:3000/login`
3. Try logging in with Google
4. Check the browser console for any errors

## Troubleshooting

### If restoration fails:
- Make sure your backup file is not corrupted
- Check that you have the correct database password
- Try restoring in smaller chunks if the backup is very large

### If Google OAuth doesn't work:
- Verify redirect URLs are correctly set in both Supabase and Google Cloud Console
- Check that Google OAuth is enabled in Supabase
- Clear browser cache and cookies
- Check browser console for specific error messages

### If you can't access your old project:
- The old project URL was: `https://iquczuhmkemjytrqnbxg.supabase.co`
- You can still download backups from the paused project dashboard
- All your data is safe and can be restored

## Important Notes

- ⚠️ **Keep your new credentials secure** - especially the service_role key
- 🔄 **Update all environment variables** after creating the new project
- ✅ **Test thoroughly** before deploying to production
- 📝 **Document your new project URL** for future reference

## Next Steps After Restoration

1. Test all authentication flows (email, Google OAuth)
2. Verify database tables and data are intact
3. Test your application's core features
4. Update any hardcoded Supabase URLs in your code
5. Deploy to production when ready
