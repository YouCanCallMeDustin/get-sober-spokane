// src/js/auth.js - Enhanced Authentication System

// User state management
let currentUser = null;
let userProfile = null;
let isAnonymous = false;

// Initialize global auth object
window.auth = {
    currentUser: null,
    userProfile: null,
    isAnonymous: false
};

// Wait for Supabase to be available before forcing session refresh
function forceSessionRefreshWhenReady() {
  if (typeof supabase !== 'undefined') {
    window.supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.auth.currentUser = session.user;
        console.log('Session found and user authenticated:', session.user.email);
      } else {
        window.auth.currentUser = null;
        window.auth.userProfile = null;
        console.log('No active session found');
      }
    });
  } else {
    setTimeout(forceSessionRefreshWhenReady, 100);
  }
}
forceSessionRefreshWhenReady();

// Initialize authentication
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing authentication system...');
    
    // Wait for Supabase to be available
    let authReadyTimeout;
    let maxTimeout;
    
    let attempts = 0;
    const maxAttempts = 150; // 15 seconds maximum wait time
    
    const checkAuthReady = () => {
        if (typeof supabase !== 'undefined' && supabase.auth && window.supabase) {
            console.log('Supabase ready - initializing auth system');
            clearTimeout(authReadyTimeout);
            clearTimeout(maxTimeout);
            initializeAuth();
            setupAuthListeners();
        } else {
            attempts++;
            if (attempts < maxAttempts) {
                authReadyTimeout = setTimeout(checkAuthReady, 100);
            } else {
                console.error('Auth system not ready after 15 seconds. Maximum attempts reached.');
                clearTimeout(authReadyTimeout);
                clearTimeout(maxTimeout);
            }
        }
    };
    
    // Start checking for auth readiness
    checkAuthReady();
    
    // Set a maximum timeout to prevent infinite waiting
    maxTimeout = setTimeout(() => {
        if (authReadyTimeout) {
            clearTimeout(authReadyTimeout);
            console.error('Auth system not ready after 15 seconds');
        }
    }, 15000);
});

