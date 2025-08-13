// Initialize Supabase client using config
const supabase = window.supabaseClient;

// DOM Elements
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const loginBtn = document.getElementById('login-btn');
const btnText = document.querySelector('.btn-text');
const loadingSpinner = document.querySelector('.loading-spinner');
const alertContainer = document.getElementById('alert-container');

// Check if user is already authenticated
async function checkAuthStatus() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (user && !error) {
            // User is already logged in, redirect to dashboard
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
    }
}

// Show alert message
function showAlert(message, type = 'success') {
    alertContainer.innerHTML = `
        <div class="alert alert-${type}">
            ${message}
        </div>
    `;
    alertContainer.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertContainer.style.display = 'none';
    }, 5000);
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const email = emailInput.value.trim();
    
    if (!email) {
        showAlert('Please enter your email address', 'danger');
        return;
    }
    
    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address', 'danger');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        // Send magic link via Supabase
        const { data, error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                emailRedirectTo: window.location.origin + '/dashboard.html'
            }
        });
        
        if (error) {
            throw error;
        }
        
        // Success - show message to check email
        showAlert('Magic link sent! Please check your email and click the link to sign in.', 'success');
        loginForm.reset();
        
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Failed to send magic link. Please try again.', 'danger');
    } finally {
        setLoadingState(false);
    }
}

// Set loading state
function setLoadingState(isLoading) {
    if (isLoading) {
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        loadingSpinner.style.display = 'inline-block';
    } else {
        loginBtn.disabled = false;
        btnText.style.display = 'inline';
        loadingSpinner.style.display = 'none';
    }
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Handle authentication state changes
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
        // User successfully signed in, redirect to dashboard
        window.location.href = 'dashboard.html';
    }
});

// Event Listeners
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

// Check auth status when page loads
document.addEventListener('DOMContentLoaded', checkAuthStatus);

// Export functions for use in other files
window.auth = {
    supabase,
    checkAuthStatus,
    signOut: () => supabase.auth.signOut(),
    getUser: () => supabase.auth.getUser()
};
