// src/js/dashboard.js - Dashboard Functionality

// Dashboard state management
let dashboardData = {};
let recoveryChart = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Wait for auth to be ready before initializing dashboard
    if (typeof auth !== 'undefined' && auth.userProfile) {
        initializeDashboard();
        setupDashboardListeners();
    } else {
        // Wait for auth to load
        const checkAuth = setInterval(() => {
            if (typeof auth !== 'undefined' && auth.userProfile) {
                clearInterval(checkAuth);
                initializeDashboard();
                setupDashboardListeners();
            }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
            clearInterval(checkAuth);
            console.error('Auth system not ready after 5 seconds');
            showNotification('Error loading user data. Please refresh the page.', 'error');
        }, 5000);
    }
});

// Initialize dashboard system
async function initializeDashboard() {
    try {
        await loadDashboardData();
        setupDashboardUI();
        initializeCharts();
        updateDashboardCounts();
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        showNotification('Error loading dashboard: ' + error.message, 'error');
    }
}

// Setup dashboard event listeners
function setupDashboardListeners() {
    // Tab navigation
    const tabLinks = document.querySelectorAll('[data-bs-toggle="pill"]');
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const target = this.getAttribute('href');
            loadTabContent(target.substring(1));
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
}

// Load dashboard data
async function loadDashboardData() {
    console.log('loadDashboardData called');
    console.log('auth.userProfile:', auth.userProfile);
    
    if (!auth.userProfile) {
        console.log('No user profile available, creating default data');
        dashboardData = {
            posts: [],
            comments: [],
            stories: [],
            profile: null
        };
        return;
    }
    
    try {
        // Load user's posts
        const { data: posts, error: postsError } = await supabase
            .from('forum_posts')
            .select('*')
            .eq('user_id', auth.currentUser?.id || 'anonymous')
            .order('created_at', { ascending: false });
        
        if (postsError) throw postsError;
        
        // Load user's comments
        const { data: comments, error: commentsError } = await supabase
            .from('forum_comments')
            .select('*')
            .eq('user_id', auth.currentUser?.id || 'anonymous')
            .order('created_at', { ascending: false });
        
        if (commentsError) throw commentsError;
        
        // Load user's stories
        const { data: stories, error: storiesError } = await supabase
            .from('success_stories')
            .select('*')
            .eq('user_id', auth.currentUser?.id || 'anonymous')
            .order('created_at', { ascending: false });
        
        if (storiesError) throw storiesError;
        
        dashboardData = {
            posts: posts || [],
            comments: comments || [],
            stories: stories || [],
            profile: auth.userProfile
        };
        
        updateDashboardCounts();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        throw error;
    }
}

// Update dashboard counts
function updateDashboardCounts() {
    const data = dashboardData;
    
    // Update sobriety counter
    updateSobrietyCounter();
    
    // Update overview cards
    const milestonesCount = document.getElementById('milestones-count');
    if (milestonesCount) {
        milestonesCount.textContent = data.profile?.recovery_milestones?.length || 0;
    }
    
    const favoritesCount = document.getElementById('favorites-count');
    if (favoritesCount) {
        favoritesCount.textContent = data.profile?.favorite_resources?.length || 0;
    }
    
    const postsCount = document.getElementById('posts-count');
    if (postsCount) {
        postsCount.textContent = data.posts?.length || 0;
    }
    
    // Update community stats
    const communityPostsCount = document.getElementById('community-posts-count');
    if (communityPostsCount) {
        communityPostsCount.textContent = data.posts?.length || 0;
    }
    
    const communityCommentsCount = document.getElementById('community-comments-count');
    if (communityCommentsCount) {
        communityCommentsCount.textContent = data.comments?.length || 0;
    }
    
    const communityLikesCount = document.getElementById('community-likes-count');
    if (communityLikesCount) {
        const totalLikes = (data.posts || []).reduce((sum, post) => sum + (post.upvotes || 0), 0);
        communityLikesCount.textContent = totalLikes;
    }
    
    // Update story stats
    const storiesCount = document.getElementById('stories-count');
    if (storiesCount) {
        storiesCount.textContent = data.stories?.length || 0;
    }
    
    const storiesViews = document.getElementById('stories-views');
    if (storiesViews) {
        const totalViews = (data.stories || []).reduce((sum, story) => sum + (story.views || 0), 0);
        storiesViews.textContent = totalViews;
    }
    
    const storiesLikes = document.getElementById('stories-likes');
    if (storiesLikes) {
        const totalLikes = (data.stories || []).reduce((sum, story) => sum + (story.likes || 0), 0);
        storiesLikes.textContent = totalLikes;
    }
}

