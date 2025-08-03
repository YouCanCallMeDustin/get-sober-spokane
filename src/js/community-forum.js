// Community Forum JavaScript

document.addEventListener('DOMContentLoaded', () => {
  console.log('Community forum page loaded');
});

// Forum state management
let forumData = {
    posts: [],
    comments: [],
    currentPost: null,
    filters: {
        search: '',
        category: '',
        sort: 'newest'
    }
};

// Initialize forum
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing community forum...');
    
    // Check if we're already on the forum page and need to initialize auth
    if (typeof auth === 'undefined') {
        console.log('Waiting for authentication system...');
        // Wait for auth to be loaded
        const checkAuth = setInterval(() => {
            if (typeof auth !== 'undefined') {
                console.log('Authentication system ready');
                clearInterval(checkAuth);
                checkAuthAndInitialize();
            }
        }, 100);
        
        // Timeout after 15 seconds
        setTimeout(() => {
            clearInterval(checkAuth);
            console.error('Authentication system not ready after 15 seconds');
            showNotification('Authentication system not ready. Please refresh the page.', 'error');
        }, 15000);
    } else {
        console.log('Authentication system available');
        checkAuthAndInitialize();
    }
});

// Check auth and initialize forum
async function checkAuthAndInitialize() {
    try {
        // Check if user has a session
        const { data: { session }, error } = await window.supabase.auth.getSession();
        
        if (error) {
            console.error('Error getting session:', error);
            showNotification('Authentication error. Please log in again.', 'error');
            return;
        }
        
        if (session) {
            console.log('User authenticated:', session.user.email);
            // Update global auth object
            window.auth.currentUser = session.user;
            // Update UI for authenticated user
            if (typeof updateUIForAuthenticatedUser === 'function') {
                updateUIForAuthenticatedUser();
            }
            // Load user profile if not already loaded
            if (!window.auth.userProfile) {
                await loadUserProfile();
            }
            initializeForum();
        } else {
            console.log('No active session - user not authenticated');
            // Clear global auth object
            window.auth.currentUser = null;
            window.auth.userProfile = null;
            window.auth.isAnonymous = false;
            // Update UI for unauthenticated user
            if (typeof updateUIForUnauthenticatedUser === 'function') {
                updateUIForUnauthenticatedUser();
            }
            // Initialize forum without user-specific features
            initializeForum();
        }
    } catch (error) {
        console.error('Error checking authentication:', error);
        showNotification('Error checking authentication. Please refresh the page.', 'error');
    }
}

// Load user profile
async function loadUserProfile() {
    try {
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session) return;
        
        const { data: profile, error } = await window.supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            console.error('Error loading user profile:', error);
            return;
        }
        
        if (profile) {
            window.auth.userProfile = profile;
            console.log('User profile loaded:', profile);
        } else {
            // Create profile if it doesn't exist
            const newProfile = {
                user_id: session.user.id,
                display_name: session.user.user_metadata?.full_name || 'User',
                email: session.user.email,
                is_anonymous: false
            };
            
            const { data: createdProfile, error: createError } = await window.supabase
                .from('user_profiles')
                .insert([newProfile])
                .select()
                .single();
            
            if (createError) {
                console.error('Error creating user profile:', createError);
                return;
            }
            
            window.auth.userProfile = createdProfile;
            console.log('User profile created:', createdProfile);
        }
    } catch (error) {
        console.error('Error in loadUserProfile:', error);
    }
}

// Initialize forum system
async function initializeForum() {
    try {
        console.log('Initializing forum...');
        await loadForumData();
        setupForumListeners();
        updateForumStats();
        console.log('Forum initialized successfully');
    } catch (error) {
        console.error('Forum initialization error:', error);
        showNotification('Error loading forum: ' + error.message, 'error');
    }
}

