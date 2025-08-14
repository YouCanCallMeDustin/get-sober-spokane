// Dashboard Functionality with Supabase Integration
// Requires: js/config.js and js/auth-guard.js to be loaded first

// Dashboard state management
let dashboardData = {
    posts: [],
    comments: [],
    milestones: [],
    resources: [],
    profile: {
        display_name: '',
        email: '',
        phone: '',
        bio: '',
        recovery_goals: '',
        support_network: '',
        emergency_contacts: [],
        sobriety_date: null,
        privacy_level: 'standard',
        theme: 'light'
    },
    preferences: {
        email_notifications: false,
        privacy_level: 'standard'
    }
};

let recoveryChart = null;
let currentUser = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Wait for Supabase to be ready
        await window.initSupabaseWithRetry();
        
        // Get current user
        const { data: { user }, error } = await window.supabaseClient.auth.getUser();
        if (error || !user) {
            console.error('No authenticated user found');
            window.location.href = 'login.html';
            return;
        }
        
        currentUser = user;
        console.log('Current user:', currentUser);
        
        // Initialize dashboard with user data
        await initializeDashboard();
        setupDashboardListeners();
        setupMobileSidebar();
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        showNotification('Error loading dashboard: ' + error.message, 'error');
    }
});

// Initialize dashboard system
async function initializeDashboard() {
    try {
        await loadDashboardData();
        setupDashboardUI();
        updateSobrietyDisplay();
        initializeCharts();
        updateDashboardCounts();
        
        // Handle mobile responsiveness
        handleMobileLayout();
        window.addEventListener('resize', handleMobileLayout);
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        showNotification('Error loading dashboard: ' + error.message, 'error');
    }
}

// Setup dashboard event listeners
function setupDashboardListeners() {
    // Initialize Bootstrap dropdowns
    const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
    const dropdownList = [...dropdownElementList].map(dropdownToggleEl => new bootstrap.Dropdown(dropdownToggleEl));
    
    // Tab navigation
    const tabLinks = document.querySelectorAll('[data-bs-toggle="pill"]');
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const target = this.getAttribute('href');
            loadTabContent(target.substring(1));
            
            // Close mobile sidebar after tab change
            if (window.innerWidth < 768) {
                const sidebar = document.getElementById('sidebar');
                const sidebarBackdrop = document.getElementById('sidebarBackdrop');
                if (sidebar && sidebarBackdrop) {
                    sidebar.classList.remove('show');
                    sidebarBackdrop.classList.remove('show');
                }
            }
        });
    });
    
    // Form submissions
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfile();
        });
    }
    
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveSettings();
        });
    }
}

// Setup mobile sidebar functionality
function setupMobileSidebar() {
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');

    if (mobileNavToggle && sidebar && sidebarBackdrop) {
        // Toggle sidebar
        mobileNavToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
            sidebarBackdrop.classList.toggle('show');
            
            // Update toggle button icon
            const icon = this.querySelector('i');
            if (icon) {
                if (sidebar.classList.contains('show')) {
                    icon.className = 'bi bi-x-lg';
                } else {
                    icon.className = 'bi bi-list';
                }
            }
        });

        // Close sidebar when clicking backdrop
        sidebarBackdrop.addEventListener('click', function() {
            sidebar.classList.remove('show');
            sidebarBackdrop.classList.remove('show');
            
            // Reset toggle button icon
            if (mobileNavToggle) {
                const icon = mobileNavToggle.querySelector('i');
                if (icon) {
                    icon.className = 'bi bi-list';
                }
            }
        });

        // Close sidebar when clicking on nav links on mobile
        const sidebarNavLinks = sidebar.querySelectorAll('.nav-link');
        sidebarNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth < 768) {
                    sidebar.classList.remove('show');
                    sidebarBackdrop.classList.remove('show');
                    
                    // Reset toggle button icon
                    if (mobileNavToggle) {
                        const icon = mobileNavToggle.querySelector('i');
                        if (icon) {
                            icon.className = 'bi bi-list';
                        }
                    }
                }
            });
        });

        // Close sidebar on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
                sidebarBackdrop.classList.remove('show');
                
                // Reset toggle button icon
                if (mobileNavToggle) {
                    const icon = mobileNavToggle.querySelector('i');
                    if (icon) {
                        icon.className = 'bi bi-list';
                    }
                }
            }
        });
    }
}

