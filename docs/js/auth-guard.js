// Authentication Guard for Dashboard
// This file should be included in any page that requires authentication

// Initialize Supabase client using config
const supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

// Check if user is authenticated
async function requireAuth() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
            // User is not authenticated, redirect to login
            window.location.href = 'login.html';
            return null;
        }
        
        return user;
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = 'login.html';
        return null;
    }
}

// Get current user info
async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
            return null;
        }
        
        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

// Sign out user
async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            throw error;
        }
        
        // Redirect to login page
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Sign out error:', error);
        // Force redirect even if there's an error
        window.location.href = 'login.html';
    }
}

// Update UI with user information
function updateUserUI(user) {
    // Update user display name if element exists
    const userDisplayName = document.getElementById('user-display-name');
    if (userDisplayName && user.email) {
        userDisplayName.textContent = user.email.split('@')[0]; // Show username part of email
    }
    
    // Update any other user-specific UI elements
    const userEmail = document.getElementById('user-email');
    if (userEmail && user.email) {
        userEmail.textContent = user.email;
    }
}

// Initialize authentication guard
async function initAuthGuard() {
    const user = await requireAuth();
    
    if (user) {
        // User is authenticated, update UI
        updateUserUI(user);
        
        // Set up sign out functionality
        const signOutBtn = document.getElementById('sign-out-btn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', signOut);
        }
        
        // Listen for auth state changes
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                // User signed out, redirect to login
                window.location.href = 'login.html';
            }
        });
    }
}

// Export functions for use in other files
window.authGuard = {
    requireAuth,
    getCurrentUser,
    signOut,
    initAuthGuard
};

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuthGuard);
