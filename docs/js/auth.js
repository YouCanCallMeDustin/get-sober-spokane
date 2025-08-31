/*!
* Start Bootstrap - Creative v7.0.7 (https://YOUR_USERNAME.github.io/sober-spokane)
* Copyright 2013-2025 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-creative/blob/master/LICENSE)
* Built: 2025-08-31T17:54:28.739Z
*/
// Authentication JavaScript
class AuthManager {
  constructor() {
    this.supabase = null;
    this.currentUser = null;
    this.init();
  }

  async init() {
    // Initialize Supabase client
    const initialized = await this.initializeSupabase();
    
    // If Supabase failed to initialize, default to guest UI
    if (!initialized) {
      this.updateUIForUnauthenticatedUser();
      return;
    }

    // Check authentication state
    this.checkAuthState();
    
    // Set up auth state change listener
    this.setupAuthListener();
  }

  async initializeSupabase() {
    try {
      // Get Supabase credentials from config
      const supabaseUrl = window.APP_CONFIG?.SUPABASE_URL || '';
      const supabaseKey = window.APP_CONFIG?.SUPABASE_ANON_KEY || '';
      
      console.log('🔧 Initializing Supabase with:', { 
        url: supabaseUrl, 
        key: supabaseKey ? `${supabaseKey.substring(0, 10)}...` : 'undefined' 
      });
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Supabase credentials not found');
        console.error('   Please check your config.js file or environment variables');
        return false;
      }

      if (supabaseUrl === 'https://your-project-id.supabase.co' || supabaseKey === 'your_anon_key_here') {
        console.error('❌ Supabase credentials are still using placeholder values');
        console.error('   Please update your actual Supabase credentials');
        return false;
      }

      // Wait for Supabase to load
      let attempts = 0;
      const maxAttempts = 50; // Wait up to 5 seconds
      
      while (attempts < maxAttempts && typeof window.supabase === 'undefined') {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      // Check if Supabase is available globally
      if (typeof window.supabase !== 'undefined') {
        console.log('✅ Supabase loaded globally from CDN');
        this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
      } else {
        console.error('❌ Supabase not available globally after waiting');
        console.error('   Please check if the Supabase CDN script loaded properly');
        console.error('   You may need to refresh the page or check your internet connection');
        return false;
      }
      
      console.log('✅ Supabase client initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Supabase:', error);
      console.error('   This might be due to network issues or CDN problems');
      return false;
    }
  }

  async checkAuthState() {
    if (!this.supabase) return;

    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (session) {
        this.currentUser = session.user;
        this.onUserAuthenticated(session.user);
      } else {
        this.onUserSignedOut();
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    }
  }