// Load tab content
async function loadTabContent(tabName) {
    switch (tabName) {
        case 'overview':
            await loadOverviewContent();
            break;
        case 'profile':
            loadProfileContent();
            break;
        case 'recovery':
            await loadRecoveryContent();
            break;
        case 'resources':
            await loadResourcesContent();
            break;
        case 'community':
            await loadCommunityContent();
            break;
        case 'stories':
            await loadStoriesContent();
            break;
        case 'settings':
            loadSettingsContent();
            break;
    }
}

// Load overview content
async function loadOverviewContent() {
    const recentActivity = document.getElementById('recent-activity');
    if (!recentActivity) return;
    
    const activities = [];
    
    // Add recent posts
    if (dashboardData.posts) {
        dashboardData.posts.slice(0, 3).forEach(post => {
            activities.push({
                type: 'post',
                title: post.title,
                date: post.created_at,
                icon: 'bi-chat-dots'
            });
        });
    }
    
    // Add recent comments
    if (dashboardData.comments) {
        dashboardData.comments.slice(0, 3).forEach(comment => {
            activities.push({
                type: 'comment',
                title: `Commented on a post`,
                date: comment.created_at,
                icon: 'bi-chat'
            });
        });
    }
    
    // Add recent stories
    if (dashboardData.stories) {
        dashboardData.stories.slice(0, 3).forEach(story => {
            activities.push({
                type: 'story',
                title: story.title,
                date: story.created_at,
                icon: 'bi-chat-quote'
            });
        });
    }
    
    // Sort by date
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (activities.length === 0) {
        recentActivity.innerHTML = '<p class="text-muted">No recent activity</p>';
        return;
    }
    
    const html = activities.slice(0, 5).map(activity => `
        <div class="d-flex align-items-center mb-2">
            <i class="bi ${activity.icon} text-primary me-2"></i>
            <div class="flex-grow-1">
                <small class="text-muted">${activity.title}</small>
                <br>
                <small class="text-muted">${formatDate(activity.date)}</small>
            </div>
        </div>
    `).join('');
    
    recentActivity.innerHTML = html;
}

// Load profile content
function loadProfileContent() {
    loadProfileData();
}

// Load recovery content
async function loadRecoveryContent() {
    await loadRecoveryMilestones();
    updateRecoveryChart();
    updateSobrietyCounter();
}

// Load resources content
async function loadResourcesContent() {
    await loadFavoriteResources();
    await loadPersonalizedRecommendations();
}

// Load community content
async function loadCommunityContent() {
    await loadUserPosts();
    await loadUserComments();
    await loadUserMessages();
}

// Load stories content
async function loadStoriesContent() {
    await loadUserStories();
}

// Load settings content
function loadSettingsContent() {
    loadSettingsData();
}

