// src/js/success-stories.js - Success Stories (No Auth Required)

// Stories state management
let storiesData = {
    stories: [],
    categories: [
        'Addiction Recovery',
        'Mental Health',
        'Family Support',
        'Employment Success',
        'Housing Stability',
        'Community Connection',
        'Personal Growth',
        'Relapse Prevention'
    ]
};

// Initialize success stories
document.addEventListener('DOMContentLoaded', function() {
    initializeStories();
    setupStoriesListeners();
});

// Initialize stories system
function initializeStories() {
    try {
        loadStoriesData();
        loadStories();
        setupCategories();
    } catch (error) {
        console.error('Stories initialization error:', error);
        showNotification('Error loading stories: ' + error.message, 'error');
    }
}

// Setup stories event listeners
function setupStoriesListeners() {
    // Search functionality
    const searchInput = document.getElementById('stories-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchStories(this.value);
        });
    }
    
    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            filterStoriesByCategory(this.value);
        });
    }
    
    // Sort options
    const sortSelect = document.getElementById('sort-stories');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortStories(this.value);
        });
    }
}

// Load stories data from localStorage
function loadStoriesData() {
    console.log('Loading stories data...');
    
    // Load from localStorage if available
    const savedData = localStorage.getItem('storiesData');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            storiesData = { ...storiesData, ...parsed };
        } catch (e) {
            console.error('Error parsing saved stories data:', e);
        }
    }
    
    // If no stories exist, create some sample stories
    if (storiesData.stories.length === 0) {
        createSampleStories();
    }
    
    console.log('Stories data loaded:', storiesData);
}

// Create sample stories for demonstration
function createSampleStories() {
    const sampleStories = [
        {
            id: '1',
            title: 'Finding Hope in Recovery',
            content: 'After struggling with addiction for years, I finally found the strength to seek help. The support from the Spokane recovery community has been incredible. Today, I\'m celebrating 2 years of sobriety and helping others on their journey.',
            categories: ['Addiction Recovery', 'Personal Growth'],
            tags: ['hope', 'sobriety', 'community', 'support'],
            user_id: 'anonymous',
            user_name: 'Recovery Warrior',
            is_anonymous: false,
            recovery_time: '2-5 years',
            age_group: '36-45',
            media_url: '',
            media_type: '',
            likes: 15,
            views: 89,
            status: 'approved',
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            updated_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: '2',
            title: 'Rebuilding My Life After Rock Bottom',
            content: 'I hit rock bottom when I lost my job and home due to my addiction. Through the resources I found here, I was able to get treatment, find stable housing, and even land a better job. Recovery is possible!',
            categories: ['Addiction Recovery', 'Housing Stability', 'Employment Success'],
            tags: ['rebuilding', 'housing', 'employment', 'treatment'],
            user_id: 'anonymous',
            user_name: 'Phoenix Rising',
            is_anonymous: false,
            recovery_time: '1-2 years',
            age_group: '26-35',
            media_url: '',
            media_type: '',
            likes: 23,
            views: 156,
            status: 'approved',
            created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            updated_at: new Date(Date.now() - 172800000).toISOString()
        },
        {
            id: '3',
            title: 'Supporting My Loved One Through Recovery',
            content: 'As a family member, watching someone you love struggle with addiction is heartbreaking. But through education and support groups, I learned how to be there for them without enabling. Today, we\'re both stronger.',
            categories: ['Family Support', 'Mental Health'],
            tags: ['family', 'support', 'education', 'boundaries'],
            user_id: 'anonymous',
            user_name: 'Family First',
            is_anonymous: false,
            recovery_time: '6-12 months',
            age_group: '46-55',
            media_url: '',
            media_type: '',
            likes: 18,
            views: 112,
            status: 'approved',
            created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            updated_at: new Date(Date.now() - 259200000).toISOString()
        }
    ];
    
    storiesData.stories = sampleStories;
    saveStoriesData();
}