  setupAuthListener() {
    if (!this.supabase) return;

    this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (event === 'SIGNED_IN' && session) {
        this.currentUser = session.user;
        this.onUserAuthenticated(session.user);
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        this.onUserSignedOut();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        this.currentUser = session.user;
      }
    });
  }

  onUserAuthenticated(user) {
    console.log('User authenticated:', user);
    
    // Update UI for authenticated user
    this.updateUIForAuthenticatedUser(user);
    
    // Attempt to sync server session (useful after Google OAuth client-side return)
    try {
      fetch('/api/auth/sync-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          displayName: user.user_metadata?.full_name || user.user_metadata?.display_name || 'User'
        })
      }).catch(() => {});
    } catch (e) {}

    // Sync profile to forum_user_profiles
    this.syncForumProfile(user).catch(err => console.warn('Profile sync failed', err));

    // Redirect to dashboard if on auth pages
    if (['/auth/login.html','/auth/signup.html','/auth/reset.html','/login','/signup','/reset'].includes(window.location.pathname)) {
      window.location.href = '/dashboard.html';
    }
  }

  async syncForumProfile(user) {
    try {
      if (!this.supabase) return;
      const displayName = user.user_metadata?.full_name || user.user_metadata?.display_name || user.user_metadata?.name || user.email;
      const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
      const { error } = await this.supabase
        .from('forum_user_profiles')
        .upsert({
          user_id: user.id,
          display_name: displayName,
          avatar_url: avatarUrl,
          last_active: new Date().toISOString()
        }, { onConflict: 'user_id' });
      if (error) throw error;
    } catch (e) {
      console.warn('syncForumProfile error', e);
    }
  }

  onUserSignedOut() {
    console.log('User signed out');
    
    // Update UI for unauthenticated user
    this.updateUIForUnauthenticatedUser();
    
    // Redirect to login if on protected pages
    if (['/dashboard','/dashboard.html'].includes(window.location.pathname)) {
      window.location.href = '/login?logout=true';
    }
  }

  updateUIForAuthenticatedUser(user) {
    // Show user-specific elements
    const authElements = document.querySelectorAll('[data-auth="required"]');
    authElements.forEach(el => el.style.display = 'block');
    
    // Hide auth-only elements
    const guestElements = document.querySelectorAll('[data-auth="guest"]');
    guestElements.forEach(el => el.style.display = 'none');
    
    // Update user info displays
    const userDisplays = document.querySelectorAll('[data-user-info]');
    userDisplays.forEach(el => {
      const field = el.dataset.userInfo;
      if (user[field]) {
        el.textContent = user[field];
      }
    });
  }

  updateUIForUnauthenticatedUser() {
    // Hide user-specific elements
    const authElements = document.querySelectorAll('[data-auth="required"]');
    authElements.forEach(el => el.style.display = 'none');
    
    // Show auth-only elements
    const guestElements = document.querySelectorAll('[data-auth="guest"]');
    guestElements.forEach(el => el.style.display = 'block');
  }

  // Google OAuth Sign In
  async signInWithGoogle() {
    console.log('🔧 Google OAuth sign-in initiated');
    
    if (!this.supabase) {
      console.error('❌ Supabase not initialized');
      this.showError('Authentication system not ready. Please refresh the page.');
      return false;
    }

    try {
      // Show loading state
      this.showSuccess('Initiating Google sign-in...');
      console.log('🔄 Starting Google OAuth flow...');
      
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Send users back to the static login page; the server route can also handle /auth/google/callback
          redirectTo: `${window.location.origin}/auth/login.html`,
          queryParams: { access_type: 'offline', prompt: 'consent' }
        }
      });

      if (error) {
        console.error('❌ Google OAuth error:', error);
        throw error;
      }
      
      console.log('✅ Google OAuth initiated successfully:', data);
      
      // If we get a URL back, it means we need to redirect
      if (data.url) {
        console.log('🔄 Redirecting to Google OAuth URL:', data.url);
        // Store a flag to indicate this is a Google OAuth return
        sessionStorage.setItem('googleOAuth', 'true');
        window.location.href = data.url;
      } else {
        console.log('ℹ️  No redirect URL received, OAuth might have completed automatically');
        // If no URL, the OAuth might have completed automatically
        this.showSuccess('Google sign-in completed successfully!');
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 1500);
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('❌ Google sign-in failed:', error);
      this.showError('Google sign-in failed: ' + error.message);
      return { success: false, error: error.message };
    }
  }

  // Email/Password Sign Up
  async signUp(email, password, displayName) {
    if (!this.supabase) {
      console.error('Supabase not initialized');
      return false;
    }

    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName
          }
        }
      });

      if (error) throw error;
      
      console.log('Sign up successful:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Sign up failed:', error);
      this.showError('Sign up failed: ' + error.message);
      return { success: false, error: error.message };
    }
  }

  // Email/Password Sign In
  async signIn(email, password, rememberMe = false) {
    if (!this.supabase) {
      console.error('Supabase not initialized');
      return false;
    }

    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      console.log('Sign in successful:', data);
      
      // Handle remember me functionality
      if (rememberMe) {
        this.setRememberMe(true);
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Sign in failed:', error);
      this.showError('Sign in failed: ' + error.message);
      return { success: false, error: error.message };
    }
  }

  // Password Reset
  async resetPassword(email) {
    if (!this.supabase) {
      console.error('Supabase not initialized');
      return false;
    }

    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset?token=`
      });

      if (error) throw error;
      
      console.log('Password reset email sent');
      return { success: true };
    } catch (error) {
      console.error('Password reset failed:', error);
      this.showError('Password reset failed: ' + error.message);
      return { success: false, error: error.message };
    }
  }

  // Sign Out
  async signOut() {
    if (!this.supabase) {
      console.error('Supabase not initialized');
      return false;
    }

    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) throw error;
      
      console.log('Sign out successful');
      
      // Clear remember me
      this.setRememberMe(false);
      
      return { success: true };
    } catch (error) {
      console.error('Sign out failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Remember Me functionality
  setRememberMe(enabled) {
    if (enabled) {
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberMe');
    }
  }

  isRememberMeEnabled() {
    return localStorage.getItem('rememberMe') === 'true';
  }

  // Utility methods
  showError(message) {
    console.error(message);
    
    // Create and show error alert
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger auth-alert';
    alertDiv.textContent = message;
    
    // Find a good place to insert the alert
    const container = document.querySelector('.auth-container, .dashboard-container, .container');
    if (container) {
      container.insertBefore(alertDiv, container.firstChild);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (alertDiv.parentNode) {
          alertDiv.remove();
        }
      }, 5000);
    }
  }

  showSuccess(message) {
    console.log(message);
    
    // Create and show success alert
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success auth-alert';
    alertDiv.textContent = message;
    
    // Find a good place to insert the alert
    const container = document.querySelector('.auth-container, .dashboard-container, .container');
    if (container) {
      container.insertBefore(alertDiv, container.firstChild);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (alertDiv.parentNode) {
          alertDiv.remove();
        }
      }, 5000);
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }
}

// Initialize authentication manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.authManager = new AuthManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthManager;
}
