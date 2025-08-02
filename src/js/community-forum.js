// src/js/community-forum.js - Community Forum System

// Forum state management
let forumPosts = [];
let currentCategory = 'all';
let currentSort = 'newest';
let userPosts = [];
let privateMessages = [];

// Initialize forum
document.addEventListener('DOMContentLoaded', function() {
    initializeForum();
    setupForumListeners();
});

// Initialize forum system
async function initializeForum() {
    try {
        await loadForumPosts();
        await loadCategories();
        setupForumUI();
    } catch (error) {
        console.error('Forum initialization error:', error);
        showNotification('Error loading forum: ' + error.message, 'error');
    }
}

// Setup forum event listeners
function setupForumListeners() {
    // Category filter
    const categorySelect = document.getElementById('forum-category');
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            currentCategory = this.value;
            filterAndDisplayPosts();
        });
    }

    // Sort options
    const sortSelect = document.getElementById('forum-sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            filterAndDisplayPosts();
        });
    }
}

// Setup forum UI
function setupForumUI() {
    const forumContainer = document.getElementById('forum-container');
    if (!forumContainer) return;

    forumContainer.innerHTML = `
        <div class="row">
            <div class="col-lg-8">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Community Forum</h2>
                    <button class="btn btn-primary" onclick="showNewPostModal()">
                        <i class="bi bi-plus-circle"></i> New Post
                    </button>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <select id="forum-category" class="form-select">
                            <option value="all">All Categories</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <select id="forum-sort" class="form-select">
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="popular">Most Popular</option>
                            <option value="recent">Recently Active</option>
                        </select>
                    </div>
                </div>
                
                <div id="forum-posts"></div>
            </div>
            
            <div class="col-lg-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Forum Guidelines</h5>
                    </div>
                    <div class="card-body">
                        <ul class="list-unstyled mb-0">
                            <li><i class="bi bi-check-circle text-success"></i> Be supportive and respectful</li>
                            <li><i class="bi bi-check-circle text-success"></i> Share experiences, not medical advice</li>
                            <li><i class="bi bi-check-circle text-success"></i> Protect your privacy</li>
                            <li><i class="bi bi-check-circle text-success"></i> Report inappropriate content</li>
                        </ul>
                    </div>
                </div>
                
                <div class="card mt-3">
                    <div class="card-header">
                        <h5 class="mb-0">Quick Actions</h5>
                    </div>
                    <div class="card-body">
                        <button class="btn btn-outline-primary btn-sm w-100 mb-2" onclick="showNewPostModal()">
                            <i class="bi bi-plus-circle"></i> New Post
                        </button>
                        <button class="btn btn-outline-secondary btn-sm w-100 mb-2" onclick="showPrivateMessages()">
                            <i class="bi bi-envelope"></i> Messages
                        </button>
                        <button class="btn btn-outline-info btn-sm w-100" onclick="showMyPosts()">
                            <i class="bi bi-person"></i> My Posts
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Load forum posts
async function loadForumPosts() {
    try {
        const { data, error } = await supabase
            .from('forum_posts')
            .select(`
                *,
                user_profiles(display_name, is_anonymous),
                forum_comments(count)
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        forumPosts = data || [];
        filterAndDisplayPosts();
    } catch (error) {
        console.error('Error loading forum posts:', error);
        throw error;
    }
}

