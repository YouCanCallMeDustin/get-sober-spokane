# Supabase Authentication System for Sober Spokane

A comprehensive authentication system built with Supabase that provides email/password authentication, Google OAuth, password reset functionality, and robust session management.

## 🚀 Features

- **Email + Password Authentication**: Secure user signup and login
- **Google OAuth Integration**: One-click login with Google accounts
- **Password Reset**: Secure password reset via email
- **JWT Session Management**: Automatic token refresh and validation
- **Role-Based Access Control**: Check user roles from JWT claims
- **Event-Driven Architecture**: Listen for auth state changes
- **Modular Design**: Easy to integrate with frontend applications

## 📋 Prerequisites

- Node.js 16+ 
- Supabase account and project
- Google OAuth credentials (for Google login)

## 🛠️ Installation

1. **Install dependencies**:
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Set up environment variables**:
   Create a `.env` file in your project root:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Configure Supabase**:
   - Go to your Supabase project dashboard
   - Navigate to Authentication > Settings
   - Configure your site URL and redirect URLs
   - Set up Google OAuth provider (if using Google login)

## ⚙️ Configuration

### Basic Configuration

Update `src/js/config.js` with your Supabase credentials:

```javascript
const SUPABASE_URL = 'https://iquczuhmkemjytrynbxg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdWN6dWhta2Vtanl0cnFuYnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMDMzMjcsImV4cCI6MjA2OTY3OTMyN30.FFzZFBUAM1ZgQSTlzPNSuJIikUiQkvSBKvc19wdzulk';
```

### Google OAuth Setup

1. In Supabase Dashboard, go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
4. Set redirect URL to: `https://youcancallmedustin.github.io/get-sober-spokane/auth/callback.html`

## 🔧 Usage

### Basic Authentication Functions

```javascript
import authService from './src/js/auth.js';

// User signup
const signupResult = await authService.signupUser('user@example.com', 'password123');

// User login
const loginResult = await authService.loginUser('user@example.com', 'password123');

// Password reset
const resetResult = await authService.resetPassword('user@example.com');

// Google OAuth login
const googleResult = await authService.loginWithGoogle();

// User signout
const signoutResult = await authService.signOut();
```

### Session Management

```javascript
import sessionManager from './src/js/session-manager.js';

// Check if user is authenticated
const isAuth = authService.isAuthenticated();

// Get current user
const user = authService.getCurrentUser();

// Get JWT token
const token = sessionManager.getJWTToken();

// Check token expiration
const isExpired = sessionManager.isTokenExpired(token);

// Get user role
const isAdmin = sessionManager.hasRole('admin');
```

### Event Listeners

```javascript
// Listen for authentication success
window.addEventListener('auth:success', (event) => {
  console.log('User authenticated:', event.detail.user);
  // Update UI, redirect, etc.
});

// Listen for sign out
window.addEventListener('auth:signout', () => {
  console.log('User signed out');
  // Update UI, redirect to login, etc.
});
```

## 📱 Frontend Integration

### HTML Forms

```html
<!-- Login Form -->
<form id="login-form" onsubmit="FormHandling.handleLoginForm(event)">
  <input type="email" name="email" placeholder="Email" required>
  <input type="password" name="password" placeholder="Password" required>
  <button type="submit">Sign In</button>
  <div class="error-message"></div>
</form>

<!-- Signup Form -->
<form id="signup-form" onsubmit="FormHandling.handleSignupForm(event)">
  <input type="email" name="email" placeholder="Email" required>
  <input type="password" name="password" placeholder="Password" required>
  <input type="password" name="confirmPassword" placeholder="Confirm Password" required>
  <button type="submit">Create Account</button>
  <div class="error-message"></div>
  <div class="success-message"></div>
</form>
```

### UI Updates

```javascript
import { FrontendIntegration } from './src/js/auth-examples.js';

// Setup auth listeners
FrontendIntegration.setupAuthListeners();

// The UI will automatically update based on auth state
```

## 🔐 JWT and Session Handling

### Understanding JWT Tokens