// Load profile data into forms
function loadProfileData() {
    if (!auth.userProfile) return;
    
    const profile = auth.userProfile;
    
    const displayNameInput = document.getElementById('profile-display-name');
    if (displayNameInput) {
        displayNameInput.value = profile.display_name || '';
    }
    
    const emailInput = document.getElementById('profile-email');
    if (emailInput) {
        emailInput.value = profile.email || '';
    }
    
    const privacySelect = document.getElementById('profile-privacy');
    if (privacySelect) {
        privacySelect.value = profile.preferences?.privacy_level || 'standard';
    }
    
    const themeSelect = document.getElementById('profile-theme');
    if (themeSelect) {
        themeSelect.value = profile.preferences?.theme || 'light';
    }
    
    const bioTextarea = document.getElementById('profile-bio');
    if (bioTextarea) {
        bioTextarea.value = profile.bio || '';
    }
    
    const notificationsCheckbox = document.getElementById('profile-notifications');
    if (notificationsCheckbox) {
        notificationsCheckbox.checked = profile.preferences?.notifications_enabled || false;
    }
    
    // Update account status
    const memberSince = document.getElementById('member-since');
    if (memberSince) {
        const date = new Date(profile.created_at || Date.now());
        memberSince.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    
    const accountType = document.getElementById('account-type');
    if (accountType) {
        accountType.textContent = profile.is_anonymous ? 'Anonymous User' : 'Registered User';
    }
}

// Load settings data
function loadSettingsData() {
    if (!auth.userProfile) return;
    
    const preferences = auth.userProfile.preferences || {};
    
    // Email notifications
    const emailCommunity = document.getElementById('email-community');
    if (emailCommunity) {
        emailCommunity.checked = preferences.notifications_enabled || false;
    }
    
    const emailResources = document.getElementById('email-resources');
    if (emailResources) {
        emailResources.checked = preferences.resource_notifications || false;
    }
    
    const emailStories = document.getElementById('email-stories');
    if (emailStories) {
        emailStories.checked = preferences.story_notifications || false;
    }
    
    // Privacy settings
    const privacyLevel = preferences.privacy_level || 'standard';
    const privacyRadio = document.getElementById(`privacy-${privacyLevel}`);
    if (privacyRadio) {
        privacyRadio.checked = true;
    }
}

// Update profile
window.updateProfile = async function() {
    const displayName = document.getElementById('profile-display-name').value;
    const privacy = document.getElementById('profile-privacy').value;
    const theme = document.getElementById('profile-theme').value;
    const bio = document.getElementById('profile-bio').value;
    const notifications = document.getElementById('profile-notifications').checked;
    
    try {
        const updates = {
            display_name: displayName,
            bio: bio,
            preferences: {
                privacy_level: privacy,
                theme: theme,
                notifications_enabled: notifications
            }
        };
        
        await auth.updateUserProfile(updates);
        
        // Update UI
        const userDisplayName = document.getElementById('user-display-name');
        if (userDisplayName) {
            userDisplayName.textContent = displayName;
        }
        
        showNotification('Profile updated successfully!', 'success');
    } catch (error) {
        showNotification('Error updating profile: ' + error.message, 'error');
    }
};

// Save settings
window.saveSettings = async function() {
    const emailCommunity = document.getElementById('email-community').checked;
    const emailResources = document.getElementById('email-resources').checked;
    const emailStories = document.getElementById('email-stories').checked;
    const privacy = document.querySelector('input[name="privacy"]:checked')?.value || 'standard';
    
    try {
        const updates = {
            preferences: {
                notifications_enabled: emailCommunity,
                resource_notifications: emailResources,
                story_notifications: emailStories,
                privacy_level: privacy
            }
        };
        
        await auth.updateUserProfile(updates);
        showNotification('Settings saved successfully!', 'success');
    } catch (error) {
        showNotification('Error saving settings: ' + error.message, 'error');
    }
};

// Set sobriety date
window.setSobrietyDate = async function() {
    const dateInput = document.getElementById('sobriety-date');
    const date = dateInput.value;
    
    if (!date) {
        showNotification('Please select a sobriety date', 'warning');
        return;
    }
    
    try {
        await auth.setSobrietyDate(date);
        updateSobrietyCounter();
        showNotification('Sobriety date set successfully!', 'success');
    } catch (error) {
        showNotification('Error setting sobriety date: ' + error.message, 'error');
    }
};

// Show milestone modal
window.showMilestoneModal = function() {
    const modal = new bootstrap.Modal(document.getElementById('milestoneModal'));
    modal.show();
};

// Submit milestone
window.submitMilestone = async function() {
    const title = document.getElementById('milestone-title').value.trim();
    const description = document.getElementById('milestone-description').value.trim();
    const date = document.getElementById('milestone-date').value;
    
    if (!title || !description || !date) {
        showNotification('Please fill in all fields', 'warning');
        return;
    }
    
    try {
        await auth.addRecoveryMilestone(title, description);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('milestoneModal'));
        modal.hide();
        
        // Clear form
        document.getElementById('milestone-title').value = '';
        document.getElementById('milestone-description').value = '';
        document.getElementById('milestone-date').value = '';
        
        // Reload data
        await loadDashboardData();
        await loadRecoveryMilestones();
        
        showNotification('Milestone added successfully!', 'success');
    } catch (error) {
        showNotification('Error adding milestone: ' + error.message, 'error');
    }
};

