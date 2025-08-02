// src/js/auth.js - Enhanced Authentication System

// User state management
let currentUser = null;
let userProfile = null;
let isAnonymous = false;

// Initialize authentication
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    setupAuthListeners();
});

// Initialize authentication system
async function initializeAuth() {
    try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            currentUser = session.user;
            await loadUserProfile();
            updateUIForAuthenticatedUser();
        } else {
            updateUIForUnauthenticatedUser();
        }
    } catch (error) {
        console.error('Auth initialization error:', error);
        updateUIForUnauthenticatedUser();
    }
}

// Setup authentication event listeners
function setupAuthListeners() {
    // Auth state change listener
    supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
            currentUser = session.user;
            await loadUserProfile();
            updateUIForAuthenticatedUser();
            showNotification('Successfully logged in!', 'success');
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            userProfile = null;
            isAnonymous = false;
            updateUIForUnauthenticatedUser();
            showNotification('Successfully logged out!', 'info');
        }
    });
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
        
        showNotification('Registration successful! Please check your email to confirm your account.', 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    }
};

// Google login
window.handleGoogleLogin = async function() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/dashboard.html'
            }
        });
        
        if (error) throw error;
    } catch (error) {
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
        showNotification('Anonymous mode enabled. You can browse and save resources without creating an account.', 'info');
    } catch (error) {
        showNotification('Error enabling anonymous mode: ' + error.message, 'error');
    }
};

// Load user profile
async function loadUserProfile() {
    if (!currentUser) return;
    
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
            userProfile = data;
  } else {
            // Create profile if it doesn't exist
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
        const profileData = {
            user_id: currentUser.id,
            display_name: currentUser.user_metadata?.display_name || 'User',
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
        
        const { data, error } = await supabase
            .from('user_profiles')
            .insert([profileData])
            .select()
            .single();
        
        if (error) throw error;
        userProfile = data;
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
    } catch (error) {
        showNotification('Error logging out: ' + error.message, 'error');
    }
};

// Update UI for authenticated user
function updateUIForAuthenticatedUser() {
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const userMenu = document.getElementById('user-menu');
    const userDisplayName = document.getElementById('user-display-name');
    
    if (authSection) authSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = 'block';
    if (userMenu) userMenu.style.display = 'block';
    
    if (userDisplayName && userProfile) {
        userDisplayName.textContent = userProfile.display_name;
    }
    
    updateSobrietyCounter();
    loadUserDashboard();
}

// Update UI for unauthenticated user
function updateUIForUnauthenticatedUser() {
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const userMenu = document.getElementById('user-menu');
    
    if (authSection) authSection.style.display = 'block';
    if (dashboardSection) dashboardSection.style.display = 'none';
    if (userMenu) userMenu.style.display = 'none';
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

// Export functions for global access
window.auth = {
    currentUser,
    userProfile,
    isAnonymous,
    handleLogin,
    handleRegister,
    handleGoogleLogin,
    handleLogout,
    enableAnonymousMode,
    updateUserProfile,
    setSobrietyDate,
    addFavoriteResource,
    removeFavoriteResource,
    addRecoveryMilestone
};