JWT (JSON Web Tokens) are automatically handled by Supabase:

- **Access Token**: Short-lived token for API requests
- **Refresh Token**: Long-lived token for getting new access tokens
- **Automatic Refresh**: Tokens are automatically refreshed when needed

### Manual Token Verification

```javascript
// Decode JWT payload (without verification)
const decoded = sessionManager.decodeJWT(token);

// Check token expiration
const isExpired = sessionManager.isTokenExpired(token);

// Get expiration time
const expiresAt = sessionManager.getTokenExpiration(token);
```

### Session Persistence

Sessions are automatically stored in localStorage and restored on page reload:

```javascript
// Store session manually
sessionManager.storeSession(session);

// Retrieve stored session
const storedSession = sessionManager.getStoredSession();

// Clear session
sessionManager.clearSession();
```

## 🧪 Testing

### Run Examples

```javascript
import { AuthExamples } from './src/js/auth-examples.js';

// Test signup
await AuthExamples.exampleSignup('test@example.com', 'password123');

// Test login
await AuthExamples.exampleLogin('test@example.com', 'password123');

// Test session management
await AuthExamples.exampleSessionManagement();
```

### Error Handling

All functions return consistent result objects:

```javascript
const result = await authService.loginUser(email, password);

if (result.success) {
  // Handle success
  console.log('User logged in:', result.data.user);
} else {
  // Handle error
  console.error('Login failed:', result.error);
}
```

## 🔒 Security Features

- **Password Requirements**: Minimum 6 characters
- **Email Verification**: Required for new accounts
- **Secure Token Storage**: Tokens stored in localStorage with expiration checks
- **Automatic Session Refresh**: Prevents session expiration
- **CSRF Protection**: Built into Supabase
- **Rate Limiting**: Handled by Supabase

## 📁 File Structure

```
src/js/
├── config.js              # Configuration and environment variables
├── auth.js                # Main authentication service
├── session-manager.js     # Session and JWT management
└── auth-examples.js      # Usage examples and frontend integration

docs/
├── auth/                  # Authentication pages
│   ├── login.html        # Login form
│   ├── signup.html       # Signup form
│   ├── reset.html        # Password reset
│   └── callback.html     # OAuth callback handler
```

**Note**: For GitHub Pages deployment, the auth callback URL will be:
`https://youcancallmedustin.github.io/get-sober-spokane/auth/callback.html`

## 🚨 Common Issues

### 1. CORS Errors
- Ensure your Supabase project URL is correct
- Check that your site URL is configured in Supabase

### 2. Google OAuth Not Working
- Verify Google OAuth credentials in Supabase
- Check redirect URLs match exactly
- Ensure Google OAuth is enabled in Supabase

### 3. Session Not Persisting
- Check localStorage is available
- Verify session expiration times
- Check for JavaScript errors in console

### 4. Email Verification Not Working
- Check spam folder
- Verify email template in Supabase
- Check SMTP settings if using custom email provider

## 🔄 API Reference

### AuthService Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `signupUser(email, password)` | Create new user account | `{success, error, data}` |
| `loginUser(email, password)` | Authenticate existing user | `{success, error, data}` |
| `resetPassword(email)` | Send password reset email | `{success, error, data}` |
| `loginWithGoogle()` | Initiate Google OAuth | `{success, error, data}` |
| `signOut()` | Sign out current user | `{success, error, data}` |

### SessionManager Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getJWTToken()` | Get current JWT token | `string\|null` |
| `decodeJWT(token)` | Decode JWT payload | `object\|null` |
| `isTokenExpired(token)` | Check if token expired | `boolean` |
| `hasRole(role)` | Check user role | `boolean` |

## 📞 Support

For issues related to:
- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs)
- **Authentication Logic**: Review the examples in `auth-examples.js`
- **Configuration**: Verify your environment variables and Supabase settings

## 📄 License

MIT License - see LICENSE file for details.

---

**Note**: This authentication system is designed to work with the Sober Spokane project. Make sure to update configuration values and redirect URLs according to your deployment environment.