// Setup categories
function setupCategories() {
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.innerHTML = `
            <option value="">All Categories</option>
            ${storiesData.categories.map(category => 
                `<option value="${category}">${category}</option>`
            ).join('')}
        `;
    }
}

// Load stories
function loadStories() {
    const container = document.getElementById('stories-container');
    if (!container) return;
    
    if (storiesData.stories.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-star fs-1 text-muted"></i>
                <h4 class="mt-3">No stories yet</h4>
                <p class="text-muted">Be the first to share your recovery journey!</p>
                <button class="btn btn-primary" onclick="showStorySubmissionModal()">
                    <i class="bi bi-plus-circle me-2"></i>Share Your Story
                </button>
            </div>
        `;
        return;
    }
    
    const storiesHTML = storiesData.stories.map(story => createStoryHTML(story)).join('');
    container.innerHTML = storiesHTML;
}

// Create story HTML
function createStoryHTML(story) {
    const timeAgo = formatTimeAgo(story.created_at);
    const categoriesHTML = story.categories.map(category => 
        `<span class="badge bg-primary me-1">${category}</span>`
    ).join('');
    const tagsHTML = story.tags.map(tag => 
        `<span class="badge bg-light text-dark me-1">${tag}</span>`
    ).join('');
    
    return `
        <div class="card mb-4 story-card" data-story-id="${story.id}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div class="flex-grow-1">
                        <h4 class="card-title">
                            <a href="#" onclick="viewStory('${story.id}')" class="text-decoration-none">${story.title}</a>
                        </h4>
                        <div class="text-muted mb-2">
                            <i class="bi bi-person me-1"></i>${story.user_name}
                            <i class="bi bi-clock me-2 ms-2"></i>${timeAgo}
                            <i class="bi bi-calendar me-2 ms-2"></i>${story.recovery_time}
                            <i class="bi bi-people me-2 ms-2"></i>${story.age_group}
                        </div>
                        <div class="mb-2">
                            ${categoriesHTML}
                        </div>
                    </div>
                    <div class="dropdown">
                        <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            <i class="bi bi-three-dots"></i>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#" onclick="reportStory('${story.id}')">
                                <i class="bi bi-flag"></i> Report
                            </a></li>
                            <li><a class="dropdown-item" href="#" onclick="editStory('${story.id}')">
                                <i class="bi bi-pencil"></i> Edit
                            </a></li>
                            <li><a class="dropdown-item text-danger" href="#" onclick="deleteStory('${story.id}')">
                                <i class="bi bi-trash"></i> Delete
                            </a></li>
                        </ul>
                    </div>
                </div>
                
                <p class="card-text">${truncateText(story.content, 300)}</p>
                
                <div class="mb-3">
                    ${tagsHTML}
                </div>
                
                <div class="d-flex justify-content-between align-items-center">
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-primary" onclick="likeStory('${story.id}')">
                            <i class="bi bi-heart"></i> ${story.likes} Likes
                        </button>
                        <button class="btn btn-outline-info" onclick="viewStory('${story.id}')">
                            <i class="bi bi-eye"></i> ${story.views} Views
                        </button>
                        <button class="btn btn-outline-success" onclick="shareStory('${story.id}')">
                            <i class="bi bi-share"></i> Share
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Show story submission modal
window.showStorySubmissionModal = function() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'storySubmissionModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Share Your Recovery Story</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="storySubmissionForm">
                        <div class="row">
                            <div class="col-md-8">
                                <div class="mb-3">
                                    <label for="story-title" class="form-label">Story Title *</label>
                                    <input type="text" class="form-control" id="story-title" required maxlength="200"
                                        placeholder="Give your story a meaningful title">
                                </div>
                                
                                <div class="mb-3">
                                    <label for="story-content" class="form-label">Your Story *</label>
                                    <textarea class="form-control" id="story-content" rows="12" required 
                                        placeholder="Share your recovery journey, challenges overcome, and the hope you found..."></textarea>
                                    <div class="form-text">Your story will inspire others on their recovery journey.</div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="story-categories" class="form-label">Categories</label>
                                    <select class="form-select" id="story-categories" multiple>
                                        ${storiesData.categories.map(category => 
                                            `<option value="${category}">${category}</option>`
                                        ).join('')}
                                    </select>
                                    <div class="form-text">Select categories that apply to your story.</div>
                                </div>
                            </div>
                            
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="story-media" class="form-label">Add Media (Optional)</label>
                                    <input type="file" class="form-control" id="story-media" accept="image/*,video/*">
                                    <div class="form-text">Upload a photo or video to accompany your story.</div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="story-video-link" class="form-label">Video Link (Optional)</label>
                                    <input type="url" class="form-control" id="story-video-link" 
                                        placeholder="YouTube, Vimeo, etc.">
                                    <div class="form-text">Or provide a link to a video.</div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="story-recovery-time" class="form-label">Recovery Time</label>
                                    <select class="form-select" id="story-recovery-time">
                                        <option value="">Select recovery time</option>
                                        <option value="0-6 months">0-6 months</option>
                                        <option value="6-12 months">6-12 months</option>
                                        <option value="1-2 years">1-2 years</option>
                                        <option value="2-5 years">2-5 years</option>
                                        <option value="5+ years">5+ years</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="story-age-group" class="form-label">Age Group</label>
                                    <select class="form-select" id="story-age-group">
                                        <option value="">Select age group</option>
                                        <option value="18-25">18-25</option>
                                        <option value="26-35">26-35</option>
                                        <option value="36-45">36-45</option>
                                        <option value="46-55">46-55</option>
                                        <option value="55+">55+</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="story-anonymous">
                                        <label class="form-check-label" for="story-anonymous">
                                            Share anonymously
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="alert alert-info">
                                    <i class="bi bi-info-circle"></i>
                                    <strong>Story Guidelines:</strong> Share your personal experience, be honest and authentic, 
                                    focus on hope and recovery, and respect others' privacy.
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="submitStory()">Share Story</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    // Clean up when modal is hidden
    modal.addEventListener('hidden.bs.modal', function() {
        modal.remove();
    });
};

// Submit story
window.submitStory = function() {
    const title = document.getElementById('story-title').value.trim();
    const content = document.getElementById('story-content').value.trim();
    const categories = Array.from(document.getElementById('story-categories').selectedOptions).map(option => option.value);
    const recoveryTime = document.getElementById('story-recovery-time').value;
    const ageGroup = document.getElementById('story-age-group').value;
    const isAnonymous = document.getElementById('story-anonymous').checked;
    const mediaFile = document.getElementById('story-media').files[0];
    const videoLink = document.getElementById('story-video-link').value.trim();
    
    if (!title || !content) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }
    
    // Generate tags from content
    const words = content.toLowerCase().split(/\s+/);
    const commonTags = ['recovery', 'hope', 'sobriety', 'support', 'journey', 'strength', 'community'];
    const tags = commonTags.filter(tag => words.some(word => word.includes(tag)));
    
    const newStory = {
        id: Date.now().toString(),
        title: title,
        content: content,
        categories: categories,
        tags: tags,
        user_id: 'anonymous',
        user_name: isAnonymous ? 'Anonymous User' : 'Guest User',
        is_anonymous: isAnonymous,
        recovery_time: recoveryTime,
        age_group: ageGroup,
        media_url: videoLink || '',
        media_type: mediaFile ? mediaFile.type.split('/')[0] : '',
        likes: 0,
        views: 0,
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    // Add to stories data
    storiesData.stories.unshift(newStory);
    
    // Save to localStorage
    saveStoriesData();
    
    // Reload stories
    loadStories();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('storySubmissionModal'));
    if (modal) modal.hide();
    
    // Clear form
    document.getElementById('storySubmissionForm').reset();
    
    showNotification('Story shared successfully! Thank you for inspiring others.', 'success');
};