// Setup forum event listeners
function setupForumListeners() {
    // Search functionality
    const searchInput = document.getElementById('search-posts');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            forumData.filters.search = this.value;
            filterAndDisplayPosts();
        }, 300));
    }
    
    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            forumData.filters.category = this.value;
            filterAndDisplayPosts();
        });
    }

    // Sort filter
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            forumData.filters.sort = this.value;
            filterAndDisplayPosts();
        });
    }
    
    // Category sidebar clicks
    const categoryItems = document.querySelectorAll('[id^="category-"]');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            const category = this.id.replace('category-', '');
            forumData.filters.category = category;
            document.getElementById('category-filter').value = category;
            filterAndDisplayPosts();
        });
    });
}

// Load forum data
async function loadForumData() {
    console.log('Loading forum data...');
    
    try {
        // Load posts without foreign key relationships
        const { data: posts, error: postsError } = await window.supabase
            .from('forum_posts')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });
        
        if (postsError) throw postsError;
        
        // Load comments without foreign key relationships
        const { data: comments, error: commentsError } = await window.supabase
            .from('forum_comments')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });
        
        if (commentsError) throw commentsError;
        
        // Load user profiles for posts and comments
        const userIds = new Set();
        posts?.forEach(post => userIds.add(post.user_id));
        comments?.forEach(comment => userIds.add(comment.user_id));
        
        let userProfiles = {};
        if (userIds.size > 0) {
            const { data: profiles, error: profilesError } = await window.supabase
                .from('user_profiles')
                .select('user_id, display_name, email, is_anonymous')
                .in('user_id', Array.from(userIds));
            
            if (profilesError) {
                console.error('Error loading user profiles:', profilesError);
            } else {
                profiles?.forEach(profile => {
                    userProfiles[profile.user_id] = profile;
                });
            }
        }
        
        // Attach user profiles to posts and comments
        const postsWithProfiles = posts?.map(post => ({
            ...post,
            user_profiles: userProfiles[post.user_id] || null
        })) || [];
        
        const commentsWithProfiles = comments?.map(comment => ({
            ...comment,
            user_profiles: userProfiles[comment.user_id] || null
        })) || [];
        
        forumData.posts = postsWithProfiles;
        forumData.comments = commentsWithProfiles;
        
        console.log('Forum data loaded:', { posts: forumData.posts.length, comments: forumData.comments.length });
        
        // Display posts
        displayPosts();
        updateCategoryCounts();
        loadRecentActivity();
        
    } catch (error) {
        console.error('Error loading forum data:', error);
        throw error;
    }
}

