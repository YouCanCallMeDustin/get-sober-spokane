# Google OAuth Setup Guide for Sober Spokane

## 🚨 Current Issue
The "Sign in with Google" button isn't working because the Supabase credentials are not properly configured.

## 🔧 Step-by-Step Setup

### 1. Get Your Supabase Credentials

1. Go to [Supabase](https://supabase.com) and sign in
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy your **Project URL** and **anon public** key

### 2. Update Configuration

#### Option A: Update config.js directly
Edit `docs/js/config.js` and replace the placeholder values:

```javascript
// Replace these lines:
SUPABASE_URL: 'https://your-project-id.supabase.co',
SUPABASE_ANON_KEY: 'your_anon_key_here',

// With your actual values:
SUPABASE_URL: 'https://your-actual-project-id.supabase.co',
SUPABASE_ANON_KEY: 'your_actual_anon_key_here',
```

#### Option B: Use environment variables (Recommended)
1. Create a `.env` file in your project root:
```bash
SUPABASE_URL=https://your-actual-project-id.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here
```

2. Update `docs/js/config.js` to use environment variables:
```javascript
SUPABASE_URL: process.env.SUPABASE_URL || 'https://your-actual-project-id.supabase.co',
SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'your_actual_anon_key_here',
```

### 3. Configure Google OAuth in Supabase

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click **Enable**
3. You'll need to create a Google OAuth application:

#### Create Google OAuth App:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Set application type to **Web application**
6. Add these authorized redirect URIs:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   http://localhost:3000/auth/v1/callback (for development)
   ```
7. Copy the **Client ID** and **Client Secret**

#### Back to Supabase:
4. In Supabase Google provider settings, enter:
   - **Client ID**: Your Google OAuth client ID
   - **Client Secret**: Your Google OAuth client secret
5. Save the settings

### 4. Test the Setup

1. Refresh your login page
2. Open the browser console (F12)
3. Click the **🔧 Debug Info** section
4. Click **Test Configuration**
5. Check the console for any error messages

### 5. Common Issues & Solutions

#### Issue: "Supabase not initialized"
**Solution**: Check that your credentials are correct and the config file is loading

#### Issue: "Google OAuth error"
**Solution**: Verify your Google OAuth app is properly configured with correct redirect URIs

#### Issue: "Redirect URL mismatch"
**Solution**: Make sure the redirect URI in Supabase matches exactly what Google expects

## 🔍 Debugging

### Check Console Messages
Look for these console messages:
- ✅ **Supabase client initialized successfully** = Good
- ❌ **Supabase credentials not found** = Bad - check config
- ❌ **Supabase credentials are still using placeholder values** = Bad - update config

### Test Configuration Button
Use the debug section on the login page to:
- Check if Supabase is configured
- Test if the auth system is working
- See current configuration status

## 📱 Testing

1. **Clear browser cache** and refresh the page
2. **Open browser console** to see debug messages
3. **Click "Sign in with Google"** button
4. **Check console** for any error messages
5. **Look for redirect** to Google OAuth page

## 🆘 Still Not Working?

If you're still having issues:

1. **Check the console** for specific error messages
2. **Verify Supabase project** is active and not paused
3. **Check Google OAuth app** settings and redirect URIs
4. **Ensure environment variables** are properly set (if using them)
5. **Try in incognito mode** to rule out browser cache issues

## 📞 Support

If you need help:
1. Check the console error messages
2. Verify your Supabase project is active
3. Ensure Google OAuth is properly configured
4. Check that redirect URIs match exactly

---

**Note**: This setup requires a valid Supabase project with Google OAuth properly configured. The authentication won't work with placeholder credentials.