// Initialize authentication system
async function initializeAuth() {
    try {
        console.log('Initializing authentication...');
        
        // Check for access token in URL fragment
        const urlParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = urlParams.get('access_token');
        
        if (accessToken) {
            console.log('Processing OAuth callback...');
            const { data, error } = await window.supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: null
            });
            
            if (error) {
                console.error('Error setting session from access token:', error);
            } else if (data.session) {
                console.log('OAuth session established successfully');
                currentUser = data.session.user;
                window.auth.currentUser = data.session.user;
                await loadUserProfile();
                
                if (userProfile) {
                    cleanupNavigationElements();
                    updateUIForAuthenticatedUser();
                    
                    // Notify dashboard that auth is ready
                    if (window.dashboard && typeof window.dashboard.onAuthReady === 'function') {
                        window.dashboard.onAuthReady();
                    }
                } else {
                    updateUIForUnauthenticatedUser();
                }
                
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }
        }
        
        // Check for existing session
        console.log('Checking for existing session...');
        
        try {
            console.log('About to call window.supabase.auth.getSession()...');
            console.log('window.supabase object:', window.supabase);
            console.log('window.supabase.auth object:', window.supabase.auth);
            
            // Try a simpler approach first - check if we can access the auth object
            if (!window.supabase || !window.supabase.auth) {
                console.error('window.supabase or window.supabase.auth is not available');
                updateUIForUnauthenticatedUser();
                return;
            }
            
            // Test network connectivity first (removed hardcoded credentials)
            console.log('Testing network connectivity...');
            try {
                // Use the Supabase client for connectivity test instead of hardcoded URLs
                const { data: testData, error: testError } = await window.supabase.auth.getUser();
                if (testError && testError.status) {
                    console.log('Network test response status:', testError.status);
                } else {
                    console.log('Network connectivity test successful');
                }
            } catch (networkError) {
                console.error('Network connectivity test failed:', networkError);
            }
            
            // Try a simpler session check without Promise.race
            console.log('Starting simple session check...');
            
            // Try both async/await and promise approaches
            try {
                const { data: { session }, error: sessionError } = await window.supabase.auth.getSession();
                
                console.log('window.supabase.auth.getSession() completed');
                
                if (sessionError) {
                    console.error('Error getting session:', sessionError);
                    updateUIForUnauthenticatedUser();
                    return;
                }
                
                console.log('Session check completed. Session exists:', !!session);
                
                if (session) {
                    currentUser = session.user;
                    window.auth.currentUser = session.user;
                    console.log('User session found:', session.user.email);
                    console.log('Loading user profile...');
                    await loadUserProfile();
                    
                    if (userProfile) {
                        console.log('Profile loaded successfully, updating UI...');
                        cleanupNavigationElements();
                        updateUIForAuthenticatedUser();
                        
                        if (window.dashboard && typeof window.dashboard.onAuthReady === 'function') {
                            window.dashboard.onAuthReady();
                        }
                    } else {
                        console.log('Profile not loaded, showing unauthenticated UI');
                        updateUIForUnauthenticatedUser();
                    }
                } else {
                    console.log('No session found - user not authenticated');
                    window.auth.currentUser = null;
                    window.auth.userProfile = null;
                    window.auth.isAnonymous = false;
                    updateUIForUnauthenticatedUser();
                }
            } catch (asyncError) {
                console.error('Async session check failed, trying promise approach:', asyncError);
                
                // Try promise approach as fallback
                window.supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
                    console.log('Promise-based session check completed');
                    
                    if (sessionError) {
                        console.error('Error getting session:', sessionError);
                        updateUIForUnauthenticatedUser();
                        return;
                    }
                    
                    console.log('Session check completed. Session exists:', !!session);
                    
                    if (session) {
                        currentUser = session.user;
                        window.auth.currentUser = session.user;
                        console.log('User session found:', session.user.email);
                        loadUserProfile().then(() => {
                            if (userProfile) {
                                console.log('Profile loaded successfully, updating UI...');
                                cleanupNavigationElements();
                                updateUIForAuthenticatedUser();
                                
                                if (window.dashboard && typeof window.dashboard.onAuthReady === 'function') {
                                    window.dashboard.onAuthReady();
                                }
                            } else {
                                console.log('Profile not loaded, showing unauthenticated UI');
                                updateUIForUnauthenticatedUser();
                            }
                        });
                    } else {
                        console.log('No session found - user not authenticated');
                        window.auth.currentUser = null;
                        window.auth.userProfile = null;
                        window.auth.isAnonymous = false;
                        updateUIForUnauthenticatedUser();
                    }
                }).catch((promiseError) => {
                    console.error('Promise-based session check also failed:', promiseError);
                    updateUIForUnauthenticatedUser();
                });
            }
        } catch (sessionCheckError) {
            console.error('Unexpected error during session check:', sessionCheckError);
            console.error('Error stack:', sessionCheckError.stack);
            updateUIForUnauthenticatedUser();
        }
    } catch (error) {
        console.error('Auth initialization error:', error);
        console.error('Error stack:', error.stack);
        updateUIForUnauthenticatedUser();
    }
}

// Setup authentication event listeners
function setupAuthListeners() {
    // Auth state change listener
    window.supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
            currentUser = session.user;
            // Update global auth object
            window.auth.currentUser = session.user;
            await loadUserProfile();
            
            // Only update UI if profile was loaded successfully
            if (userProfile) {
                console.log('Profile loaded after sign in, updating UI and notifying dashboard');
                updateUIForAuthenticatedUser();
                showNotification('Successfully logged in!', 'success');
                
                // Notify dashboard that auth is ready
                if (window.dashboard && typeof window.dashboard.onAuthReady === 'function') {
                    console.log('Notifying dashboard that auth is ready');
                    window.dashboard.onAuthReady();
                } else {
                    console.log('Dashboard not available or onAuthReady not a function');
                    console.log('window.dashboard:', window.dashboard);
                }
            } else {
                console.log('Profile not loaded after sign in');
                showNotification('Error loading user profile', 'error');
            }
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            userProfile = null;
            isAnonymous = false;
            // Update global auth object
            window.auth.currentUser = null;
            window.auth.userProfile = null;
            window.auth.isAnonymous = false;
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
    if (!currentUser) {
        console.log('No current user found, cannot load profile');
        return;
    }
    
    console.log('Loading user profile for user ID:', currentUser.id);
    
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
        
        console.log('Profile query result:', { data, error });
        
        if (error) {
            console.log('Profile query error:', error);
            if (error.code === 'PGRST116') {
                // No profile found, create one
                console.log('No profile found, creating new profile');
                await createUserProfile();
            } else {
                throw error;
            }
        } else if (data) {
            console.log('Profile loaded successfully:', data);
            userProfile = data;
            // Update the global auth object
            window.auth.userProfile = data;
            window.auth.currentUser = currentUser;
            console.log('Global auth object updated with profile');
        } else {
            console.log('No data returned, creating new profile');
            await createUserProfile();
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        showNotification('Error loading user data. Please refresh the page.', 'error');
    }
}