// Load recovery milestones
async function loadRecoveryMilestones() {
    const container = document.getElementById('recovery-milestones');
    if (!container) return;
    
    const milestones = auth.userProfile?.recovery_milestones || [];
    
    if (milestones.length === 0) {
        container.innerHTML = '<p class="text-muted">No milestones recorded yet.</p>';
        return;
    }
    
    const html = milestones.map(milestone => `
        <div class="card mb-2">
            <div class="card-body">
                <h6 class="card-title">${milestone.title}</h6>
                <p class="card-text">${milestone.description}</p>
                <small class="text-muted">Achieved on ${new Date(milestone.date).toLocaleDateString()}</small>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Load favorite resources
async function loadFavoriteResources() {
    const container = document.getElementById('favorite-resources');
    if (!container) return;
    
    const favorites = auth.userProfile?.favorite_resources || [];
    
    if (favorites.length === 0) {
        container.innerHTML = '<p class="text-muted">No favorite resources yet.</p>';
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('resources')
            .select('*')
            .in('id', favorites);
        
        if (error) throw error;
        
        const html = data.map(resource => `
            <div class="card mb-2">
                <div class="card-body">
                    <h6 class="card-title">${resource.name}</h6>
                    <p class="card-text">${resource.description}</p>
                    <a href="${resource.url}" class="btn btn-primary btn-sm" target="_blank">Visit</a>
                    <button class="btn btn-outline-danger btn-sm ms-2" onclick="removeFavoriteResource('${resource.id}')">
                        <i class="bi bi-heart-fill"></i> Remove
                    </button>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading favorite resources:', error);
        container.innerHTML = '<p class="text-muted">Error loading favorite resources.</p>';
    }
}

