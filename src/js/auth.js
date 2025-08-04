// src/js/auth.js - Enhanced Authentication System

// Check if already loaded to prevent duplicate declarations
if (typeof window.authInitialized !== 'undefined') {
    console.log('Auth system already initialized, skipping...');
    // Exit early if already initialized
    // Do NOT use return at the top level; just skip redefining everything
} else {

// User state management
let currentUser = null;
let userProfile = null;
let isAnonymous = false;
let authInitialized = false;

function waitForSupabaseAndInitAuth() {
    if (window.supabase && window.supabase.auth) {
        initializeAuth();
        setupAuthListeners();
        setupAuthButton();
    } else {
        setTimeout(waitForSupabaseAndInitAuth, 50);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    waitForSupabaseAndInitAuth();
});

// Initialize authentication system
async function initializeAuth() {
    try {
        console.log('Initializing authentication system...');
        
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session);
        
        if (session) {
            currentUser = session.user;
            console.log('Found existing session for user:', currentUser.email);
            await loadUserProfile();
            updateUIForAuthenticatedUser();
        } else {
            console.log('No existing session found');
            updateUIForUnauthenticatedUser();
        }
        
        authInitialized = true;
        console.log('Authentication system initialized');
        
        // Trigger a custom event to notify other scripts that auth is ready
        window.dispatchEvent(new CustomEvent('authReady', { 
            detail: { 
                currentUser, 
                userProfile, 
                isAuthenticated: !!(currentUser || isAnonymous) 
            } 
        }));
        
    } catch (error) {
        console.error('Auth initialization error:', error);
        updateUIForUnauthenticatedUser();
        authInitialized = true;
    }
}

// Setup authentication event listeners
function setupAuthListeners() {
    // Auth state change listener
    supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event, session);
        
        if (event === 'SIGNED_IN' && session) {
            currentUser = session.user;
            console.log('User signed in:', currentUser);
            await loadUserProfile();
            updateUIForAuthenticatedUser();
            showNotification('Successfully logged in!', 'success');
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            userProfile = null;
            isAnonymous = false;
            updateUIForUnauthenticatedUser();
            showNotification('Successfully logged out!', 'info');
        } else if (event === 'TOKEN_REFRESHED' && session) {
            currentUser = session.user;
            console.log('Token refreshed for user:', currentUser.email);
            await loadUserProfile();
            updateUIForAuthenticatedUser();
        }
    });
}

// Setup auth button in navigation
function setupAuthButton() {
    // Wait a bit for the DOM to be fully loaded
    setTimeout(() => {
        const navbar = document.querySelector('.navbar-nav');
        if (!navbar) {
            console.warn('Navbar not found, retrying...');
            setTimeout(setupAuthButton, 100);
            return;
        }
        
        // Check if auth button already exists
        if (document.getElementById('auth-button')) {
            updateAuthButton();
            return;
        }
        
        // Create auth button
        const authButton = document.createElement('li');
        authButton.className = 'nav-item';
        authButton.id = 'auth-button';
        authButton.innerHTML = `
            <button class="btn btn-outline-primary btn-sm" onclick="showAuthModal()">
                <i class="bi bi-person me-1"></i>Login
            </button>
        `;
        
        navbar.appendChild(authButton);
        updateAuthButton();
    }, 100);
}