// Create user profile
async function createUserProfile() {
    if (!currentUser) {
        console.log('No current user found, cannot create profile');
        return;
    }
    
    console.log('Creating user profile for user ID:', currentUser.id);
    
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
        
        console.log('Profile data to insert:', profileData);
        
        const { data, error } = await supabase
            .from('user_profiles')
            .insert([profileData])
            .select()
            .single();
        
        console.log('Profile creation result:', { data, error });
        
        if (error) {
            console.error('Database error creating profile:', error);
            throw error;
        }
        
        if (data) {
            console.log('Profile created successfully:', data);
            userProfile = data;
            // Update the global auth object
            window.auth.userProfile = data;
            window.auth.currentUser = currentUser;
            console.log('Global auth object updated with created profile');
        } else {
            console.error('No data returned from profile creation');
            throw new Error('No data returned from profile creation');
        }
    } catch (error) {
        console.error('Error creating user profile:', error);
        showNotification('Error creating user profile: ' + error.message, 'error');
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
    console.log('updateSobrietyCounter called');
    
    // Try to get userProfile from multiple sources
    let profile = userProfile;
    if (!profile && window.auth) {
        profile = window.auth.userProfile;
    }
    
    console.log('Profile used for sobriety counter:', profile);
    
    if (!profile?.sobriety_date) {
        console.log('No sobriety date found, returning early');
        return;
    }
    
    console.log('Sobriety date from profile:', profile.sobriety_date);
    
    const sobrietyDate = new Date(profile.sobriety_date);
    const today = new Date();
    const daysSober = Math.floor((today - sobrietyDate) / (1000 * 60 * 60 * 24));
    
    console.log('Calculated days sober:', daysSober);
    
    const counterElement = document.getElementById('sobriety-counter');
    if (counterElement) {
        counterElement.textContent = `${daysSober} days sober`;
        console.log('Updated sobriety counter element');
    } else {
        console.log('Sobriety counter element not found');
    }
}

