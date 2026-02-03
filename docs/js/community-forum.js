/*!
* Start Bootstrap - Creative v7.0.8 (https://YOUR_USERNAME.github.io/sober-spokane)
* Copyright 2013-2026 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-creative/blob/master/LICENSE)
* Built: 2026-02-03T03:05:35.346Z
*/
// src/js/community-forum.js - Community Forum (No Auth Required)

// Forum state management
let forumData = {
    posts: [],
    comments: [],
    categories: [
        'General Discussion',
        'Recovery Support',
        'Treatment & Resources',
        'Family & Friends',
        'Mental Health',
        'Employment & Housing',
        'Sober Activities',
        'Success Stories'
    ]
};

// Initialize forum
document.addEventListener('DOMContentLoaded', function() {
    initializeForum();
    setupForumListeners();
});

// Initialize forum system
function initializeForum() {
    try {
        loadForumData();
        loadPosts();
        setupCategories();
    } catch (error) {
        console.error('Forum initialization error:', error);
        showNotification('Error loading forum: ' + error.message, 'error');
    }
}

// Setup forum event listeners
function setupForumListeners() {
    // Search functionality
    const searchInput = document.getElementById('forum-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchPosts(this.value);
        });
    }
    
    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            filterPostsByCategory(this.value);
        });
    }
    
    // Sort options
    const sortSelect = document.getElementById('sort-posts');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortPosts(this.value);
        });
    }
}

// Load forum data from localStorage
function loadForumData() {
    console.log('Loading forum data...');
    
    // Load from localStorage if available
    const savedData = localStorage.getItem('forumData');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            forumData = { ...forumData, ...parsed };
        } catch (e) {
            console.error('Error parsing saved forum data:', e);
        }
    }
    
    // If no posts exist, create some sample posts
    if (forumData.posts.length === 0) {
        createSamplePosts();
    }
    
    console.log('Forum data loaded:', forumData);
}

// Create sample posts for demonstration
function createSamplePosts() {
    const samplePosts = [
        {
            id: '1',
            title: 'Welcome to the Recovery Community',
            content: 'Hello everyone! I\'m new here and looking forward to connecting with others on their recovery journey. This community has already been so helpful.',
            category: 'General Discussion',
            tags: ['welcome', 'new', 'community'],
            user_id: 'anonymous',
            user_name: 'New Member',
            is_anonymous: false,
            upvotes: 5,
            downvotes: 0,
            comments_count: 3,
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            updated_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: '2',
            title: 'Tips for Staying Sober During Holidays',
            content: 'The holiday season can be challenging for those in recovery. Here are some strategies that have helped me: 1) Plan ahead, 2) Have sober activities ready, 3) Stay connected with support network.',
            category: 'Recovery Support',
            tags: ['holidays', 'tips', 'sobriety'],
            user_id: 'anonymous',
            user_name: 'Recovery Warrior',
            is_anonymous: false,
            upvotes: 12,
            downvotes: 1,
            comments_count: 7,
            created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            updated_at: new Date(Date.now() - 172800000).toISOString()
        },
        {
            id: '3',
            title: 'Local AA Meeting Recommendations',
            content: 'Looking for recommendations for AA meetings in the Spokane area. I\'ve tried a few but would love to hear about others\' experiences.',
            category: 'Treatment & Resources',
            tags: ['AA', 'meetings', 'Spokane', 'recommendations'],
            user_id: 'anonymous',
            user_name: 'Seeking Support',
            is_anonymous: false,
            upvotes: 8,
            downvotes: 0,
            comments_count: 5,
            created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            updated_at: new Date(Date.now() - 259200000).toISOString()
        }
    ];
    
    forumData.posts = samplePosts;
    saveForumData();
}

// Setup categories
function setupCategories() {
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.innerHTML = `
            <option value="">All Categories</option>
            ${forumData.categories.map(category => 
                `<option value="${category}">${category}</option>`
            ).join('')}
        `;
    }
}