// Load categories
async function loadCategories() {
    try {
        const { data, error } = await supabase
            .from('forum_categories')
            .select('*')
            .order('name');
        
        if (error) throw error;
        
        const categorySelect = document.getElementById('forum-category');
        if (categorySelect && data) {
            const options = data.map(category => 
                `<option value="${category.id}">${category.name}</option>`
            ).join('');
            categorySelect.innerHTML += options;
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Filter and display posts
function filterAndDisplayPosts() {
    let filteredPosts = [...forumPosts];
    
    // Filter by category
    if (currentCategory !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.category_id === currentCategory);
    }
    
    // Sort posts
    switch (currentSort) {
        case 'newest':
            filteredPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'oldest':
            filteredPosts.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case 'popular':
            filteredPosts.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
            break;
        case 'recent':
            filteredPosts.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
            break;
    }
    
    displayForumPosts(filteredPosts);
}

// Display forum posts
function displayForumPosts(posts) {
    const container = document.getElementById('forum-posts');
    if (!container) return;
    
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-chat-dots fs-1 text-muted"></i>
                <h4 class="text-muted mt-3">No posts found</h4>
                <p class="text-muted">Be the first to start a discussion!</p>
                <button class="btn btn-primary" onclick="showNewPostModal()">Create First Post</button>
            </div>
        `;
        return;
    }
    
    const html = posts.map(post => `
        <div class="card mb-3 forum-post" data-post-id="${post.id}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h5 class="card-title mb-1">
                            <a href="#" onclick="showPostDetail('${post.id}')" class="text-decoration-none">
                                ${post.title}
                            </a>
                        </h5>
                        <div class="mb-2">
                            ${post.tags ? post.tags.map(tag => 
                                `<span class="badge bg-secondary me-1">${tag}</span>`
                            ).join('') : ''}
                        </div>
                    </div>
                    <div class="text-end">
                        <small class="text-muted">
                            ${post.user_profiles?.is_anonymous ? 'Anonymous' : post.user_profiles?.display_name || 'User'}
                        </small>
                        <br>
                        <small class="text-muted">
                            ${formatDate(post.created_at)}
                        </small>
                    </div>
                </div>
                
                <p class="card-text">${truncateText(post.content, 200)}</p>
                
                <div class="d-flex justify-content-between align-items-center">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="upvotePost('${post.id}')">
                            <i class="bi bi-arrow-up"></i> ${post.upvotes || 0}
                        </button>
                        <button class="btn btn-outline-secondary" onclick="showPostDetail('${post.id}')">
                            <i class="bi bi-chat"></i> ${post.forum_comments?.[0]?.count || 0}
                        </button>
                        <button class="btn btn-outline-info" onclick="sharePost('${post.id}')">
                            <i class="bi bi-share"></i>
                        </button>
                    </div>
                    
                    <div class="dropdown">
                        <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            <i class="bi bi-three-dots"></i>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#" onclick="reportPost('${post.id}')">
                                <i class="bi bi-flag"></i> Report
                            </a></li>
                            ${post.user_id === (auth.currentUser?.id || '') ? `
                                <li><a class="dropdown-item" href="#" onclick="editPost('${post.id}')">
                                    <i class="bi bi-pencil"></i> Edit
                                </a></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="deletePost('${post.id}')">
                                    <i class="bi bi-trash"></i> Delete
                                </a></li>
                            ` : ''}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Show new post modal
window.showNewPostModal = function() {
    if (!auth.currentUser && !auth.isAnonymous) {
        showNotification('Please log in to create a post', 'warning');
        return;
    }
    
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
    
    // Load categories for the select
    loadCategoriesForModal();
    
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    // Clean up modal when hidden
    modal.addEventListener('hidden.bs.modal', function() {
        modal.remove();
    });
};

// Load categories for modal
async function loadCategoriesForModal() {
    try {
        const { data, error } = await supabase
            .from('forum_categories')
            .select('*')
            .order('name');
        
        if (error) throw error;
        
        const categorySelect = document.getElementById('post-category');
        if (categorySelect && data) {
            const options = data.map(category => 
                `<option value="${category.id}">${category.name}</option>`
            ).join('');
            categorySelect.innerHTML += options;
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Submit new post
window.submitNewPost = async function() {
    const title = document.getElementById('post-title').value.trim();
    const categoryId = document.getElementById('post-category').value;
    const tags = document.getElementById('post-tags').value.trim();
    const content = document.getElementById('post-content').value.trim();
    const isAnonymous = document.getElementById('post-anonymous').checked;
    
    if (!title || !categoryId || !content) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }
    
    // AI content moderation
    const moderationResult = await moderateContent(content);
    if (!moderationResult.approved) {
        showNotification('Content flagged for review: ' + moderationResult.reason, 'warning');
        return;
    }
    
    try {
        const postData = {
            title,
            content,
            category_id: categoryId,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            user_id: auth.currentUser?.id || 'anonymous',
            is_anonymous: isAnonymous || auth.isAnonymous,
            upvotes: 0,
            downvotes: 0,
            status: 'active'
        };
        
        const { data, error } = await supabase
            .from('forum_posts')
            .insert([postData])
            .select()
            .single();
        
        if (error) throw error;
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('newPostModal'));
        modal.hide();
        
        // Reload posts
        await loadForumPosts();
        showNotification('Post created successfully!', 'success');
    } catch (error) {
        showNotification('Error creating post: ' + error.message, 'error');
    }
};

// AI content moderation
async function moderateContent(content) {
    // Simple keyword-based moderation (in production, use a proper AI service)
    const flaggedWords = ['spam', 'advertisement', 'promotion'];
    const hasFlaggedWords = flaggedWords.some(word => 
        content.toLowerCase().includes(word)
    );
    
    if (hasFlaggedWords) {
        return {
            approved: false,
            reason: 'Content contains flagged words'
        };
    }
    
    // Check for appropriate tone and length
    if (content.length < 10) {
        return {
            approved: false,
            reason: 'Content too short'
        };
    }
    
    return { approved: true };
}

// Show post detail
window.showPostDetail = async function(postId) {
    try {
        const { data, error } = await supabase
            .from('forum_posts')
            .select(`
                *,
                user_profiles(display_name, is_anonymous),
                forum_comments(
                    *,
                    user_profiles(display_name, is_anonymous)
                )
            `)
            .eq('id', postId)
            .single();
        
        if (error) throw error;
        
        displayPostDetail(data);
    } catch (error) {
        showNotification('Error loading post: ' + error.message, 'error');
    }
};

// Display post detail
function displayPostDetail(post) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'postDetailModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${post.title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-4">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <small class="text-muted">
                                    By ${post.user_profiles?.is_anonymous ? 'Anonymous' : post.user_profiles?.display_name || 'User'}
                                </small>
                                <br>
                                <small class="text-muted">
                                    ${formatDate(post.created_at)}
                                </small>
                            </div>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="upvotePost('${post.id}')">
                                    <i class="bi bi-arrow-up"></i> ${post.upvotes || 0}
                                </button>
                                <button class="btn btn-outline-secondary" onclick="downvotePost('${post.id}')">
                                    <i class="bi bi-arrow-down"></i> ${post.downvotes || 0}
                                </button>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            ${post.tags ? post.tags.map(tag => 
                                `<span class="badge bg-secondary me-1">${tag}</span>`
                            ).join('') : ''}
                        </div>
                        
                        <div class="post-content">
                            ${formatPostContent(post.content)}
                        </div>
                    </div>
                    
                    <hr>
                    
                    <div class="comments-section">
                        <h6>Comments (${post.forum_comments?.length || 0})</h6>
                        <div id="comments-container">
                            ${displayComments(post.forum_comments || [])}
                        </div>
                        
                        <div class="mt-3">
                            <textarea class="form-control" id="new-comment" rows="3" 
                                placeholder="Add a comment..."></textarea>
                            <button class="btn btn-primary btn-sm mt-2" onclick="addComment('${post.id}')">
                                Add Comment
                            </button>
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

// Display comments
function displayComments(comments) {
    if (comments.length === 0) {
        return '<p class="text-muted">No comments yet. Be the first to comment!</p>';
    }
    
    return comments.map(comment => `
        <div class="card mb-2">
            <div class="card-body">
                <div class="d-flex justify-content-between">
                    <small class="text-muted">
                        ${comment.user_profiles?.is_anonymous ? 'Anonymous' : comment.user_profiles?.display_name || 'User'}
                    </small>
                    <small class="text-muted">
                        ${formatDate(comment.created_at)}
                    </small>
                </div>
                <p class="mb-1">${comment.content}</p>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary btn-sm" onclick="upvoteComment('${comment.id}')">
                        <i class="bi bi-arrow-up"></i> ${comment.upvotes || 0}
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" onclick="replyToComment('${comment.id}')">
                        <i class="bi bi-reply"></i> Reply
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Add comment
window.addComment = async function(postId) {
    if (!auth.currentUser && !auth.isAnonymous) {
        showNotification('Please log in to comment', 'warning');
        return;
    }
    
    const content = document.getElementById('new-comment').value.trim();
    if (!content) {
        showNotification('Please enter a comment', 'warning');
        return;
    }
    
    try {
        const commentData = {
            post_id: postId,
            content,
            user_id: auth.currentUser?.id || 'anonymous',
            is_anonymous: auth.isAnonymous,
            upvotes: 0,
            downvotes: 0
        };
        
        const { data, error } = await supabase
            .from('forum_comments')
            .insert([commentData])
            .select()
            .single();
        
        if (error) throw error;
        
        // Clear comment input
        document.getElementById('new-comment').value = '';
        
        // Reload post detail
        await showPostDetail(postId);
        showNotification('Comment added successfully!', 'success');
    } catch (error) {
        showNotification('Error adding comment: ' + error.message, 'error');
    }
};

// Upvote post
window.upvotePost = async function(postId) {
    if (!auth.currentUser && !auth.isAnonymous) {
        showNotification('Please log in to vote', 'warning');
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('forum_posts')
            .update({ upvotes: supabase.sql`upvotes + 1` })
            .eq('id', postId)
            .select()
            .single();
        
        if (error) throw error;
        
        // Update UI
        await loadForumPosts();
        showNotification('Post upvoted!', 'success');
    } catch (error) {
        showNotification('Error upvoting post: ' + error.message, 'error');
    }
};

// Report post
window.reportPost = function(postId) {
    const reason = prompt('Please provide a reason for reporting this post:');
    if (reason) {
        // In production, send to moderation queue
        showNotification('Post reported. Thank you for helping keep our community safe.', 'info');
    }
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

function formatPostContent(content) {
    // Simple formatting - in production, use a proper markdown parser
    return content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// Export functions for global access
window.forum = {
    loadForumPosts,
    showNewPostModal,
    showPostDetail,
    addComment,
    upvotePost,
    reportPost
}; 