// Handle mobile layout adjustments
function handleMobileLayout() {
    const isMobile = window.innerWidth < 768;
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebar && mainContent) {
        if (isMobile) {
            // On mobile, ensure sidebar is hidden by default
            sidebar.classList.remove('show');
            mainContent.style.marginLeft = '0';
            
            // Hide backdrop
            const sidebarBackdrop = document.getElementById('sidebarBackdrop');
            if (sidebarBackdrop) {
                sidebarBackdrop.classList.remove('show');
            }
        } else {
            // On desktop, show sidebar and adjust main content
            mainContent.style.marginLeft = '250px';
        }
    }
    
    // Adjust chart sizes for mobile
    if (recoveryChart) {
        recoveryChart.resize();
    }
}

// Setup dashboard UI
function setupDashboardUI() {
    // Set current date for sobriety date input
    const sobrietyDateInput = document.getElementById('sobriety-date');
    if (sobrietyDateInput) {
        sobrietyDateInput.max = new Date().toISOString().split('T')[0];
    }
    
    // Load user profile data into forms
    loadProfileData();
    loadSettingsData();
    
    // Initialize mobile-specific UI elements
    initializeMobileUI();
}

// Initialize mobile-specific UI elements
function initializeMobileUI() {
    // Ensure proper touch targets on mobile
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        if (window.innerWidth < 768) {
            button.style.minHeight = '44px'; // iOS recommended minimum
        }
    });
    
    // Improve form inputs for mobile
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        if (window.innerWidth < 768) {
            // Prevent zoom on iOS
            input.style.fontSize = '16px';
        }
    });
}

// Load dashboard data from Supabase
async function loadDashboardData() {
    console.log('Loading dashboard data from Supabase...');
    
    try {
        if (!currentUser) {
            throw new Error('No authenticated user');
        }

        // Load profile data from Supabase (using existing profiles table)
        const { data: profileData, error: profileError } = await window.supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error loading profile:', profileError);
        }

        if (profileData) {
            // Update dashboard data with profile info
            dashboardData.profile = {
                ...dashboardData.profile,
                display_name: profileData.display_name || profileData.name || '',
                email: profileData.email || currentUser.email || '',
                phone: profileData.phone || '',
                bio: profileData.bio || profileData.description || '',
                recovery_goals: profileData.recovery_goals || profileData.goals || '',
                support_network: profileData.support_network || profileData.network || '',
                emergency_contacts: profileData.emergency_contacts || profileData.contacts || [],
                sobriety_date: profileData.sobriety_date || profileData.sobrietyDate || null,
                privacy_level: profileData.privacy_level || profileData.privacy || 'standard',
                theme: profileData.theme || 'light'
            };
            
            // Update preferences
            dashboardData.preferences = {
                ...dashboardData.preferences,
                privacy_level: profileData.privacy_level || profileData.privacy || 'standard'
            };
        }

        // Load milestones from Supabase (using existing recovery_milestones table)
        const { data: milestonesData, error: milestonesError } = await window.supabaseClient
            .from('recovery_milestones')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('date', { ascending: false });

        if (milestonesError) {
            console.error('Error loading milestones:', milestonesError);
        } else if (milestonesData) {
            dashboardData.milestones = milestonesData;
        }

        console.log('Dashboard data loaded from Supabase:', dashboardData);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading data: ' + error.message, 'error');
    }
}

