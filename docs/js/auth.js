// Initialize Supabase client using config (with guards for load order)
let supabase = window.supabaseClient;

function ensureSupabase() {
    if (!supabase) {
        if (window.supabaseClient) {
            supabase = window.supabaseClient;
        } else if (window.supabase && typeof window.supabase.createClient === 'function' && window.CONFIG) {
            // Fallback: initialize client if config loaded but client not yet created
            window.supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
            supabase = window.supabaseClient;
        }
    }
    return !!supabase;
}

async function ensureSupabaseAsync(maxAttempts = 10, delayMs = 150) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (ensureSupabase()) return true;
        await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    return ensureSupabase();
}

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
        const ready = await ensureSupabaseAsync();
        if (!ready) return;
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
        // Enforce cooldown to avoid 429 from Supabase
        const now = Date.now();
        const lastSent = Number(localStorage.getItem(CONFIG.STORAGE_KEYS.MAGIC_LINK_LAST_SENT) || 0);
        const cooldownMs = (CONFIG.AUTH?.MAGIC_LINK_COOLDOWN_SECONDS || 15) * 1000;
        const remainingMs = lastSent + cooldownMs - now;
        if (remainingMs > 0) {
            const remainingSec = Math.ceil(remainingMs / 1000);
            showAlert(`Please wait ${remainingSec}s before requesting another magic link.`, 'danger');
            return;
        }

        const ready = await ensureSupabaseAsync();
        if (!ready) {
            throw new Error('Supabase not initialized');
        }
        // Send magic link via Supabase
        const { data, error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                emailRedirectTo: window.location.origin + '/dashboard.html'
            }
        });
        
        if (error) {
            // Specific handling for Supabase throttle
            if (error.status === 429) {
                localStorage.setItem(CONFIG.STORAGE_KEYS.MAGIC_LINK_LAST_SENT, String(Date.now()));
                showAlert('For security, please wait 15 seconds before requesting another link.', 'danger');
                return;
            }
            throw error;
        }
        
        // Success - show message to check email
        showAlert('Magic link sent! Please check your email and click the link to sign in.', 'success');
        loginForm.reset();
        localStorage.setItem(CONFIG.STORAGE_KEYS.MAGIC_LINK_LAST_SENT, String(Date.now()));
        
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
ensureSupabaseAsync().then((ready) => {
    if (ready && supabase?.auth?.onAuthStateChange) {
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                // User successfully signed in, redirect to dashboard
                window.location.href = 'dashboard.html';
            }
        });
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
    signOut: () => { ensureSupabase(); return supabase ? supabase.auth.signOut() : Promise.resolve(); },
    getUser: () => { ensureSupabase(); return supabase ? supabase.auth.getUser() : Promise.resolve({ data: { user: null } }); }
};
