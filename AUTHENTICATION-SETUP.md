# Authentication Setup Guide

This guide will help you set up the email-only authentication system using Supabase for your Get Sober Spokane application.

## Prerequisites

1. A Supabase account (free tier available)
2. Basic knowledge of web development
3. Your application deployed to GitHub Pages

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `sober-spokane-auth` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose the closest region to your users
6. Click "Create new project"
7. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Anon public key** (starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Configure Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Site URL**, add your GitHub Pages URL:
   - `https://youcancallmedustin.github.io/get-sober-spokane`
3. Under **Redirect URLs**, add:
   - `https://youcancallmedustin.github.io/get-sober-spokane/dashboard.html`
4. Click **Save**

## Step 4: Update Configuration Files

1. Open `docs/js/config.js`
2. Replace the placeholder values with your actual Supabase credentials:

```javascript
const CONFIG = {
    SUPABASE_URL: 'https://your-project-id.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key-here',
    // ... rest of config
};
```

## Step 5: Test the Authentication

1. Commit and push your changes to GitHub
2. Wait for GitHub Pages to rebuild
3. Navigate to your login page: `https://youcancallmedustin.github.io/get-sober-spokane/login.html`
4. Enter your email address
5. Check your email for the magic link
6. Click the magic link to sign in
7. You should be redirected to the dashboard

## How It Works

### Email-Only Authentication (Magic Links)

1. **User enters email**: User visits login page and enters their email address
2. **Magic link sent**: Supabase sends a secure, time-limited link to the user's email
3. **User clicks link**: User clicks the link in their email
4. **Automatic sign-in**: User is automatically signed in and redirected to the dashboard
5. **Session maintained**: User stays signed in until they sign out or the session expires

### Security Features

- **No passwords**: Eliminates password-related security risks
- **Time-limited links**: Magic links expire after a set time
- **Secure tokens**: Uses JWT tokens for session management
- **HTTPS only**: All communication is encrypted

## Customization Options

### Email Templates

You can customize the email templates in Supabase:
1. Go to **Authentication** → **Email Templates**
2. Customize the "Magic Link" template
3. Add your branding and messaging

### Redirect URLs

You can change where users are redirected after login:
1. Update `CONFIG.REDIRECT_URLS.AFTER_LOGIN` in `config.js`
2. Update the redirect URL in Supabase settings

### Session Duration

You can adjust how long users stay signed in:
1. Go to **Authentication** → **Settings**
2. Modify **JWT Expiry** (default is 1 hour)

## Troubleshooting

### Common Issues

1. **Magic link not received**
   - Check spam folder
   - Verify email address is correct
   - Check Supabase logs for errors

2. **Redirect not working**
   - Verify redirect URLs in Supabase settings
   - Check that your GitHub Pages URL is correct

3. **Authentication errors**
   - Check browser console for error messages
   - Verify Supabase credentials in `config.js`
   - Ensure Supabase project is active

### Debug Mode

To enable debug mode, add this to your browser console:
```javascript
localStorage.setItem('supabase.auth.debug', 'true')
```

## Next Steps

Once authentication is working, you can:

1. **Add user profiles**: Store additional user information in Supabase
2. **Implement user roles**: Add admin/moderator capabilities
3. **Add social login**: Integrate Google, Facebook, or other providers
4. **Customize UI**: Modify the login page design to match your brand
5. **Add analytics**: Track user engagement and recovery progress

## Support

If you encounter issues:

1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review the [Supabase community forum](https://github.com/supabase/supabase/discussions)
3. Check your browser's developer console for error messages

## Security Notes

- Never commit your Supabase credentials to version control
- Use environment variables in production
- Regularly rotate your API keys
- Monitor your Supabase usage and logs
- Consider implementing rate limiting for login attempts