// View story details
window.viewStory = function(storyId) {
    const story = storiesData.stories.find(s => s.id === storyId);
    if (!story) return;
    
    // Increment view count
    story.views++;
    saveStoriesData();
    
    // For now, just show a simple alert with the full content
    // In a real implementation, this would open a detailed view modal
    alert(`Full Story: ${story.title}\n\n${story.content}`);
};

// Edit story
window.editStory = function(storyId) {
    const story = storiesData.stories.find(s => s.id === storyId);
    if (!story) return;
    
    // For now, just show a simple prompt
    // In a real implementation, this would open an edit modal
    const newTitle = prompt('Edit story title:', story.title);
    if (newTitle && newTitle.trim()) {
        story.title = newTitle.trim();
        story.updated_at = new Date().toISOString();
        saveStoriesData();
        loadStories();
        showNotification('Story updated successfully!', 'success');
    }
};

// Delete story
window.deleteStory = function(storyId) {
    if (!confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
        return;
    }
    
    const index = storiesData.stories.findIndex(s => s.id === storyId);
    if (index !== -1) {
        storiesData.stories.splice(index, 1);
        saveStoriesData();
        loadStories();
        showNotification('Story deleted successfully!', 'success');
    }
};

// Report story
window.reportStory = function(storyId) {
    showNotification('Thank you for reporting. Our moderators will review this story.', 'info');
};