// Display posts
function displayPosts() {
    const container = document.getElementById('posts-container');
    if (!container) return;
    
    if (forumData.posts.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-chat-dots display-1 text-muted"></i>
                <h4 class="mt-3">No posts yet</h4>
                <p class="text-muted">Be the first to start a conversation!</p>
                    <button class="btn btn-primary" onclick="showNewPostModal()">
                    <i class="bi bi-plus-circle.me-2"></i>Create First Post
                    </button>
                </div>
        `;
        return;
    }
    
    const html = forumData.posts.map(post => createPostCard(post)).join('');
    container.innerHTML = html;
}

// Create post card HTML
function createPostCard(post) {
    const user = post.user_profiles;
    const displayName = user?.is_anonymous ? 'Anonymous User' : (user?.display_name || 'Unknown User');
    const userAvatar = user?.is_anonymous ? '/assets/img/logo.png' : (auth.currentUser?.user_metadata?.avatar_url || '/assets/img/logo.png');
    
    const commentCount = forumData.comments.filter(c => c.post_id === post.id).length;
    const timeAgo = formatTimeAgo(post.created_at);
    
    return `
        <div class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <img src="${userAvatar}" alt="${displayName}" class="user-avatar me-3">
                        <div>
                            <h6 class="mb-0">${displayName}</h6>
                            <small class="text-muted">${timeAgo}</small>
                    </div>
                    </div>
                    <span class="category-badge">${getCategoryDisplayName(post.category)}</span>
                </div>
            </div>
            <div class="post-content">
                <h5 class="mb-2">${post.title}</h5>
                <p class="mb-0">${truncateText(post.content, 200)}</p>
                    </div>
            <div class="post-footer">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="interaction-buttons">
                        <button class="btn-interaction" onclick="likePost('${post.id}')" data-post-id="${post.id}">
                            <i class="bi bi-heart${post.liked ? '-fill text-danger' : ''}"></i>
                            <span class="ms-1">${post.likes || 0}</span>
                        </button>
                        <button class="btn-interaction" onclick="viewPost('${post.id}')">
                            <i class="bi bi-chat"></i>
                            <span class="ms-1">${commentCount}</span>
                        </button>
                        <button class="btn-interaction" onclick="sharePost('${post.id}')">
                            <i class="bi bi-share"></i>
                        </button>
                    </div>
                    <button class="btn btn-outline-primary btn-sm" onclick="viewPost('${post.id}')">
                        Read More
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Filter and display posts
function filterAndDisplayPosts() {
    let filteredPosts = [...forumData.posts];
    
    // Apply search filter
    if (forumData.filters.search) {
        const searchTerm = forumData.filters.search.toLowerCase();
        filteredPosts = filteredPosts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply category filter
    if (forumData.filters.category) {
        filteredPosts = filteredPosts.filter(post => post.category === forumData.filters.category);
    }
    
    // Apply sort filter
    switch (forumData.filters.sort) {
        case 'oldest':
            filteredPosts.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case 'popular':
            filteredPosts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
            break;
        case 'recent':
            filteredPosts.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
            break;
        default: // newest
            filteredPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    // Display filtered posts
    const container = document.getElementById('posts-container');
    if (!container) return;
    
    if (filteredPosts.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-search display-1 text-muted"></i>
                <h4 class="mt-3">No posts found</h4>
                <p class="text-muted">Try adjusting your search or filters.</p>
            </div>
        `;
        return;
    }
    
    const html = filteredPosts.map(post => createPostCard(post)).join('');
    container.innerHTML = html;
}

// Update forum statistics
function updateForumStats() {
    const totalPosts = document.getElementById('total-posts');
    const totalComments = document.getElementById('total-comments');
    const activeUsers = document.getElementById('active-users');
    const totalViews = document.getElementById('total-views');
    
    if (totalPosts) totalPosts.textContent = forumData.posts.length;
    if (totalComments) totalComments.textContent = forumData.comments.length;
    if (activeUsers) activeUsers.textContent = new Set(forumData.posts.map(p => p.user_id)).size;
    if (totalViews) totalViews.textContent = forumData.posts.reduce((sum, post) => sum + (post.views || 0), 0);
}

// Update category counts
function updateCategoryCounts() {
    const categories = ['general', 'support', 'resources', 'milestones', 'challenges'];
    
    categories.forEach(category => {
        const count = forumData.posts.filter(post => post.category === category).length;
        const badge = document.querySelector(`#category-${category} .badge`);
        if (badge) {
            badge.textContent = count;
        }
    });
}

// Load recent activity
function loadRecentActivity() {
    const container = document.getElementById('recent-activity');
    if (!container) return;
    
    const recentPosts = forumData.posts.slice(0, 5);
    
    if (recentPosts.length === 0) {
        container.innerHTML = `
            <div class="text-muted text-center">
                <i class="bi bi-clock.me-2"></i>No recent activity
                    </div>
        `;
        return;
    }
    
    const html = recentPosts.map(post => `
        <div class="d-flex align-items-center mb-2">
            <div class="flex-shrink-0">
                <i class="bi bi-chat-dots text-primary"></i>
                    </div>
            <div class="flex-grow-1 ms-2">
                <small class="d-block">${post.title}</small>
                <small class="text-muted">${formatTimeAgo(post.created_at)}</small>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Show new post modal
window.showNewPostModal = async function() {
    try {
        // Check if user is authenticated
        const { data: { session }, error } = await window.supabase.auth.getSession();
        
        if (error) {
            console.error('Error checking session:', error);
            showNotification('Authentication error. Please log in again.', 'error');
            return;
        }
        
        if (!session) {
        showNotification('Please log in to create a post', 'warning');
        return;
    }
    
        // Ensure user profile is loaded
        if (!auth.userProfile) {
            await loadUserProfile();
        }
        
        if (!auth.userProfile) {
            showNotification('Error loading user profile. Please try again.', 'error');
            return;
        }
        
        const modal = new bootstrap.Modal(document.getElementById('newPostModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error in showNewPostModal:', error);
        showNotification('Error opening post modal. Please try again.', 'error');
    }
};

// Submit new post
window.submitNewPost = async function() {
    try {
        // Check authentication first
        const { data: { session }, error } = await window.supabase.auth.getSession();
        
        if (error) {
            console.error('Error checking session:', error);
            showNotification('Authentication error. Please log in again.', 'error');
            return;
        }
        
        if (!session) {
            showNotification('Please log in to create a post', 'warning');
            return;
        }
        
    const title = document.getElementById('post-title').value.trim();
        const category = document.getElementById('post-category').value;
    const content = document.getElementById('post-content').value.trim();
        const anonymous = document.getElementById('post-anonymous').checked;
    
        if (!title || !category || !content) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }
    
        const newPost = {
            title: title,
            category: category,
            content: content,
            user_id: session.user.id,
            is_anonymous: anonymous,
            status: 'approved',
            likes: 0,
            views: 0
        };
        
        const { data, error: insertError } = await window.supabase
            .from('forum_posts')
            .insert([newPost])
            .select();
        
        if (insertError) throw insertError;
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('newPostModal'));
        modal.hide();
        
        // Clear form
        document.getElementById('post-title').value = '';
        document.getElementById('post-category').value = '';
        document.getElementById('post-content').value = '';
        document.getElementById('post-anonymous').checked = false;
        
        // Reload forum data
        await loadForumData();
        updateForumStats();
        
        showNotification('Post created successfully!', 'success');
        
    } catch (error) {
        console.error('Error creating post:', error);
        showNotification('Error creating post: ' + error.message, 'error');
    }
};

// View post detail
window.viewPost = async function(postId) {
    try {
        const post = forumData.posts.find(p => p.id === postId);
        if (!post) {
            showNotification('Post not found', 'error');
            return;
        }
        
        forumData.currentPost = post;
        
        // Update modal title
        document.getElementById('post-detail-title').textContent = post.title;
        
        // Load post content
        const user = post.user_profiles;
        const displayName = user?.is_anonymous ? 'Anonymous User' : (user?.display_name || 'Unknown User');
        const userAvatar = user?.is_anonymous ? '/assets/img/logo.png' : (auth.currentUser?.user_metadata?.avatar_url || '/assets/img/logo.png');
        
        document.getElementById('post-detail-content').innerHTML = `
            <div class="post-header mb-3">
                <div class="d-flex align-items-center">
                    <img src="${userAvatar}" alt="${displayName}" class="user-avatar me-3">
                    <div>
                        <h6 class="mb-0">${displayName}</h6>
                        <small class="text-muted">${formatTimeAgo(post.created_at)}</small>
                    </div>
                </div>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
            </div>
        `;
        
        // Load comments
        await loadComments(postId);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('postDetailModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error viewing post:', error);
        showNotification('Error loading post: ' + error.message, 'error');
    }
};

// Load comments for a post
async function loadComments(postId) {
    const container = document.getElementById('comments-container');
    if (!container) return;
    
    try {
        const postComments = forumData.comments.filter(c => c.post_id === postId);
        
        if (postComments.length === 0) {
            container.innerHTML = '<p class="text-muted">No comments yet. Be the first to comment!</p>';
            return;
        }
        
        const html = postComments.map(comment => {
            const user = comment.user_profiles;
            const displayName = user?.is_anonymous ? 'Anonymous User' : (user?.display_name || 'Unknown User');
            const userAvatar = user?.is_anonymous ? '/assets/img/logo.png' : (auth.currentUser?.user_metadata?.avatar_url || '/assets/img/logo.png');
            
            return `
                <div class="comment">
                    <div class="d-flex">
                        <img src="${userAvatar}" alt="${displayName}" class="user-avatar me-2" style="width: 30px; height: 30px;">
                        <div class="flex-grow-1">
                            <div class="d-flex justify-content-between align-items-start">
                                <h6 class="mb-1">${displayName}</h6>
                                <small class="text-muted">${formatTimeAgo(comment.created_at)}</small>
                        </div>
                            <p class="mb-0">${comment.content}</p>
                </div>
            </div>
        </div>
    `;
        }).join('');
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading comments:', error);
        container.innerHTML = '<p class="text-muted">Error loading comments.</p>';
    }
}

// Submit comment
window.submitComment = async function() {
    if (!auth.userProfile) {
        showNotification('Please log in to comment', 'warning');
        return;
    }
    
    if (!forumData.currentPost) {
        showNotification('No post selected', 'error');
        return;
    }
    
    const content = document.getElementById('comment-content').value.trim();
    const anonymous = document.getElementById('comment-anonymous').checked;
    
    if (!content) {
        showNotification('Please enter a comment', 'warning');
        return;
    }
    
    try {
        const newComment = {
            post_id: forumData.currentPost.id,
            content: content,
            user_id: auth.currentUser.id,
            is_anonymous: anonymous,
            status: 'approved'
        };
        
        const { data, error: insertError } = await window.supabase
            .from('forum_comments')
            .insert([newComment])
            .select();
        
        if (insertError) throw insertError;
        
        // Clear form
        document.getElementById('comment-content').value = '';
        document.getElementById('comment-anonymous').checked = false;
        
        // Reload comments
        await loadComments(forumData.currentPost.id);
        
        // Update forum data
        await loadForumData();
        updateForumStats();
        
        showNotification('Comment added successfully!', 'success');
        
    } catch (error) {
        console.error('Error adding comment:', error);
        showNotification('Error adding comment: ' + error.message, 'error');
    }
};

// Like post
window.likePost = async function(postId) {
    if (!auth.userProfile) {
        showNotification('Please log in to like posts', 'warning');
        return;
    }
    
    try {
        const post = forumData.posts.find(p => p.id === postId);
        if (!post) return;
        
        // Toggle like status (in a real app, you'd have a separate likes table)
        const newLikes = (post.likes || 0) + 1;
        
        const { error } = await window.supabase
            .from('forum_posts')
            .update({ likes: newLikes })
            .eq('id', postId);
        
        if (error) throw error;
        
        // Update UI
        const likeButton = document.querySelector(`[data-post-id="${postId}"] .btn-interaction`);
        if (likeButton) {
            const icon = likeButton.querySelector('i');
            const count = likeButton.querySelector('span');
            icon.className = 'bi bi-heart-fill text-danger';
            count.textContent = newLikes;
        }
        
        // Update forum data
        await loadForumData();
        
    } catch (error) {
        console.error('Error liking post:', error);
        showNotification('Error liking post: ' + error.message, 'error');
    }
};

// Share post
window.sharePost = function(postId) {
    const post = forumData.posts.find(p => p.id === postId);
    if (!post) return;
    
    const url = `${window.location.origin}/community-forum.html#post-${postId}`;
    const text = `Check out this post: ${post.title}`;
    
    if (navigator.share) {
        navigator.share({
            title: post.title,
            text: text,
            url: url
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Link copied to clipboard!', 'success');
        });
    }
};

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

function getCategoryDisplayName(category) {
    const categories = {
        'general': 'General Discussion',
        'support': 'Support & Encouragement',
        'resources': 'Resources & Tips',
        'milestones': 'Milestones & Celebrations',
        'challenges': 'Challenges & Struggles'
    };
    return categories[category] || category;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

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
        if (!window.supabase.auth) {
            console.log('❌ Supabase auth not available');
            return false;
        }
        console.log('✅ Supabase auth available');
        
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

// Export functions for global access
window.communityForum = {
    showNewPostModal,
    submitNewPost,
    viewPost,
    submitComment,
    likePost,
    sharePost,
    testAuthStatus,
    forceAuthUIUpdate,
    testSupabaseClient
}; 