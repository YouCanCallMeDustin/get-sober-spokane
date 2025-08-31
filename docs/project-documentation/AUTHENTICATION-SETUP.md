# Authentication System Setup Guide

This guide will help you set up the complete authentication system for your Express.js app using Supabase, including login, signup, password reset, and Google OAuth.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Express.js** (v5.1)
3. **Supabase account and project**
4. **Google OAuth credentials** (for Google sign-in)

## Installation

### 1. Install Dependencies

```bash
npm install express-session
```

The following dependencies are already in your package.json:
- `@supabase/supabase-js`
- `express`
- `dotenv`
- `pug`
- `bootstrap`

### 2. Environment Configuration

Create a `.env` file in your project root:

```bash
# Copy the example file
cp env.example .env
```

Edit `.env` with your actual values:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Session Secret (generate a random string)
SESSION_SECRET=your_random_session_secret_here

# Server Configuration
PORT=3001
NODE_ENV=development
```

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from the API settings

### 2. Enable Authentication Providers

In your Supabase dashboard:

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Enable **Google** provider and configure OAuth credentials

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Set application type to **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3001/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)
7. Copy the Client ID and Client Secret
8. Add these to your Supabase Google provider settings

### 4. Database Tables

Your existing tables (`profiles` and `recovery_milestones`) are already set up. The authentication system will work with them.

## Project Structure

```
src/
├── pug/
│   ├── auth/
│   │   ├── login.pug          # Login page
│   │   ├── signup.pug         # Signup page
│   │   └── reset.pug          # Password reset page
│   ├── dashboard.pug          # User dashboard
│   └── layout.pug             # Base layout
├── scss/
│   ├── components/
│   │   └── _auth.scss         # Authentication styles
│   └── styles.scss            # Main styles file
└── js/
    ├── auth.js                # Authentication logic
    └── config.js              # Configuration
```

## Features

### ✅ Implemented Features

1. **User Authentication**
   - Email/password login and signup
   - Google OAuth integration
   - Session management with Express
   - Remember me functionality

2. **Security Features**
   - Password validation (minimum 8 characters)
   - Email verification for new accounts
   - Secure session handling
   - CSRF protection

3. **User Experience**
   - Clean, responsive UI with Bootstrap 5.2.3
   - Form validation and error handling
   - Success/error message display
   - Automatic redirects

4. **Pages**
   - `/login` - User login
   - `/signup` - User registration
   - `/reset` - Password reset
   - `/dashboard` - User dashboard (protected)

### 🔧 Configuration Options

The system is highly configurable through:

- Environment variables
- `src/js/config.js` for client-side settings
- SCSS variables for styling
- Feature flags for enabling/disabling functionality

## Usage

### Starting the Server

```bash
# Development
npm run start:debug

# Production
npm run start
```

### Authentication Flow

1. **New User Signup**
   - User visits `/signup`
   - Fills out form with email, password, display name
   - Agrees to terms
   - Receives verification email
   - Redirected to login after verification

2. **User Login**
   - User visits `/login`
   - Enters email and password
   - Optionally checks "Remember me"
   - Redirected to dashboard on success

3. **Google OAuth**
   - User clicks "Sign in with Google"
   - Redirected to Google for authentication
   - Returns to app and redirected to dashboard

4. **Password Reset**
   - User visits `/reset`
   - Enters email address
   - Receives reset link via email
   - Sets new password

5. **Dashboard Access**
   - Authenticated users can access `/dashboard`
   - Unauthenticated users are redirected to `/login`
   - Users can update profile and manage recovery data

## Customization

### Styling

The authentication system uses SCSS with Bootstrap 5.2.3. Customize by editing:

- `src/scss/components/_auth.scss` - Authentication-specific styles
- `src/scss/variables/_colors.scss` - Color scheme
- `src/scss/variables/_typography.scss` - Font settings

### Layout

Modify the base layout in `src/pug/layout.pug` to match your site's design.

### Authentication Logic

Extend the `AuthManager` class in `src/js/auth.js` to add custom functionality.

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Session Secret**: Use a strong, random session secret
3. **HTTPS**: Use HTTPS in production for secure cookie transmission
4. **Rate Limiting**: Consider adding rate limiting for auth endpoints
5. **Input Validation**: All user inputs are validated on both client and server

## Troubleshooting

### Common Issues

1. **"Supabase credentials not found"**
   - Check your `.env` file
   - Verify environment variables are loaded

2. **Google OAuth not working**
   - Verify redirect URIs in Google Cloud Console
   - Check Supabase Google provider settings
   - Ensure HTTPS in production

3. **Session not persisting**
   - Check `SESSION_SECRET` in `.env`
   - Verify cookie settings
   - Check browser cookie policies

4. **Styling issues**
   - Ensure SCSS is compiled
   - Check Bootstrap CSS is loaded
   - Verify PostCSS and Autoprefixer are working

### Debug Mode

Enable debug mode for detailed logging:

```bash
npm run start:debug
```

Check the console for authentication state changes and errors.

## Production Deployment

1. **Environment Variables**: Set production environment variables
2. **HTTPS**: Enable HTTPS for secure cookie transmission
3. **Domain**: Update Google OAuth redirect URIs
4. **Session Store**: Consider using Redis for session storage
5. **Monitoring**: Add logging and monitoring for auth events

## Support

For issues or questions:

1. Check the browser console for error messages
2. Verify Supabase connection in Network tab
3. Check server logs for backend errors
4. Ensure all required files are loaded in correct order

## Next Steps

After setting up authentication:

1. **Test all flows**: Signup, login, logout, password reset
2. **Customize UI**: Adjust colors, fonts, and layout
3. **Add features**: Profile management, user roles, etc.
4. **Deploy**: Move to production environment
5. **Monitor**: Track authentication metrics and errors