// Update auth button based on authentication state
function updateAuthButton() {
    const authButton = document.getElementById('auth-button');
    if (!authButton) return;
    
    console.log('Updating auth button. Current user:', currentUser, 'Profile:', userProfile);
    
    if (currentUser || isAnonymous) {
        // Get display name from various sources
        let displayName = 'User';
        let userAvatar = null;
        
        if (userProfile && userProfile.display_name) {
            displayName = userProfile.display_name;
        } else if (currentUser && currentUser.user_metadata) {
            if (currentUser.user_metadata.full_name) {
                displayName = currentUser.user_metadata.full_name;
            } else if (currentUser.user_metadata.name) {
                displayName = currentUser.user_metadata.name;
            } else if (currentUser.user_metadata.display_name) {
                displayName = currentUser.user_metadata.display_name;
            } else if (currentUser.email) {
                displayName = currentUser.email.split('@')[0];
            }
            
            // Get avatar from Google profile
            if (currentUser.user_metadata.avatar_url) {
                userAvatar = currentUser.user_metadata.avatar_url;
            } else if (currentUser.user_metadata.picture) {
                userAvatar = currentUser.user_metadata.picture;
            }
        } else if (currentUser && currentUser.email) {
            displayName = currentUser.email.split('@')[0];
        }
        
        // Create avatar HTML if available
        const avatarHtml = userAvatar ? 
            `<img src="${userAvatar}" alt="Profile" class="rounded-circle me-2" width="20" height="20">` : 
            `<i class="bi bi-person me-1"></i>`;
        
        authButton.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-primary btn-sm dropdown-toggle d-flex align-items-center" type="button" data-bs-toggle="dropdown">
                    ${avatarHtml}${displayName}
                </button>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="dashboard.html">Dashboard</a></li>
                    <li><a class="dropdown-item" href="dashboard.html#profile">Profile</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" onclick="handleLogout()">Logout</a></li>
                </ul>
            </div>
        `;
    } else {
        authButton.innerHTML = `
            <button class="btn btn-outline-primary btn-sm" onclick="showAuthModal()">
                <i class="bi bi-person me-1"></i>Login
            </button>
        `;
    }
}

// Email/password login
window.handleLogin = async function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ 
            email, 
            password 
        });
        
        if (error) throw error;
        
        // Close modal after successful login
        const modal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
        if (modal) {
            modal.hide();
        }
        
        showNotification('Login successful!', 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    }
};

// Email/password registration
window.handleRegister = async function(e) {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const displayName = document.getElementById('register-display-name').value;
    const isAnonymousUser = document.getElementById('register-anonymous').checked;
    
    try {
        const { data, error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    display_name: displayName,
                    is_anonymous: isAnonymousUser
                }
            }
        });
        
        if (error) throw error;
        
        // Close modal after successful registration
        const modal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
        if (modal) {
            modal.hide();
        }
        
        showNotification('Registration successful! Please check your email to confirm your account.', 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    }
};

// Google login
window.handleGoogleLogin = async function() {
    if (!window.supabase || !supabase.auth || typeof supabase.auth.signInWithOAuth !== 'function') {
        showNotification('Supabase client not initialized. Please reload the page.', 'error');
        console.error('Supabase client or auth is not initialized.');
        return;
    }
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + window.location.pathname
            }
        });
        
        if (error) throw error;
        
        console.log('Google OAuth initiated:', data);
    } catch (error) {
        console.error('Google login error:', error);
        showNotification(error.message, 'error');
    }
};

// Anonymous mode
window.enableAnonymousMode = async function() {
    try {
        isAnonymous = true;
        currentUser = {
            id: 'anonymous_' + Date.now(),
            email: null,
            user_metadata: {
                display_name: 'Anonymous User',
                is_anonymous: true
            }
        };
        
        // Create anonymous profile
        await createAnonymousProfile();
        updateUIForAuthenticatedUser();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
        if (modal) {
            modal.hide();
        }
        
        showNotification('Anonymous mode enabled. You can browse and save resources without creating an account.', 'info');
    } catch (error) {
        showNotification('Error enabling anonymous mode: ' + error.message, 'error');
    }
};

// Load user profile
async function loadUserProfile() {
    if (!currentUser) return;
    
    try {
        console.log('Loading user profile for:', currentUser.id);
        
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
            userProfile = data;
            console.log('Loaded existing profile:', userProfile);
        } else {
            // Create profile if it doesn't exist
            console.log('No existing profile found, creating new one');
            await createUserProfile();
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

// Create user profile
async function createUserProfile() {
    if (!currentUser) return;
    
    try {
        // Get display name from user metadata
        let displayName = 'User';
        if (currentUser.user_metadata) {
            if (currentUser.user_metadata.full_name) {
                displayName = currentUser.user_metadata.full_name;
            } else if (currentUser.user_metadata.name) {
                displayName = currentUser.user_metadata.name;
            } else if (currentUser.user_metadata.display_name) {
                displayName = currentUser.user_metadata.display_name;
            } else if (currentUser.email) {
                displayName = currentUser.email.split('@')[0];
            }
        } else if (currentUser.email) {
            displayName = currentUser.email.split('@')[0];
        }
        
        const profileData = {
            user_id: currentUser.id,
            display_name: displayName,
            email: currentUser.email,
            is_anonymous: currentUser.user_metadata?.is_anonymous || false,
            sobriety_date: null,
            recovery_milestones: [],
            favorite_resources: [],
            preferences: {
                notifications_enabled: true,
                privacy_level: 'standard',
                theme: 'light'
            }
        };
        
        console.log('Creating user profile with data:', profileData);
        
        const { data, error } = await supabase
            .from('user_profiles')
            .insert([profileData])
            .select()
            .single();
        
        if (error) throw error;
        userProfile = data;
        console.log('Created new profile:', userProfile);
    } catch (error) {
        console.error('Error creating user profile:', error);
    }
}

// Create anonymous profile
async function createAnonymousProfile() {
    try {
        const profileData = {
            user_id: currentUser.id,
            display_name: 'Anonymous User',
            email: null,
            is_anonymous: true,
            sobriety_date: null,
            recovery_milestones: [],
            favorite_resources: [],
            preferences: {
                notifications_enabled: false,
                privacy_level: 'high',
                theme: 'light'
            }
        };
        
        const { data, error } = await supabase
            .from('user_profiles')
            .insert([profileData])
            .select()
            .single();
        
        if (error) throw error;
        userProfile = data;
    } catch (error) {
        console.error('Error creating anonymous profile:', error);
    }
}

// Update user profile
window.updateUserProfile = async function(updates) {
    if (!currentUser || !userProfile) return;
    
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .update(updates)
            .eq('user_id', currentUser.id)
            .select()
            .single();
        
        if (error) throw error;
        userProfile = data;
        updateAuthButton(); // Update the button to reflect changes
        showNotification('Profile updated successfully!', 'success');
    } catch (error) {
        showNotification('Error updating profile: ' + error.message, 'error');
    }
};

// Set sobriety date
window.setSobrietyDate = async function(date) {
    await updateUserProfile({ sobriety_date: date });
    updateSobrietyCounter();
};

// Update sobriety counter
function updateSobrietyCounter() {
    if (!userProfile?.sobriety_date) return;
    
    const sobrietyDate = new Date(userProfile.sobriety_date);
    const today = new Date();
    const daysSober = Math.floor((today - sobrietyDate) / (1000 * 60 * 60 * 24));
    
    const counterElement = document.getElementById('sobriety-counter');
    if (counterElement) {
        counterElement.textContent = `${daysSober} days sober`;
    }
    
    const counterLargeElement = document.getElementById('sobriety-counter-large');
    if (counterLargeElement) {
        counterLargeElement.textContent = `${daysSober} days sober`;
    }
}

// Logout
window.handleLogout = async function() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        currentUser = null;
        userProfile = null;
        isAnonymous = false;
        updateUIForUnauthenticatedUser();
        
        // Redirect to home page after logout
        if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
            window.location.href = '/index.html';
        }
    } catch (error) {
        showNotification('Error logging out: ' + error.message, 'error');
    }
};

// Update UI for authenticated user
function updateUIForAuthenticatedUser() {
    console.log('Updating UI for authenticated user');
    
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const userMenu = document.getElementById('user-menu');
    const userDisplayName = document.getElementById('user-display-name');
    const userName = document.getElementById('user-name');
    
    if (authSection) authSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = 'block';
    if (userMenu) userMenu.style.display = 'block';
    
    // Update display names in various places
    if (userProfile) {
        if (userDisplayName) {
            userDisplayName.textContent = userProfile.display_name;
        }
        if (userName) {
            userName.textContent = userProfile.display_name;
        }
    } else if (currentUser) {
        let displayName = 'User';
        if (currentUser.user_metadata) {
            if (currentUser.user_metadata.full_name) {
                displayName = currentUser.user_metadata.full_name;
            } else if (currentUser.user_metadata.name) {
                displayName = currentUser.user_metadata.name;
            } else if (currentUser.user_metadata.display_name) {
                displayName = currentUser.user_metadata.display_name;
            } else if (currentUser.email) {
                displayName = currentUser.email.split('@')[0];
            }
        } else if (currentUser.email) {
            displayName = currentUser.email.split('@')[0];
        }
        
        if (userDisplayName) {
            userDisplayName.textContent = displayName;
        }
        if (userName) {
            userName.textContent = displayName;
        }
    }
    
    updateSobrietyCounter();
    loadUserDashboard();
    updateAuthButton();
}

// Update UI for unauthenticated user
function updateUIForUnauthenticatedUser() {
    console.log('Updating UI for unauthenticated user');
    
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const userMenu = document.getElementById('user-menu');
    
    if (authSection) authSection.style.display = 'block';
    if (dashboardSection) dashboardSection.style.display = 'none';
    if (userMenu) userMenu.style.display = 'none';
    
    updateAuthButton();
}

// Load user dashboard
async function loadUserDashboard() {
    if (!userProfile) return;
    
    // Load favorite resources
    await loadFavoriteResources();
    
    // Load recovery milestones
    await loadRecoveryMilestones();
    
    // Load personalized recommendations
    await loadPersonalizedRecommendations();
}

// Load favorite resources
async function loadFavoriteResources() {
    if (!userProfile?.favorite_resources) return;
    
    try {
        const { data, error } = await supabase
            .from('resources')
            .select('*')
            .in('id', userProfile.favorite_resources);
        
        if (error) throw error;
        
        displayFavoriteResources(data || []);
    } catch (error) {
        console.error('Error loading favorite resources:', error);
    }
}

// Display favorite resources
function displayFavoriteResources(resources) {
    const container = document.getElementById('favorite-resources');
    if (!container) return;
    
    if (resources.length === 0) {
        container.innerHTML = '<p class="text-muted">No favorite resources yet. Start browsing to save some!</p>';
        return;
    }
    
    const html = resources.map(resource => `
        <div class="card mb-3">
            <div class="card-body">
                <h5 class="card-title">${resource.name}</h5>
                <p class="card-text">${resource.description}</p>
                <a href="${resource.url}" class="btn btn-primary btn-sm" target="_blank">Visit Resource</a>
                <button class="btn btn-outline-danger btn-sm ms-2" onclick="removeFavoriteResource('${resource.id}')">
                    <i class="bi bi-heart-fill"></i> Remove
                </button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Add favorite resource
window.addFavoriteResource = async function(resourceId) {
    if (!userProfile) {
        showNotification('Please log in to save favorite resources', 'warning');
        return;
    }
    
    try {
        const updatedFavorites = [...(userProfile.favorite_resources || []), resourceId];
        await updateUserProfile({ favorite_resources: updatedFavorites });
        showNotification('Resource added to favorites!', 'success');
    } catch (error) {
        showNotification('Error adding to favorites: ' + error.message, 'error');
    }
};

// Remove favorite resource
window.removeFavoriteResource = async function(resourceId) {
    if (!userProfile) return;
    
    try {
        const updatedFavorites = userProfile.favorite_resources.filter(id => id !== resourceId);
        await updateUserProfile({ favorite_resources: updatedFavorites });
        await loadFavoriteResources();
        showNotification('Resource removed from favorites', 'info');
    } catch (error) {
        showNotification('Error removing from favorites: ' + error.message, 'error');
    }
};

// Load recovery milestones
async function loadRecoveryMilestones() {
    if (!userProfile?.recovery_milestones) return;
    
    const container = document.getElementById('recovery-milestones');
    if (!container) return;
    
    if (userProfile.recovery_milestones.length === 0) {
        container.innerHTML = '<p class="text-muted">No milestones recorded yet. Add your first milestone!</p>';
        return;
    }
    
    const html = userProfile.recovery_milestones.map(milestone => `
        <div class="card mb-3">
            <div class="card-body">
                <h6 class="card-title">${milestone.title}</h6>
                <p class="card-text">${milestone.description}</p>
                <small class="text-muted">Achieved on ${new Date(milestone.date).toLocaleDateString()}</small>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Add recovery milestone
window.addRecoveryMilestone = async function(title, description) {
    if (!userProfile) {
        showNotification('Please log in to add milestones', 'warning');
        return;
    }
    
    try {
        const newMilestone = {
            id: Date.now().toString(),
            title,
            description,
            date: new Date().toISOString()
        };
        
        const updatedMilestones = [...(userProfile.recovery_milestones || []), newMilestone];
        await updateUserProfile({ recovery_milestones: updatedMilestones });
        await loadRecoveryMilestones();
        showNotification('Milestone added successfully!', 'success');
    } catch (error) {
        showNotification('Error adding milestone: ' + error.message, 'error');
    }
};

// Load personalized recommendations
async function loadPersonalizedRecommendations() {
    if (!userProfile) return;
    
    try {
        // Get recommendations based on user behavior
        const { data, error } = await supabase
            .from('resources')
            .select('*')
            .limit(5);
        
        if (error) throw error;
        
        displayPersonalizedRecommendations(data || []);
    } catch (error) {
        console.error('Error loading recommendations:', error);
    }
}

// Display personalized recommendations
function displayPersonalizedRecommendations(resources) {
    const container = document.getElementById('personalized-recommendations');
    if (!container) return;
    
    if (resources.length === 0) {
        container.innerHTML = '<p class="text-muted">No recommendations available at this time.</p>';
        return;
    }
    
    const html = resources.map(resource => `
        <div class="card mb-3">
            <div class="card-body">
                <h6 class="card-title">${resource.name}</h6>
                <p class="card-text">${resource.description}</p>
                <a href="${resource.url}" class="btn btn-primary btn-sm" target="_blank">Learn More</a>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Check if user is authenticated
window.isAuthenticated = function() {
    const authenticated = !!(currentUser || isAnonymous);
    console.log('isAuthenticated check:', { currentUser, isAnonymous, authenticated });
    return authenticated;
};

// Get current user
window.getCurrentUser = function() {
    return currentUser;
};

// Get user profile
window.getUserProfile = function() {
    return userProfile;
};

// Check if auth is initialized
window.isAuthInitialized = function() {
    return authInitialized;
};

// Debug function to check auth state
window.debugAuthState = function() {
    console.log('=== AUTH DEBUG INFO ===');
    console.log('currentUser:', currentUser);
    console.log('userProfile:', userProfile);
    console.log('isAnonymous:', isAnonymous);
    console.log('authInitialized:', authInitialized);
    console.log('isAuthenticated():', window.isAuthenticated());
    console.log('=======================');
};

// Export functions for global access
window.auth = {
    currentUser,
    userProfile,
    isAnonymous,
    authInitialized,
    handleLogin,
    handleRegister,
    handleGoogleLogin,
    handleLogout,
    enableAnonymousMode,
    updateUserProfile,
    setSobrietyDate,
    addFavoriteResource,
    removeFavoriteResource,
    addRecoveryMilestone,
    isAuthenticated,
    getCurrentUser,
    getUserProfile,
    isAuthInitialized,
    updateAuthButton,
    debugAuthState
};
window.authInitialized = true;
}