// Logout
window.handleLogout = async function() {
    try {
        console.log('Logging out...');
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        currentUser = null;
        userProfile = null;
        isAnonymous = false;
        
        // Update global auth object
        if (window.auth) {
            window.auth.currentUser = null;
            window.auth.userProfile = null;
            window.auth.isAnonymous = false;
        }
        
        updateUIForUnauthenticatedUser();
        showNotification('Successfully logged out!', 'info');
        
        // Redirect to home page if on dashboard
        if (window.location.pathname.includes('dashboard')) {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error logging out:', error);
        showNotification('Error logging out: ' + error.message, 'error');
    }
};

// Update UI for authenticated user
function updateUIForAuthenticatedUser() {
    console.log('Updating UI for authenticated user');
    
    // Check if we're on a page with specific auth sections
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const userMenu = document.getElementById('user-menu');
    const userDisplayName = document.getElementById('user-display-name');
    
    // Update dashboard-specific elements if they exist
    if (authSection) authSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = 'block';
    if (userMenu) userMenu.style.display = 'block';
    
    // Update user display name if it exists
    if (userDisplayName && userProfile) {
        userDisplayName.textContent = userProfile.display_name;
    }
    
    // Always update navigation for authenticated user
    updateNavigationForAuthenticatedUser();
    
    // Update dashboard sidebar user info if on dashboard
    updateDashboardUserInfo();
    
    // Update sobriety counter if it exists
    updateSobrietyCounter();
    
    // Load user dashboard if on dashboard page
    if (window.location.pathname.includes('dashboard')) {
        loadUserDashboard();
    }
    
    console.log('UI updated for authenticated user');
}

// Update navigation for authenticated user
function updateNavigationForAuthenticatedUser() {
    console.log('Updating navigation for authenticated user');
    
    const userPhoto = currentUser?.user_metadata?.avatar_url || '/assets/img/logo.png';
    const userName = userProfile?.display_name || currentUser?.user_metadata?.full_name || 'User';
    
    // Find the navbar-nav container
    const navbarNav = document.querySelector('.navbar-nav');
    if (!navbarNav) {
        console.log('No navbar-nav found, skipping navigation update');
        return;
    }
    
    // Remove ALL existing auth-related items (Login, Dashboard, and any existing user dropdowns)
    const allNavItems = navbarNav.querySelectorAll('.nav-item');
    allNavItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        const dropdown = item.querySelector('.dropdown');
        
        // Remove Login button, Dashboard link, or any existing user dropdowns
        if (link && (link.textContent.trim() === 'Login' || link.textContent.trim() === 'Dashboard')) {
            console.log('Removing item:', link.textContent.trim());
            item.remove();
        } else if (dropdown) {
            console.log('Removing existing dropdown');
            item.remove();
        }
    });
    
    // Also remove any login buttons that might be outside nav-items
    const loginButtons = document.querySelectorAll('a[href="#"], button, .btn');
    loginButtons.forEach(btn => {
        if (btn.textContent.trim() === 'Login') {
            console.log('Removing login button');
            btn.remove();
        }
    });
    
    // Check if user dropdown already exists
    const existingUserDropdown = navbarNav.querySelector('.nav-item.ms-auto');
    if (existingUserDropdown) {
        console.log('User dropdown already exists, updating content');
        const dropdownToggle = existingUserDropdown.querySelector('.dropdown-toggle');
        const dropdownImage = existingUserDropdown.querySelector('img');
        const dropdownSpan = existingUserDropdown.querySelector('span');
        
        if (dropdownImage) dropdownImage.src = userPhoto;
        if (dropdownSpan) dropdownSpan.textContent = userName;
        return;
    }
    
    // Add user dropdown to the right side
    const userDropdownItem = document.createElement('li');
    userDropdownItem.className = 'nav-item ms-auto';
    userDropdownItem.innerHTML = `
        <div class="dropdown">
            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="${userPhoto}" alt="${userName}" class="rounded-circle me-2" width="24" height="24" style="object-fit: cover;">
                <span>${userName}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="/dashboard.html">Dashboard</a></li>
                <li><a class="dropdown-item" href="/dashboard.html#profile">Profile</a></li>
                <li><a class="dropdown-item" href="/dashboard.html#settings">Settings</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" onclick="handleLogout()">Logout</a></li>
            </ul>
        </div>
    `;
    
    navbarNav.appendChild(userDropdownItem);
    console.log('Added user dropdown to navigation');
}

// Update dashboard sidebar user info
function updateDashboardUserInfo() {
    const userPhoto = currentUser?.user_metadata?.avatar_url || '/assets/img/logo.png';
    const userName = userProfile?.display_name || currentUser?.user_metadata?.full_name || 'User';
    
    // Update sidebar user display name
    const sidebarUserName = document.getElementById('user-display-name');
    if (sidebarUserName) {
        sidebarUserName.textContent = userName;
    }
    
    // Update sidebar user photo
    const sidebarUserPhotos = document.querySelectorAll('.sidebar img.rounded-circle');
    sidebarUserPhotos.forEach(img => {
        img.src = userPhoto;
        img.alt = userName;
    });
    
    // Update dropdown user info
    const dropdownUserName = document.getElementById('user-name');
    if (dropdownUserName) {
        dropdownUserName.textContent = userName;
    }
    
    const dropdownUserPhotos = document.querySelectorAll('.dropdown img.rounded-circle');
    dropdownUserPhotos.forEach(img => {
        img.src = userPhoto;
        img.alt = userName;
    });
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
    
    // Restore original navigation
    restoreOriginalNavigation();
}