// Load profile data into forms
function loadProfileData() {
    const profile = dashboardData.profile;
    
    // Populate profile form fields - using correct IDs from HTML
    const displayNameInput = document.getElementById('profile-display-name');
    if (displayNameInput) displayNameInput.value = profile.display_name || '';
    
    const emailInput = document.getElementById('profile-email');
    if (emailInput) emailInput.value = profile.email || '';
    
    const bioInput = document.getElementById('profile-bio');
    if (bioInput) bioInput.value = profile.bio || '';
    
    const privacyInput = document.getElementById('profile-privacy');
    if (privacyInput) privacyInput.value = profile.privacy_level || 'standard';
    
    const themeInput = document.getElementById('profile-theme');
    if (themeInput) themeInput.value = profile.theme || 'light';
    
    const notificationsInput = document.getElementById('profile-notifications');
    if (notificationsInput) notificationsInput.checked = profile.email_notifications || false;
    
    // Set sobriety date if available
    const sobrietyInput = document.getElementById('sobriety-date');
    if (sobrietyInput && profile.sobriety_date) {
        sobrietyInput.value = profile.sobriety_date;
    }
}

// Load settings data into forms
function loadSettingsData() {
    const preferences = dashboardData.preferences;
    
    // Populate settings form fields
    const emailCommunity = document.getElementById('email-community');
    if (emailCommunity) emailCommunity.checked = preferences.email_notifications || false;
    
    const emailResources = document.getElementById('email-resources');
    if (emailResources) emailResources.checked = preferences.email_notifications || false;
    
    const emailStories = document.getElementById('email-stories');
    if (emailStories) emailStories.checked = preferences.email_notifications || false;
    
    // Privacy settings
    const privacyPublic = document.getElementById('privacy-public');
    const privacyStandard = document.getElementById('privacy-standard');
    const privacyHigh = document.getElementById('privacy-high');
    
    if (privacyPublic && privacyStandard && privacyHigh) {
        if (preferences.privacy_level === 'public') privacyPublic.checked = true;
        else if (preferences.privacy_level === 'high') privacyHigh.checked = true;
        else privacyStandard.checked = true;
    }
}