// Load personalized recommendations
async function loadPersonalizedRecommendations() {
    const container = document.getElementById('personalized-recommendations');
    if (!container) return;
    
    try {
        const { data, error } = await supabase
            .from('resources')
            .select('*')
            .limit(3);
        
        if (error) throw error;
        
        if (data.length === 0) {
            container.innerHTML = '<p class="text-muted">No recommendations available.</p>';
            return;
        }
        
        const html = data.map(resource => `
            <div class="card mb-2">
                <div class="card-body">
                    <h6 class="card-title">${resource.name}</h6>
                    <p class="card-text">${resource.description}</p>
                    <a href="${resource.url}" class="btn btn-primary btn-sm" target="_blank">Learn More</a>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading recommendations:', error);
        container.innerHTML = '<p class="text-muted">Error loading recommendations.</p>';
    }
}

// Load user posts
async function loadUserPosts() {
    const container = document.getElementById('my-posts');
    if (!container) return;
    
    const posts = dashboardData.posts || [];
    
    if (posts.length === 0) {
        container.innerHTML = '<p class="text-muted">No posts yet.</p>';
        return;
    }
    
    const html = posts.map(post => `
        <div class="card mb-2">
            <div class="card-body">
                <h6 class="card-title">${post.title}</h6>
                <p class="card-text">${truncateText(post.content, 100)}</p>
                <small class="text-muted">${formatDate(post.created_at)}</small>
                <div class="mt-2">
                    <button class="btn btn-outline-primary btn-sm" onclick="editPost('${post.id}')">Edit</button>
                    <button class="btn btn-outline-danger btn-sm ms-2" onclick="deletePost('${post.id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Load user comments
async function loadUserComments() {
    const container = document.getElementById('my-comments');
    if (!container) return;
    
    const comments = dashboardData.comments || [];
    
    if (comments.length === 0) {
        container.innerHTML = '<p class="text-muted">No comments yet.</p>';
        return;
    }
    
    const html = comments.map(comment => `
        <div class="card mb-2">
            <div class="card-body">
                <p class="card-text">${comment.content}</p>
                <small class="text-muted">${formatDate(comment.created_at)}</small>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Load user messages
async function loadUserMessages() {
    const container = document.getElementById('my-messages');
    if (!container) return;
    
    container.innerHTML = '<p class="text-muted">No messages yet.</p>';
}

// Load user stories
async function loadUserStories() {
    const container = document.getElementById('my-stories');
    if (!container) return;
    
    const stories = dashboardData.stories || [];
    
    if (stories.length === 0) {
        container.innerHTML = '<p class="text-muted">No stories shared yet.</p>';
        return;
    }
    
    const html = stories.map(story => `
        <div class="card mb-2">
            <div class="card-body">
                <h6 class="card-title">${story.title}</h6>
                <p class="card-text">${truncateText(story.content, 100)}</p>
                <small class="text-muted">${formatDate(story.created_at)} - Status: ${story.status}</small>
                <div class="mt-2">
                    <button class="btn btn-outline-primary btn-sm" onclick="editStory('${story.id}')">Edit</button>
                    <button class="btn btn-outline-danger btn-sm ms-2" onclick="deleteStory('${story.id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Initialize charts
function initializeCharts() {
    const ctx = document.getElementById('recovery-chart');
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
}

// Update recovery chart
function updateRecoveryChart() {
    if (!recoveryChart) return;
    
    const milestones = auth.userProfile?.recovery_milestones || [];
    const labels = milestones.map(m => new Date(m.date).toLocaleDateString());
    const data = milestones.map((_, index) => index + 1);
    
    recoveryChart.data.labels = labels;
    recoveryChart.data.datasets[0].data = data;
    recoveryChart.update();
}

// Update sobriety counter
function updateSobrietyCounter() {
    console.log('updateSobrietyCounter called');
    console.log('auth object:', auth);
    console.log('auth.userProfile:', auth.userProfile);
    
    const sobrietyDate = auth.userProfile?.sobriety_date;
    console.log('Sobriety date from profile:', sobrietyDate);
    
    if (!sobrietyDate) {
        console.log('No sobriety date found, returning early');
        return;
    }
    
    const date = new Date(sobrietyDate);
    const today = new Date();
    
    // Debug logging
    console.log('Sobriety date string:', sobrietyDate);
    console.log('Parsed date object:', date);
    console.log('Today:', today);
    console.log('Date.getTime():', date.getTime());
    console.log('Today.getTime():', today.getTime());
    
    const daysSober = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    console.log('Days sober calculation:', daysSober);
    
    // Check if the date is in the future (likely a data entry error)
    if (daysSober < 0) {
        console.warn('Sobriety date is in the future. This might be a data entry error.');
        // Try to interpret as previous year if it's a future date
        const currentYear = today.getFullYear();
        const correctedDate = new Date(sobrietyDate);
        correctedDate.setFullYear(currentYear - 1);
        
        const correctedDaysSober = Math.floor((today - correctedDate) / (1000 * 60 * 60 * 24));
        console.log('Corrected date:', correctedDate);
        console.log('Corrected days sober:', correctedDaysSober);
        
        if (correctedDaysSober > 0) {
            // Use the corrected calculation
            const displayDays = correctedDaysSober;
            console.log('Using corrected display days:', displayDays);
            
            const counterElements = [
                document.getElementById('sobriety-counter'),
                document.getElementById('sobriety-counter-large')
            ];
            
            console.log('Counter elements found:', counterElements);
            
            counterElements.forEach(element => {
                if (element) {
                    console.log('Updating element:', element, 'with text:', `${displayDays} days sober`);
                    element.textContent = `${displayDays} days sober`;
                }
            });
            
            // Show a notification about the date correction
            showNotification('Sobriety date corrected from future date. Please verify your sobriety date is correct.', 'warning');
            return;
        }
    }
    
    // Handle future dates (show 0 days)
    const displayDays = Math.max(0, daysSober);
    console.log('Final display days:', displayDays);
    
    const counterElements = [
        document.getElementById('sobriety-counter'),
        document.getElementById('sobriety-counter-large')
    ];
    
    console.log('Counter elements found:', counterElements);
    
    counterElements.forEach(element => {
        if (element) {
            console.log('Updating element:', element, 'with text:', `${displayDays} days sober`);
            element.textContent = `${displayDays} days sober`;
        }
    });
    
    // Also update the date input field to show the current sobriety date
    const sobrietyDateInput = document.getElementById('sobriety-date');
    if (sobrietyDateInput) {
        sobrietyDateInput.value = sobrietyDate;
    }
}

// Export data
window.exportData = function() {
    const data = {
        profile: auth.userProfile,
        posts: dashboardData.posts,
        comments: dashboardData.comments,
        stories: dashboardData.stories,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sober-spokane-data.json';
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!', 'success');
};

// Print dashboard
window.printDashboard = function() {
    window.print();
};

// Delete account
window.deleteAccount = function() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        // In production, implement proper account deletion
        showNotification('Account deletion not implemented in demo', 'warning');
    }
};

// Browse resources
window.browseResources = function() {
    window.location.href = '/resource-directory.html';
};

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
        return 'Just now';
    } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 168) {
        return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Export functions for global access
window.dashboard = {
    loadDashboardData,
    updateDashboardCounts,
    loadTabContent,
    updateProfile,
    saveSettings,
    setSobrietyDate,
    submitMilestone,
    exportData,
    printDashboard
}; 