// Load posts
function loadPosts() {
    const container = document.getElementById('posts-container');
    if (!container) return;
    
    if (forumData.posts.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-chat-dots fs-1 text-muted"></i>
                <h4 class="mt-3">No posts yet</h4>
                <p class="text-muted">Be the first to start a conversation!</p>
                <button class="btn btn-primary" onclick="showNewPostModal()">
                    <i class="bi bi-plus-circle me-2"></i>Create First Post
                </button>
            </div>
        `;
        return;
    }
    
    const postsHTML = forumData.posts.map(post => createPostHTML(post)).join('');
    container.innerHTML = postsHTML;
}

// Create post HTML
function createPostHTML(post) {
    const timeAgo = formatTimeAgo(post.created_at);
    const tagsHTML = post.tags.map(tag => `<span class="badge bg-light text-dark me-1">${tag}</span>`).join('');
    
    return `
        <div class="card mb-3 post-card" data-post-id="${post.id}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h5 class="card-title mb-1">
                            <a href="#" onclick="viewPost('${post.id}')" class="text-decoration-none">${post.title}</a>
                        </h5>
                        <div class="text-muted small">
                            <i class="bi bi-person me-1"></i>${post.user_name}
                            <i class="bi bi-clock me-2 ms-2"></i>${timeAgo}
                            <i class="bi bi-tag me-2 ms-2"></i>${post.category}
                        </div>
                    </div>
                    <div class="dropdown">
                        <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            <i class="bi bi-three-dots"></i>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#" onclick="reportPost('${post.id}')">
                                <i class="bi bi-flag"></i> Report
                            </a></li>
                            <li><a class="dropdown-item" href="#" onclick="editPost('${post.id}')">
                                <i class="bi bi-pencil"></i> Edit
                            </a></li>
                            <li><a class="dropdown-item text-danger" href="#" onclick="deletePost('${post.id}')">
                                <i class="bi bi-trash"></i> Delete
                            </a></li>
                        </ul>
                    </div>
                </div>
                
                <p class="card-text">${truncateText(post.content, 200)}</p>
                
                <div class="mb-2">
                    ${tagsHTML}
                </div>
                
                <div class="d-flex justify-content-between align-items-center">
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-primary" onclick="upvotePost('${post.id}')">
                            <i class="bi bi-arrow-up"></i> ${post.upvotes}
                        </button>
                        <button class="btn btn-outline-secondary" onclick="downvotePost('${post.id}')">
                            <i class="bi bi-arrow-down"></i> ${post.downvotes}
                        </button>
                        <button class="btn btn-outline-info" onclick="viewPost('${post.id}')">
                            <i class="bi bi-chat"></i> ${post.comments_count} Comments
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Show new post modal
window.showNewPostModal = function() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'newPostModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Create New Post</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="newPostForm">
                        <div class="mb-3">
                            <label for="post-title" class="form-label">Title</label>
                            <input type="text" class="form-control" id="post-title" required maxlength="200">
                        </div>
                        
                        <div class="mb-3">
                            <label for="post-category" class="form-label">Category</label>
                            <select class="form-select" id="post-category" required>
                                <option value="">Select a category</option>
                                ${forumData.categories.map(category => 
                                    `<option value="${category}">${category}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="mb-3">
                            <label for="post-tags" class="form-label">Tags (comma-separated)</label>
                            <input type="text" class="form-control" id="post-tags" placeholder="recovery, support, advice">
                        </div>
                        
                        <div class="mb-3">
                            <label for="post-content" class="form-label">Content</label>
                            <textarea class="form-control" id="post-content" rows="8" required 
                                placeholder="Share your thoughts, experiences, or questions..."></textarea>
                        </div>
                        
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="post-anonymous">
                                <label class="form-check-label" for="post-anonymous">
                                    Post anonymously
                                </label>
                            </div>
                        </div>
                        
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle"></i>
                            <strong>Community Guidelines:</strong> Be supportive, respectful, and mindful of others' privacy. 
                            Share experiences rather than medical advice.
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="submitNewPost()">Create Post</button>
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

// Submit new post
window.submitNewPost = function() {
    const title = document.getElementById('post-title').value.trim();
    const category = document.getElementById('post-category').value;
    const tags = document.getElementById('post-tags').value.trim();
    const content = document.getElementById('post-content').value.trim();
    const isAnonymous = document.getElementById('post-anonymous').checked;
    
    if (!title || !category || !content) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }
    
    const newPost = {
        id: Date.now().toString(),
        title: title,
        content: content,
        category: category,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        user_id: 'anonymous',
        user_name: isAnonymous ? 'Anonymous User' : 'Guest User',
        is_anonymous: isAnonymous,
        upvotes: 0,
        downvotes: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    // Add to forum data
    forumData.posts.unshift(newPost);
    
    // Save to localStorage
    saveForumData();
    
    // Reload posts
    loadPosts();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('newPostModal'));
    if (modal) modal.hide();
    
    // Clear form
    document.getElementById('newPostForm').reset();
    
    showNotification('Post created successfully!', 'success');
};

// View post details
window.viewPost = function(postId) {
    const post = forumData.posts.find(p => p.id === postId);
    if (!post) return;
    
    // For now, just show a simple alert with the full content
    // In a real implementation, this would open a detailed view modal
    alert(`Full Post: ${post.title}\n\n${post.content}`);
};

// Edit post
window.editPost = function(postId) {
    const post = forumData.posts.find(p => p.id === postId);
    if (!post) return;
    
    // For now, just show a simple prompt
    // In a real implementation, this would open an edit modal
    const newTitle = prompt('Edit post title:', post.title);
    if (newTitle && newTitle.trim()) {
        post.title = newTitle.trim();
        post.updated_at = new Date().toISOString();
        saveForumData();
        loadPosts();
        showNotification('Post updated successfully!', 'success');
    }
};

// Delete post
window.deletePost = function(postId) {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
    }
    
    const index = forumData.posts.findIndex(p => p.id === postId);
    if (index !== -1) {
        forumData.posts.splice(index, 1);
        saveForumData();
        loadPosts();
        showNotification('Post deleted successfully!', 'success');
    }
};

// Report post
window.reportPost = function(postId) {
    showNotification('Thank you for reporting. Our moderators will review this post.', 'info');
};

// Upvote post
window.upvotePost = function(postId) {
    const post = forumData.posts.find(p => p.id === postId);
    if (post) {
        post.upvotes++;
        saveForumData();
        loadPosts();
    }
};

// Downvote post
window.downvotePost = function(postId) {
    const post = forumData.posts.find(p => p.id === postId);
    if (post) {
        post.downvotes++;
        saveForumData();
        loadPosts();
    }
};

// Search posts
function searchPosts(query) {
    if (!query.trim()) {
        loadPosts();
        return;
    }
    
    const filteredPosts = forumData.posts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    displayFilteredPosts(filteredPosts);
}

// Filter posts by category
function filterPostsByCategory(category) {
    if (!category) {
        loadPosts();
        return;
    }
    
    const filteredPosts = forumData.posts.filter(post => post.category === category);
    displayFilteredPosts(filteredPosts);
}

// Sort posts
function sortPosts(sortBy) {
    let sortedPosts = [...forumData.posts];
    
    switch (sortBy) {
        case 'newest':
            sortedPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'oldest':
            sortedPosts.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case 'most-voted':
            sortedPosts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
            break;
        case 'most-commented':
            sortedPosts.sort((a, b) => b.comments_count - a.comments_count);
            break;
        default:
            // Default to newest
            sortedPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    displayFilteredPosts(sortedPosts);
}

// Display filtered posts
function displayFilteredPosts(posts) {
    const container = document.getElementById('posts-container');
    if (!container) return;
    
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-search fs-1 text-muted"></i>
                <h4 class="mt-3">No posts found</h4>
                <p class="text-muted">Try adjusting your search or filter criteria.</p>
            </div>
        `;
        return;
    }
    
    const postsHTML = posts.map(post => createPostHTML(post)).join('');
    container.innerHTML = postsHTML;
}

// Save forum data to localStorage
function saveForumData() {
    try {
        localStorage.setItem('forumData', JSON.stringify(forumData));
    } catch (error) {
        console.error('Error saving forum data:', error);
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
window.forum = {
    initializeForum,
    loadPosts,
    searchPosts,
    filterPostsByCategory,
    sortPosts,
    upvotePost,
    downvotePost,
    reportPost
}; 