// Like story
window.likeStory = function(storyId) {
    const story = storiesData.stories.find(s => s.id === storyId);
    if (story) {
        story.likes++;
        saveStoriesData();
        loadStories();
    }
};

// Share story
window.shareStory = function(storyId) {
    const story = storiesData.stories.find(s => s.id === storyId);
    if (story) {
        const shareText = `Check out this inspiring recovery story: ${story.title}`;
        const shareUrl = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: story.title,
                text: shareText,
                url: shareUrl
            });
        } else {
            // Fallback for browsers that don't support Web Share API
            const textArea = document.createElement('textarea');
            textArea.value = `${shareText}\n\n${shareUrl}`;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('Story link copied to clipboard!', 'success');
        }
    }
};

// Search stories
function searchStories(query) {
    if (!query.trim()) {
        loadStories();
        return;
    }
    
    const filteredStories = storiesData.stories.filter(story => 
        story.title.toLowerCase().includes(query.toLowerCase()) ||
        story.content.toLowerCase().includes(query.toLowerCase()) ||
        story.categories.some(category => category.toLowerCase().includes(query.toLowerCase())) ||
        story.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    displayFilteredStories(filteredStories);
}

// Filter stories by category
function filterStoriesByCategory(category) {
    if (!category) {
        loadStories();
        return;
    }
    
    const filteredStories = storiesData.stories.filter(story => 
        story.categories.includes(category)
    );
    
    displayFilteredStories(filteredStories);
}

// Sort stories
function sortStories(sortBy) {
    let sortedStories = [...storiesData.stories];
    
    switch (sortBy) {
        case 'newest':
            sortedStories.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'oldest':
            sortedStories.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case 'most-liked':
            sortedStories.sort((a, b) => b.likes - a.likes);
            break;
        case 'most-viewed':
            sortedStories.sort((a, b) => b.views - a.views);
            break;
        default:
            // Default to newest
            sortedStories.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    displayFilteredStories(sortedStories);
}

// Display filtered stories
function displayFilteredStories(stories) {
    const container = document.getElementById('stories-container');
    if (!container) return;
    
    if (stories.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-search fs-1 text-muted"></i>
                <h4 class="mt-3">No stories found</h4>
                <p class="text-muted">Try adjusting your search or filter criteria.</p>
            </div>
        `;
        return;
    }
    
    const storiesHTML = stories.map(story => createStoryHTML(story)).join('');
    container.innerHTML = storiesHTML;
}

// Save stories data to localStorage
function saveStoriesData() {
    try {
        localStorage.setItem('storiesData', JSON.stringify(storiesData));
    } catch (error) {
        console.error('Error saving stories data:', error);
    }
}

// Utility functions
function formatTimeAgo(dateString) {
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
window.stories = {
    initializeStories,
    loadStories,
    searchStories,
    filterStoriesByCategory,
    sortStories,
    likeStory,
    shareStory
}; 