// Update profile with Supabase integration
async function updateProfile() {
    try {
        if (!currentUser) {
            throw new Error('No authenticated user');
        }

        // Get form data using correct field IDs
        const displayName = document.getElementById('profile-display-name')?.value || '';
        const bio = document.getElementById('profile-bio')?.value || '';
        const privacyLevel = document.getElementById('profile-privacy')?.value || 'standard';
        const theme = document.getElementById('profile-theme')?.value || 'light';
        const notifications = document.getElementById('profile-notifications')?.checked || false;

        const updates = {
            display_name: displayName,
            bio: bio,
            privacy_level: privacyLevel,
            theme: theme,
            email_notifications: notifications,
            updated_at: new Date().toISOString()
        };

        // Update profile in Supabase
        const { data, error } = await window.supabaseClient
            .from('profiles')
            .upsert({
                id: currentUser.id,
                email: currentUser.email,
                ...updates
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Update local data
        dashboardData.profile = { ...dashboardData.profile, ...updates };
        
        showNotification('Profile updated successfully!', 'success');
        loadProfileData(); // Refresh the form
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Error updating profile: ' + error.message, 'error');
    }
}

// Save settings with Supabase integration
async function saveSettings() {
    try {
        if (!currentUser) {
            throw new Error('No authenticated user');
        }

        const emailCommunity = document.getElementById('email-community')?.checked || false;
        const emailResources = document.getElementById('email-resources')?.checked || false;
        const emailStories = document.getElementById('email-stories')?.checked || false;
        
        const privacyPublic = document.getElementById('privacy-public')?.checked || false;
        const privacyStandard = document.getElementById('privacy-standard')?.checked || false;
        const privacyHigh = document.getElementById('privacy-high')?.checked || false;
        
        let privacyLevel = 'standard';
        if (privacyPublic) privacyLevel = 'public';
        else if (privacyHigh) privacyLevel = 'high';
        
        const updates = {
            email_notifications: emailCommunity || emailResources || emailStories,
            privacy_level: privacyLevel,
            updated_at: new Date().toISOString()
        };
        
        // Update profile in Supabase
        const { data, error } = await window.supabaseClient
            .from('profiles')
            .upsert({
                id: currentUser.id,
                email: currentUser.email,
                ...updates
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Update local data
        dashboardData.preferences = { ...dashboardData.preferences, ...updates };
        dashboardData.profile.privacy_level = privacyLevel;
        
        showNotification('Settings saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Error saving settings: ' + error.message, 'error');
    }
}

// Set sobriety date with Supabase integration
async function setSobrietyDate(date) {
    try {
        if (!currentUser) {
            throw new Error('No authenticated user');
        }

        // If no date provided, read from input
        let selectedDate = date;
        if (!selectedDate) {
            const input = document.getElementById('sobriety-date');
            selectedDate = input ? input.value : null;
        }

        if (!selectedDate) {
            showNotification('Please choose a sobriety date first.', 'warning');
            return;
        }

        // Prevent future dates
        const picked = new Date(selectedDate);
        const today = new Date();
        if (picked.getTime() > today.getTime()) {
            showNotification('Sobriety date cannot be in the future.', 'warning');
            return;
        }

        // Update profile in Supabase
        const { data, error } = await window.supabaseClient
            .from('profiles')
            .upsert({
                id: currentUser.id,
                email: currentUser.email,
                sobriety_date: selectedDate,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Update local data
        dashboardData.profile.sobriety_date = selectedDate;
        
        // Update UI
        updateSobrietyDisplay();
        showNotification('Sobriety date updated!', 'success');
    } catch (error) {
        console.error('Error setting sobriety date:', error);
        showNotification('Error setting sobriety date: ' + error.message, 'error');
    }
}

// Add recovery milestone with Supabase integration
async function addRecoveryMilestone(title, description, date) {
    try {
        if (!currentUser) {
            throw new Error('No authenticated user');
        }

        const milestone = {
            user_id: currentUser.id,
            title: title,
            description: description,
            date: date || new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
        };
        
        // Insert milestone into Supabase (using existing recovery_milestones table)
        const { data, error } = await window.supabaseClient
            .from('recovery_milestones')
            .insert(milestone)
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Add to local data
        dashboardData.milestones.unshift(data);
        
        // Update UI
        updateMilestonesDisplay();
        updateDashboardCounts();
        showNotification('Milestone added successfully!', 'success');
    } catch (error) {
        console.error('Error adding milestone:', error);
        showNotification('Error adding milestone: ' + error.message, 'error');
    }
}

// Save dashboard data to localStorage (deprecated - now using Supabase)
function saveDashboardData() {
    console.warn('saveDashboardData is deprecated - data is now saved to Supabase');
}

// Update sobriety display
function updateSobrietyDisplay() {
    const sobrietyDate = dashboardData.profile.sobriety_date;
    if (!sobrietyDate) return;
    
    const startDate = new Date(sobrietyDate);
    const today = new Date();
    const timeDiff = today.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // Update all known counters in the UI
    const sobrietyDisplay = document.getElementById('sobriety-display');
    if (sobrietyDisplay) sobrietyDisplay.textContent = `${daysDiff} days`;
    const counterSmall = document.getElementById('sobriety-counter');
    if (counterSmall) counterSmall.textContent = `${daysDiff} days`;
    const counterLarge = document.getElementById('sobriety-counter-large');
    if (counterLarge) counterLarge.textContent = `${daysDiff} days sober`;
    
    // Update chart if available
    if (recoveryChart) {
        updateRecoveryChart();
    }
}

// Update milestones display
function updateMilestonesDisplay() {
    // Support both container IDs used in the HTML
    const milestonesContainer = document.getElementById('recovery-milestones') || document.getElementById('milestones-container');
    if (!milestonesContainer) return;
    
    const milestones = dashboardData.milestones;
    if (milestones.length === 0) {
        milestonesContainer.innerHTML = '<p class="text-muted">No milestones yet. Add your first one!</p>';
        return;
    }
    
    const milestonesHTML = milestones.map(milestone => `
        <div class="card mb-3">
            <div class="card-body">
                <h6 class="card-title">${milestone.title}</h6>
                <p class="card-text">${milestone.description}</p>
                <small class="text-muted">Achieved on ${milestone.date}</small>
            </div>
        </div>
    `).join('');
    
    milestonesContainer.innerHTML = milestonesHTML;
}

// Initialize charts
function initializeCharts() {
    // Support both legacy and current IDs
    const ctx = document.getElementById('recovery-chart') || document.getElementById('recoveryChart');
    if (!ctx) return;
    
    recoveryChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Recovery Progress',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    updateRecoveryChart();
}

// Update recovery chart
function updateRecoveryChart() {
    if (!recoveryChart) return;
    
    const sobrietyDate = dashboardData.profile.sobriety_date;
    if (!sobrietyDate) return;
    
    const startDate = new Date(sobrietyDate);
    const today = new Date();
    const daysDiff = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    
    // Generate sample data for the chart
    const labels = [];
    const data = [];
    
    for (let i = 0; i <= Math.min(daysDiff, 30); i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        labels.push(date.toLocaleDateString());
        data.push(i); // Simple linear progression
    }
    
    recoveryChart.data.labels = labels;
    recoveryChart.data.datasets[0].data = data;
    recoveryChart.update();
}

// Update dashboard counts
function updateDashboardCounts() {
    const milestonesCount = document.getElementById('milestones-count');
    if (milestonesCount) {
        milestonesCount.textContent = dashboardData.milestones.length;
    }
    
    const resourcesCount = document.getElementById('resources-count') || document.getElementById('favorites-count');
    if (resourcesCount) resourcesCount.textContent = dashboardData.resources.length;
}

// Load tab content
function loadTabContent(tabName) {
    switch (tabName) {
        case 'profile':
            loadProfileData();
            break;
        case 'settings':
            loadSettingsData();
            break;
        case 'milestones':
            updateMilestonesDisplay();
            break;
        case 'resources':
            // Load resources tab content
            break;
    }
}

// Submit milestone with date parameter
window.submitMilestone = function() {
    const title = document.getElementById('milestone-title').value;
    const description = document.getElementById('milestone-description').value;
    const date = document.getElementById('milestone-date').value;
    
    if (!title || !description || !date) {
        showNotification('Please fill in all fields', 'warning');
        return;
    }
    
    addRecoveryMilestone(title, description, date);
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('milestoneModal'));
    if (modal) modal.hide();
    
    // Clear form
    document.getElementById('milestone-form').reset();
};

// Export data
window.exportData = function() {
    try {
        const dataStr = JSON.stringify(dashboardData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'dashboard-data.json';
        link.click();
        
        URL.revokeObjectURL(url);
        showNotification('Data exported successfully!', 'success');
    } catch (error) {
        console.error('Error exporting data:', error);
        showNotification('Error exporting data: ' + error.message, 'error');
    }
};

// Delete account with Supabase cleanup
window.deleteAccount = async function() {
    if (confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
        try {
            if (!currentUser) {
                throw new Error('No authenticated user');
            }

            // Delete user data from Supabase (using existing table names)
            await window.supabaseClient
                .from('recovery_milestones')
                .delete()
                .eq('user_id', currentUser.id);

            await window.supabaseClient
                .from('profiles')
                .delete()
                .eq('id', currentUser.id);

            // Sign out and redirect
            await window.supabaseClient.auth.signOut();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Error deleting account:', error);
            showNotification('Error deleting account: ' + error.message, 'error');
        }
    }
};

// Show notification (simple implementation)
function showNotification(message, type = 'info') {
    // Create a simple notification
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
window.dashboard = {
    initializeDashboard,
    updateProfile,
    saveSettings,
    setSobrietyDate,
    addRecoveryMilestone,
    exportData,
    printDashboard: exportData
};

// Add missing functions for dashboard template
window.showNewPostModal = function() {
    // Redirect to community forum page
    window.location.href = '/community-engagement-sober-activities.html';
};

window.showStorySubmissionModal = function() {
    // Redirect to success stories page
    window.location.href = '/success-stories.html';
};

window.addMilestone = function() {
    // Show milestone modal
    const modal = new bootstrap.Modal(document.getElementById('milestoneModal'));
    modal.show();
};

window.showMilestoneModal = function() {
    // Show milestone modal
    const modal = new bootstrap.Modal(document.getElementById('milestoneModal'));
    modal.show();
};

window.browseResources = function() {
    // Redirect to resource directory
    window.location.href = '/resource-directory.html';
}; 