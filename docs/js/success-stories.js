// src/js/success-stories.js - Success Stories & Testimonials System

// Stories state management
let successStories = [];
let pendingStories = [];
let storyCategories = [];
let currentStoryFilter = 'all';

// Initialize success stories
document.addEventListener('DOMContentLoaded', function() {
    initializeSuccessStories();
    setupStoryListeners();
});

// Initialize success stories system
async function initializeSuccessStories() {
    try {
        await loadSuccessStories();
        await loadStoryCategories();
        setupStoriesUI();
    } catch (error) {
        console.error('Success stories initialization error:', error);
        showNotification('Error loading success stories: ' + error.message, 'error');
    }
}

// Setup story event listeners
function setupStoryListeners() {
    // Category filter
    const categorySelect = document.getElementById('story-category');
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            currentStoryFilter = this.value;
            filterAndDisplayStories();
        });
    }
}

// Setup stories UI
function setupStoriesUI() {
    const storiesContainer = document.getElementById('stories-container');
    if (!storiesContainer) return;

    storiesContainer.innerHTML = `
        <div class="row">
            <div class="col-lg-8">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Success Stories & Testimonials</h2>
                    <button class="btn btn-primary" onclick="showStorySubmissionModal()">
                        <i class="bi bi-plus-circle"></i> Share Your Story
                    </button>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <select id="story-category" class="form-select">
                            <option value="all">All Stories</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <div class="input-group">
                            <input type="text" class="form-control" id="story-search" placeholder="Search stories...">
                            <button class="btn btn-outline-secondary" type="button" onclick="searchStories()">
                                <i class="bi bi-search"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div id="stories-list"></div>
            </div>
            
            <div class="col-lg-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Share Your Journey</h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text">Your story can inspire others on their recovery journey. Share your experience to help someone else find hope.</p>
                        <button class="btn btn-primary w-100" onclick="showStorySubmissionModal()">
                            <i class="bi bi-pencil"></i> Write Your Story
                        </button>
                    </div>
                </div>
                
                <div class="card mt-3">
                    <div class="card-header">
                        <h5 class="mb-0">Story Categories</h5>
                    </div>
                    <div class="card-body">
                        <div id="story-categories-list"></div>
                    </div>
                </div>
                
                <div class="card mt-3">
                    <div class="card-header">
                        <h5 class="mb-0">Submission Guidelines</h5>
                    </div>
                    <div class="card-body">
                        <ul class="list-unstyled mb-0">
                            <li><i class="bi bi-check-circle text-success"></i> Share your personal experience</li>
                            <li><i class="bi bi-check-circle text-success"></i> Focus on hope and recovery</li>
                            <li><i class="bi bi-check-circle text-success"></i> Respect others' privacy</li>
                            <li><i class="bi bi-check-circle text-success"></i> Stories are reviewed before publishing</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Load success stories
async function loadSuccessStories() {
    try {
        const { data, error } = await supabase
            .from('success_stories')
            .select(`
                *,
                user_profiles(display_name, is_anonymous)
            `)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        successStories = data || [];
        filterAndDisplayStories();
    } catch (error) {
        console.error('Error loading success stories:', error);
        throw error;
    }
}

// Load story categories
async function loadStoryCategories() {
    try {
        const { data, error } = await supabase
            .from('story_categories')
            .select('*')
            .order('name');
        
        if (error) throw error;
        
        storyCategories = data || [];
        
        // Update category select
        const categorySelect = document.getElementById('story-category');
        if (categorySelect) {
            const options = storyCategories.map(category => 
                `<option value="${category.id}">${category.name}</option>`
            ).join('');
            categorySelect.innerHTML += options;
        }
        
        // Update categories list
        displayStoryCategories();
    } catch (error) {
        console.error('Error loading story categories:', error);
    }
}

// Display story categories
function displayStoryCategories() {
    const container = document.getElementById('story-categories-list');
    if (!container) return;
    
    const html = storyCategories.map(category => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <span>${category.name}</span>
            <span class="badge bg-primary">${category.story_count || 0}</span>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Filter and display stories
function filterAndDisplayStories() {
    let filteredStories = [...successStories];
    
    // Filter by category
    if (currentStoryFilter !== 'all') {
        filteredStories = filteredStories.filter(story => story.category_id === currentStoryFilter);
    }
    
    displaySuccessStories(filteredStories);
}

// Display success stories
function displaySuccessStories(stories) {
    const container = document.getElementById('stories-list');
    if (!container) return;
    
    if (stories.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-heart fs-1 text-muted"></i>
                <h4 class="text-muted mt-3">No stories found</h4>
                <p class="text-muted">Be the first to share your recovery story!</p>
                <button class="btn btn-primary" onclick="showStorySubmissionModal()">Share Your Story</button>
            </div>
        `;
        return;
    }
    
    const html = stories.map(story => `
        <div class="card mb-4 story-card" data-story-id="${story.id}">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h5 class="card-title">${story.title}</h5>
                        <div class="mb-2">
                            ${story.categories ? story.categories.map(category => 
                                `<span class="badge bg-secondary me-1">${category}</span>`
                            ).join('') : ''}
                        </div>
                        <p class="card-text">${truncateText(story.content, 300)}</p>
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <small class="text-muted">
                                    By ${story.user_profiles?.is_anonymous ? 'Anonymous' : story.user_profiles?.display_name || 'Community Member'}
                                </small>
                                <br>
                                <small class="text-muted">
                                    ${formatDate(story.created_at)}
                                </small>
                            </div>
                            
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="showStoryDetail('${story.id}')">
                                    <i class="bi bi-eye"></i> Read Full Story
                                </button>
                                <button class="btn btn-outline-secondary" onclick="likeStory('${story.id}')">
                                    <i class="bi bi-heart"></i> ${story.likes || 0}
                                </button>
                                <button class="btn btn-outline-info" onclick="shareStory('${story.id}')">
                                    <i class="bi bi-share"></i> Share
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        ${story.media_url ? `
                            <div class="story-media">
                                ${story.media_type === 'image' ? 
                                    `<img src="${story.media_url}" class="img-fluid rounded" alt="Story media">` :
                                    story.media_type === 'video' ? 
                                    `<div class="ratio ratio-16x9">
                                        <iframe src="${story.media_url}" frameborder="0" allowfullscreen></iframe>
                                    </div>` : ''
                                }
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Show story submission modal
window.showStorySubmissionModal = function() {
    if (!auth.currentUser && !auth.isAnonymous) {
        showNotification('Please log in to share your story', 'warning');
        return;
    }
    
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
                                        ${storyCategories.map(category => 
                                            `<option value="${category.id}">${category.name}</option>`
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
                                    <strong>Submission Guidelines:</strong>
                                    <ul class="mb-0 mt-2">
                                        <li>Focus on hope and recovery</li>
                                        <li>Share your personal experience</li>
                                        <li>Respect others' privacy</li>
                                        <li>Stories are reviewed before publishing</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="submitStory()">Submit Story</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    modal.addEventListener('hidden.bs.modal', function() {
        modal.remove();
    });
};

// Submit story
window.submitStory = async function() {
    const title = document.getElementById('story-title').value.trim();
    const content = document.getElementById('story-content').value.trim();
    const categories = Array.from(document.getElementById('story-categories').selectedOptions).map(option => option.value);
    const recoveryTime = document.getElementById('story-recovery-time').value;
    const ageGroup = document.getElementById('story-age-group').value;
    const isAnonymous = document.getElementById('story-anonymous').checked;
    const videoLink = document.getElementById('story-video-link').value.trim();
    
    if (!title || !content) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }
    
    // Content moderation
    const moderationResult = await moderateStoryContent(content);
    if (!moderationResult.approved) {
        showNotification('Content flagged for review: ' + moderationResult.reason, 'warning');
        return;
    }
    
    try {
        // Handle file upload if present
        let mediaUrl = null;
        let mediaType = null;
        
        const fileInput = document.getElementById('story-media');
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const { data: uploadData, error: uploadError } = await uploadStoryMedia(file);
            if (uploadError) throw uploadError;
            mediaUrl = uploadData.url;
            mediaType = file.type.startsWith('image/') ? 'image' : 'video';
        } else if (videoLink) {
            mediaUrl = videoLink;
            mediaType = 'video';
        }
        
        const storyData = {
            title,
            content,
            categories,
            recovery_time: recoveryTime,
            age_group: ageGroup,
            user_id: auth.currentUser?.id || 'anonymous',
            is_anonymous: isAnonymous || auth.isAnonymous,
            media_url: mediaUrl,
            media_type: mediaType,
            status: 'pending',
            likes: 0,
            views: 0
        };
        
        const { data, error } = await supabase
            .from('success_stories')
            .insert([storyData])
            .select()
            .single();
        
        if (error) throw error;
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('storySubmissionModal'));
        modal.hide();
        
        showNotification('Story submitted successfully! It will be reviewed before publishing.', 'success');
    } catch (error) {
        showNotification('Error submitting story: ' + error.message, 'error');
    }
};

