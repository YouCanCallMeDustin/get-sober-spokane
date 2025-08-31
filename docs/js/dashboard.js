// src/js/dashboard.js - Dashboard Functionality (No Auth Required)

// Dashboard state management
let dashboardData = {
    posts: [],
    comments: [],
    milestones: [],
    resources: [],
    sobrietyDate: null,
    profile: {
        display_name: 'Guest User',
        email: 'guest@example.com',
        phone: '',
        recovery_goals: '',
        support_network: '',
        emergency_contacts: []
    },
    preferences: {
        email_notifications: false,
        privacy_level: 'standard'
    }
};

let recoveryChart = null;
// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupDashboardListeners();
    setupMobileSidebar();
});

// Initialize dashboard system
async function initializeDashboard() {
    try {
        loadDashboardData();
        setupDashboardUI();
        // Reflect any saved sobriety date immediately
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

// Load dashboard data
function loadDashboardData() {
    console.log('Loading dashboard data...');
    
    // Load from localStorage if available
    const savedData = localStorage.getItem('dashboardData');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            dashboardData = { ...dashboardData, ...parsed };
        } catch (e) {
            console.error('Error parsing saved data:', e);
        }
    }
    
    console.log('Dashboard data loaded:', dashboardData);
}

// Load profile data into forms
function loadProfileData() {
    const profile = dashboardData.profile;
    
    // Populate profile form fields
    const displayNameInput = document.getElementById('display-name');
    if (displayNameInput) displayNameInput.value = profile.display_name || '';
    
    const emailInput = document.getElementById('email');
    if (emailInput) emailInput.value = profile.email || '';
    
    const phoneInput = document.getElementById('phone');
    if (phoneInput) phoneInput.value = profile.phone || '';
    
    const goalsInput = document.getElementById('recovery-goals');
    if (goalsInput) goalsInput.value = profile.recovery_goals || '';
    
    const networkInput = document.getElementById('support-network');
    if (networkInput) networkInput.value = profile.support_network || '';
    
    const sobrietyInput = document.getElementById('sobriety-date');
    if (sobrietyInput && profile.sobrietyDate) {
        sobrietyInput.value = profile.sobrietyDate;
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

// Update profile
async function updateProfile() {
    try {
        const formData = new FormData(document.getElementById('profile-form'));
        
        const updates = {
            display_name: formData.get('display_name') || '',
            email: formData.get('email') || '',
            phone: formData.get('phone') || '',
            recovery_goals: formData.get('recovery_goals') || '',
            support_network: formData.get('support_network') || ''
        };
        
        // Update local data
        dashboardData.profile = { ...dashboardData.profile, ...updates };
        
        // Save to localStorage
        saveDashboardData();
        
        showNotification('Profile updated successfully!', 'success');
        loadProfileData(); // Refresh the form
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Error updating profile: ' + error.message, 'error');
    }
}

// Save settings
async function saveSettings() {
    try {
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
            privacy_level: privacyLevel
        };
        
        // Update local data
        dashboardData.preferences = { ...dashboardData.preferences, ...updates };
        
        // Save to localStorage
        saveDashboardData();
        
        showNotification('Settings saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Error saving settings: ' + error.message, 'error');
    }
}

// Set sobriety date
async function setSobrietyDate(date) {
    try {
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

        dashboardData.profile.sobrietyDate = selectedDate;
        dashboardData.profile = { ...dashboardData.profile };
        
        // Save to localStorage
        saveDashboardData();
        
        // Update UI
        updateSobrietyDisplay();
        showNotification('Sobriety date updated!', 'success');
    } catch (error) {
        console.error('Error setting sobriety date:', error);
        showNotification('Error setting sobriety date: ' + error.message, 'error');
    }
}

// Add recovery milestone
async function addRecoveryMilestone(title, description) {
    try {
        const milestone = {
            id: Date.now().toString(),
            title: title,
            description: description,
            date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
        };
        
        dashboardData.milestones.push(milestone);
        
        // Save to localStorage
        saveDashboardData();
        
        // Update UI
        updateMilestonesDisplay();
        showNotification('Milestone added successfully!', 'success');
    } catch (error) {
        console.error('Error adding milestone:', error);
        showNotification('Error adding milestone: ' + error.message, 'error');
    }
}

// Save dashboard data to localStorage
function saveDashboardData() {
    try {
        localStorage.setItem('dashboardData', JSON.stringify(dashboardData));
    } catch (error) {
        console.error('Error saving dashboard data:', error);
    }
}

// Update sobriety display
function updateSobrietyDisplay() {
    const sobrietyDate = dashboardData.profile.sobrietyDate;
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
    const milestonesContainer = document.getElementById('milestones-container');
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
    
    const sobrietyDate = dashboardData.profile.sobrietyDate;
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

// Submit milestone
window.submitMilestone = function() {
    const title = document.getElementById('milestone-title').value;
    const description = document.getElementById('milestone-description').value;
    const date = document.getElementById('milestone-date').value;
    
    if (!title || !description || !date) {
        showNotification('Please fill in all fields', 'warning');
        return;
    }
    
    addRecoveryMilestone(title, description);
    
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

// Delete account (local data only)
window.deleteAccount = function() {
    if (confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
        try {
            localStorage.removeItem('dashboardData');
            dashboardData = {
                posts: [],
                comments: [],
                milestones: [],
                resources: [],
                sobrietyDate: null,
                profile: {
                    display_name: 'Guest User',
                    email: 'guest@example.com',
                    phone: '',
                    recovery_goals: '',
                    support_network: '',
                    emergency_contacts: []
                },
                preferences: {
                    email_notifications: false,
                    privacy_level: 'standard'
                }
            };
            
            // Refresh the page
            location.reload();
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

window.browseResources = function() {
    // Redirect to resource directory
            window.location.href = '/resource-directory.html';
}; 