// Clean up navigation elements
function cleanupNavigationElements() {
    console.log('Cleaning up navigation elements');
    
    // Remove any duplicate user dropdowns
    const userDropdowns = document.querySelectorAll('.nav-item .dropdown');
    if (userDropdowns.length > 1) {
        console.log('Found multiple user dropdowns, removing duplicates');
        // Keep only the first one, remove the rest
        for (let i = 1; i < userDropdowns.length; i++) {
            userDropdowns[i].closest('.nav-item').remove();
        }
    }
    
    // Remove any login buttons
    const loginElements = document.querySelectorAll('a, button, .btn');
    loginElements.forEach(element => {
        if (element.textContent.trim() === 'Login') {
            console.log('Removing login element:', element);
            element.remove();
        }
    });
}

// Restore original navigation
function restoreOriginalNavigation() {
    console.log('Restoring original navigation');
    
    const navbarNav = document.querySelector('.navbar-nav');
    if (!navbarNav) return;
    
    // Remove any existing user dropdown
    const existingUserDropdown = navbarNav.querySelector('.nav-item.ms-auto');
    if (existingUserDropdown) {
        existingUserDropdown.remove();
    }
    
    // Add back the original Dashboard link
    const dashboardItem = document.createElement('li');
    dashboardItem.className = 'nav-item';
    dashboardItem.innerHTML = `
        <a class="nav-link" href="/dashboard.html">Dashboard</a>
    `;
    
    // Add it before the Contact link (second to last)
    const contactItem = navbarNav.querySelector('.nav-item:last-child');
    if (contactItem) {
        navbarNav.insertBefore(dashboardItem, contactItem);
    } else {
        navbarNav.appendChild(dashboardItem);
    }
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

// Test database connection
window.testDatabaseConnection = async function() {
    try {
        console.log('Testing database connection...');
        
        // Test basic query
        const { data, error } = await supabase
            .from('user_profiles')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('Database connection test failed:', error);
            showNotification('Database connection failed: ' + error.message, 'error');
            return false;
        }
        
        console.log('Database connection test successful');
        showNotification('Database connection successful!', 'success');
        return true;
    } catch (error) {
        console.error('Database connection test error:', error);
        showNotification('Database connection test error: ' + error.message, 'error');
        return false;
    }
};

// Test authentication status
window.testAuthStatus = async function() {
    try {
        console.log('=== Authentication Status Test ===');
        
        // Check Supabase client
        if (typeof supabase === 'undefined') {
            console.log('❌ Supabase library not loaded');
            return false;
        }
        console.log('✅ Supabase library loaded');
        
        // Check session
        const { data: { session }, error } = await window.supabase.auth.getSession();
        if (error) {
            console.log('❌ Error getting session:', error);
            return false;
        }
        
        if (session) {
            console.log('✅ User authenticated:', session.user.email);
            console.log('   User ID:', session.user.id);
            console.log('   Provider:', session.user.app_metadata?.provider);
            console.log('   Session expires:', new Date(session.expires_at * 1000).toLocaleString());
        } else {
            console.log('❌ No active session');
        }
        
        // Check global auth object
        if (window.auth) {
            console.log('✅ Global auth object available');
            console.log('   Current user:', window.auth.currentUser?.email || 'null');
            console.log('   User profile:', window.auth.userProfile ? 'loaded' : 'not loaded');
        } else {
            console.log('❌ Global auth object not available');
        }
        
        // Check localStorage tokens
        const authTokens = Object.keys(localStorage).filter(k => k.includes('sb-') && k.includes('auth-token'));
        console.log('📦 Auth tokens in localStorage:', authTokens.length);
        
        console.log('=== End Test ===');
        return !!session;
    } catch (error) {
        console.error('❌ Auth status test failed:', error);
        return false;
    }
};