// Upload story media
async function uploadStoryMedia(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `story-media/${fileName}`;
    
    const { data, error } = await supabase.storage
        .from('story-media')
        .upload(filePath, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
        .from('story-media')
        .getPublicUrl(filePath);
    
    return { data: { url: publicUrl }, error: null };
}

// Moderate story content
async function moderateStoryContent(content) {
    // Simple keyword-based moderation
    const flaggedWords = ['spam', 'advertisement', 'promotion', 'inappropriate'];
    const hasFlaggedWords = flaggedWords.some(word => 
        content.toLowerCase().includes(word)
    );
    
    if (hasFlaggedWords) {
        return {
            approved: false,
            reason: 'Content contains flagged words'
        };
    }
    
    // Check for appropriate length
    if (content.length < 100) {
        return {
            approved: false,
            reason: 'Story too short - please provide more details'
        };
    }
    
    return { approved: true };
}

// Show story detail
window.showStoryDetail = async function(storyId) {
    try {
        const { data, error } = await supabase
            .from('success_stories')
            .select(`
                *,
                user_profiles(display_name, is_anonymous)
            `)
            .eq('id', storyId)
            .single();
        
        if (error) throw error;
        
        // Increment view count
        await supabase
            .from('success_stories')
            .update({ views: (data.views || 0) + 1 })
            .eq('id', storyId);
        
        displayStoryDetail(data);
    } catch (error) {
        showNotification('Error loading story: ' + error.message, 'error');
    }
};

// Display story detail
function displayStoryDetail(story) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'storyDetailModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${story.title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-8">
                            <div class="mb-3">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <small class="text-muted">
                                            By ${story.user_profiles?.is_anonymous ? 'Anonymous' : story.user_profiles?.display_name || 'Community Member'}
                                        </small>
                                        <br>
                                        <small class="text-muted">
                                            ${formatDate(story.created_at)}
                                        </small>
                                    </div>
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-outline-primary" onclick="likeStory('${story.id}')">
                                            <i class="bi bi-heart"></i> ${story.likes || 0}
                                        </button>
                                        <button class="btn btn-outline-info" onclick="shareStory('${story.id}')">
                                            <i class="bi bi-share"></i> Share
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                ${story.categories ? story.categories.map(category => 
                                    `<span class="badge bg-secondary me-1">${category}</span>`
                                ).join('') : ''}
                                ${story.recovery_time ? `<span class="badge bg-info me-1">${story.recovery_time}</span>` : ''}
                                ${story.age_group ? `<span class="badge bg-warning">${story.age_group}</span>` : ''}
                            </div>
                            
                            <div class="story-content">
                                ${formatStoryContent(story.content)}
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            ${story.media_url ? `
                                <div class="story-media mb-3">
                                    ${story.media_type === 'image' ? 
                                        `<img src="${story.media_url}" class="img-fluid rounded" alt="Story media">` :
                                        story.media_type === 'video' ? 
                                        `<div class="ratio ratio-16x9">
                                            <iframe src="${story.media_url}" frameborder="0" allowfullscreen></iframe>
                                        </div>` : ''
                                    }
                                </div>
                            ` : ''}
                            
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="mb-0">Story Stats</h6>
                                </div>
                                <div class="card-body">
                                    <div class="d-flex justify-content-between mb-2">
                                        <span>Views:</span>
                                        <span>${story.views || 0}</span>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span>Likes:</span>
                                        <span>${story.likes || 0}</span>
                                    </div>
                                    <div class="d-flex justify-content-between">
                                        <span>Recovery Time:</span>
                                        <span>${story.recovery_time || 'Not specified'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    modal.addEventListener('hidden.bs.modal', function() {
        modal.remove();
    });
};

// Like story
window.likeStory = async function(storyId) {
    if (!auth.currentUser && !auth.isAnonymous) {
        showNotification('Please log in to like stories', 'warning');
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('success_stories')
            .update({ likes: supabase.sql`likes + 1` })
            .eq('id', storyId)
            .select()
            .single();
        
        if (error) throw error;
        
        // Update UI
        await loadSuccessStories();
        showNotification('Story liked!', 'success');
    } catch (error) {
        showNotification('Error liking story: ' + error.message, 'error');
    }
};

// Share story
window.shareStory = function(storyId) {
    const story = successStories.find(s => s.id === storyId);
    if (!story) return;
    
    const shareData = {
        title: story.title,
        text: truncateText(story.content, 100),
        url: window.location.origin + '/success-stories.html?id=' + storyId
    };
    
    if (navigator.share) {
        navigator.share(shareData);
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareData.url);
        showNotification('Story link copied to clipboard!', 'success');
    }
};

// Search stories
window.searchStories = function() {
    const searchTerm = document.getElementById('story-search').value.toLowerCase();
    
    if (!searchTerm) {
        filterAndDisplayStories();
        return;
    }
    
    const filteredStories = successStories.filter(story => 
        story.title.toLowerCase().includes(searchTerm) ||
        story.content.toLowerCase().includes(searchTerm) ||
        (story.categories && story.categories.some(cat => cat.toLowerCase().includes(searchTerm)))
    );
    
    displaySuccessStories(filteredStories);
};

// Utility functions
function formatStoryContent(content) {
    // Simple formatting - in production, use a proper markdown parser
    return content
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
}

// Export functions for global access
window.successStories = {
    loadSuccessStories,
    showStorySubmissionModal,
    showStoryDetail,
    likeStory,
    shareStory,
    searchStories
}; 