// Force UI update for current auth state
window.forceAuthUIUpdate = async function() {
    try {
        console.log('=== Forcing Auth UI Update ===');
        
        // Check current session
        const { data: { session }, error } = await window.supabase.auth.getSession();
        
        if (error) {
            console.error('Error getting session:', error);
            return false;
        }
        
        if (session) {
            console.log('✅ Session found, updating UI for authenticated user');
            currentUser = session.user;
            window.auth.currentUser = session.user;
            
            // Load profile if not already loaded
            if (!userProfile) {
                await loadUserProfile();
            }
            
            // Update UI
            updateUIForAuthenticatedUser();
            return true;
        } else {
            console.log('❌ No session found, updating UI for unauthenticated user');
            currentUser = null;
            userProfile = null;
            window.auth.currentUser = null;
            window.auth.userProfile = null;
            updateUIForUnauthenticatedUser();
            return false;
        }
    } catch (error) {
        console.error('Error in forceAuthUIUpdate:', error);
        return false;
    }
};

// Test Supabase client functionality
window.testSupabaseClient = async function() {
    try {
        console.log('=== Testing Supabase Client ===');
        
        // Test 1: Check if supabase is available
        if (typeof supabase === 'undefined') {
            console.log('❌ Supabase library not loaded');
            return false;
        }
        console.log('✅ Supabase library loaded');
        
        // Test 2: Check if auth is available
        if (!window.supabase?.auth) {
            console.log('❌ window.supabase.auth not available');
            return false;
        }
        console.log('✅ window.supabase.auth available');
        
        // Test 3: Test basic auth call
        console.log('Testing basic auth call...');
        const { data, error } = await window.supabase.auth.getSession();
        
        if (error) {
            console.log('❌ Error in basic auth call:', error);
            return false;
        }
        
        console.log('✅ Basic auth call successful');
        console.log('Session data:', data);
        
        return true;
    } catch (error) {
        console.error('❌ Supabase client test failed:', error);
        return false;
    }
};

// Test basic Supabase functionality
window.testBasicSupabase = async function() {
    try {
        console.log('=== Testing Basic Supabase Functionality ===');
        
        // Test 1: Check if client exists
        if (!window.supabase) {
            console.log('❌ window.supabase not available');
            return false;
        }
        console.log('✅ window.supabase available');
        
        // Test 2: Check if auth exists
        if (!window.supabase.auth) {
            console.log('❌ window.supabase.auth not available');
            return false;
        }
        console.log('✅ window.supabase.auth available');
        
        // Test 3: Try a simple auth call with timeout
        console.log('Testing simple auth call...');
        const authPromise = window.supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Test timeout')), 3000)
        );
        
        const result = await Promise.race([authPromise, timeoutPromise]);
        console.log('✅ Basic auth call successful:', result);
        
        return true;
    } catch (error) {
        console.error('❌ Basic Supabase test failed:', error);
        return false;
    }
};

// Test Supabase service connectivity
window.testSupabaseService = async function() {
    try {
        console.log('=== Testing Supabase Service Connectivity ===');
        
        // Test 1: Basic fetch to Supabase URL
        console.log('Testing basic connectivity to Supabase...');
        const response = await fetch('https://iquczuhmkemjytrqnbxg.supabase.co/rest/v1/', {
            method: 'GET',
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdWN6dWhta2Vtanl0cnFuYnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMDMzMjcsImV4cCI6MjA2OTY3OTMyN30.FFzZFBUAM1ZgQSTlzPNSuJIikUiQkvSBKvc19wdzulk'
            }
        });
        
        console.log('Supabase service response status:', response.status);
        
        if (response.ok) {
            console.log('✅ Supabase service is accessible');
        } else {
            console.log('❌ Supabase service returned error:', response.status);
        }
        
        return response.ok;
    } catch (error) {
        console.error('❌ Supabase service connectivity test failed:', error);
        return false;
    }
};

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
    addRecoveryMilestone,
    testDatabaseConnection,
    testAuthStatus,
    forceAuthUIUpdate,
    testSupabaseClient,
    testBasicSupabase,
    testSupabaseService
};