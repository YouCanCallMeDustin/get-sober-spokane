// Enhanced Community Forum with Supabase Integration
// src/js/community-forum-enhanced.js

class CommunityForum {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.forumData = {
            posts: [],
            comments: [],
            users: [],
            usersById: {},
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
        this.currentPage = 1;
        this.postsPerPage = 10;
        this.isLoading = false;
    }

    // Initialize the forum
    async initialize() {
        try {
            await this.initializeSupabase();
            await this.loadForumData();
            this.setupEventListeners();
            this.updateForumStats();
            this.loadFeaturedStories();
            this.loadPosts();
        } catch (error) {
            console.error('Forum initialization error:', error);
            this.showNotification('Error loading forum: ' + error.message, 'error');
        }
    }

    // Initialize Supabase connection
    async initializeSupabase() {
        try {
            const supabaseUrl = window.APP_CONFIG?.SUPABASE_URL || '';
            const supabaseKey = window.APP_CONFIG?.SUPABASE_ANON_KEY || '';
            
            if (!supabaseUrl || !supabaseKey) {
                throw new Error('Supabase credentials not found');
            }
            
            this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
            console.log('Supabase client initialized for forum');
            
            // Check authentication state
            const { data: { session } } = await this.supabase.auth.getSession();
            if (session) {
                this.currentUser = session.user;
                console.log('User authenticated:', this.currentUser.email);
            }
            
            // Listen for auth changes
            this.supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN' && session) {
                    this.currentUser = session.user;
                    this.enableAuthenticatedFeatures();
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    this.disableAuthenticatedFeatures();
                }
            });
            
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            throw error;
        }
    }

    // Load forum data from Supabase
    async loadForumData() {
        try {
            // Load posts (no joins; we'll enrich from profiles map)
            const { data: posts, error: postsError } = await this.supabase
                .from('forum_posts')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);
            
            if (postsError) throw postsError;
            this.forumData.posts = posts || [];
            
            // Load comments
            const { data: comments, error: commentsError } = await this.supabase
                .from('forum_comments')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(200);
            
            if (commentsError) throw commentsError;
            this.forumData.comments = comments || [];
            
            // Load user profiles from our forum_user_profiles table
            const { data: users, error: usersError } = await this.supabase
                .from('forum_user_profiles')
                .select('user_id, display_name, avatar_url, sobriety_date')
                .limit(1000);
            
            if (usersError) throw usersError;
            this.forumData.users = users || [];
            this.forumData.usersById = {};
            (users || []).forEach(u => { this.forumData.usersById[u.user_id] = u; });
            
            console.log('Forum data loaded:', {
                posts: this.forumData.posts.length,
                comments: this.forumData.comments.length,
                users: this.forumData.users.length
            });
            
        } catch (error) {
            console.error('Failed to load forum data:', error);
            // Fallback to sample data if Supabase fails
            this.createSampleData();
        }
    }

    // Create sample data for demonstration
    createSampleData() {
        const samplePosts = [
            {
                id: '1',
                title: 'Welcome to the Recovery Community',
                content: 'Hello everyone! I\'m new here and looking forward to connecting with others on their recovery journey. This community has already been so helpful.',
                category: 'General Discussion',
                tags: ['welcome', 'new', 'community'],
                user_id: 'sample-user-1',
                is_anonymous: false,
                upvotes: 5,
                downvotes: 0,
                created_at: new Date(Date.now() - 86400000).toISOString(),
                updated_at: new Date(Date.now() - 86400000).toISOString(),
                profiles: {
                    display_name: 'New Member',
                    avatar_url: null,
                    sobriety_date: null
                }
            },
            {
                id: '2',
                title: 'Tips for Staying Sober During Holidays',
                content: 'The holiday season can be challenging for those in recovery. Here are some strategies that have helped me: 1) Plan ahead, 2) Have sober activities ready, 3) Stay connected with support network.',
                category: 'Recovery Support',
                tags: ['holidays', 'tips', 'sobriety'],
                user_id: 'sample-user-2',
                is_anonymous: false,
                upvotes: 12,
                downvotes: 1,
                created_at: new Date(Date.now() - 172800000).toISOString(),
                updated_at: new Date(Date.now() - 172800000).toISOString(),
                profiles: {
                    display_name: 'Recovery Warrior',
                    avatar_url: null,
                    sobriety_date: '2024-01-15'
                }
            }
        ];
        
        this.forumData.posts = samplePosts;
    }

    // Setup event listeners
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('forum-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchPosts(e.target.value));
        }
        
        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => this.filterPostsByCategory(e.target.value));
        }
        
        // Sort options
        const sortSelect = document.getElementById('sort-posts');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => this.sortPosts(e.target.value));
        }
        
        // New post form
        const newPostForm = document.getElementById('newPostForm');
        if (newPostForm) {
            newPostForm.addEventListener('submit', (e) => this.handleNewPost(e));
        }
        
        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMorePosts());
        }
    }

    // Load posts with pagination
    async loadPosts() {
        try {
            this.isLoading = true;
            const container = document.getElementById('posts-container');
            if (!container) return;
            
            if (this.forumData.posts.length === 0) {
                container.innerHTML = this.createEmptyPostsHTML();
                return;
            }
            
            const startIndex = (this.currentPage - 1) * this.postsPerPage;
            const endIndex = startIndex + this.postsPerPage;
            const postsToShow = this.forumData.posts.slice(startIndex, endIndex);
            
            const postsHTML = postsToShow.map(post => this.createPostHTML(post)).join('');
            container.innerHTML = postsHTML;
            
            // Show/hide load more button
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn) {
                loadMoreBtn.style.display = endIndex < this.forumData.posts.length ? 'inline-block' : 'none';
            }
            
        } catch (error) {
            console.error('Failed to load posts:', error);
            this.showNotification('Failed to load posts', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    // Create post HTML
    createPostHTML(post) {
        const timeAgo = this.formatTimeAgo(post.created_at);
        const tagsHTML = (post.tags || []).map(tag => 
            `<span class="badge bg-light text-dark me-1">${tag}</span>`
        ).join('');
        
        const profile = this.forumData.usersById[post.user_id];
        const userName = post.is_anonymous ? 'Anonymous User' : 
            (profile?.display_name || 'Unknown User');
        
        const sobrietyInfo = profile?.sobriety_date ? 
            `<small class="text-muted d-block">
                <i class="bi bi-calendar-event me-1"></i>
                ${this.calculateSobrietyDays(profile.sobriety_date)} days sober
            </small>` : '';
        
        return `
            <div class="card mb-3 post-card" data-post-id="${post.id}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div class="flex-grow-1">
                            <h5 class="card-title mb-1">
                                <a href="#" onclick="forum.viewPost('${post.id}')" class="text-decoration-none">${post.title}</a>
                            </h5>
                            <div class="text-muted small">
                                <i class="bi bi-person me-1"></i>${userName}
                                <i class="bi bi-clock me-2 ms-2"></i>${timeAgo}
                                <i class="bi bi-tag me-2 ms-2"></i>${post.category}
                            </div>
                            ${sobrietyInfo}
                        </div>
                        <div class="dropdown">
                            <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                <i class="bi.bi-three-dots"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" onclick="forum.reportPost('${post.id}')">
                                    <i class="bi bi-flag"></i> Report
                                </a></li>
                                ${this.currentUser && this.currentUser.id === post.user_id ? `
                                    <li><a class="dropdown-item" href="#" onclick="forum.editPost('${post.id}')">
                                        <i class="bi bi-pencil"></i> Edit
                                    </a></li>
                                    <li><a class="dropdown-item text-danger" href="#" onclick="forum.deletePost('${post.id}')">
                                        <i class="bi bi-trash"></i> Delete
                                    </a></li>
                                ` : ''}
                            </ul>
                        </div>
                    </div>
                    
                    <p class="card-text">${this.truncateText(post.content, 200)}</p>
                    
                    <div class="mb-2">
                        ${tagsHTML}
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="btn-group btn-group-sm" role="group">
                            <button class="btn btn-outline-primary" onclick="forum.upvotePost('${post.id}')">
                                <i class="bi bi-arrow-up"></i> ${post.upvotes || 0}
                            </button>
                            <button class="btn btn-outline-secondary" onclick="forum.downvotePost('${post.id}')">
                                <i class="bi bi-arrow-down"></i> ${post.downvotes || 0}
                            </button>
                            <button class="btn btn-outline-info" onclick="forum.viewPost('${post.id}')">
                                <i class="bi bi-chat"></i> ${post.comments?.length || 0} Comments
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Create empty posts HTML
    createEmptyPostsHTML() {
        return `
            <div class="text-center py-5">
                <i class="bi bi-chat-dots fs-1 text-muted"></i>
                <h4 class="mt-3">No posts yet</h4>
                <p class="text-muted">Be the first to start a conversation!</p>
                ${this.currentUser ? `
                    <button class="btn btn-primary" onclick="forum.showNewPostModal()">
                        <i class="bi bi-plus-circle me-2"></i>Create First Post
                    </button>
                ` : `
                    <a href="/get-sober-spokane/auth/login.html" class="btn btn-primary">
                        <i class="bi bi-box-arrow-in-right me-2"></i>Sign In to Post
                    </a>
                `}
            </div>
        `;
    }

    // Handle new post submission
    async handleNewPost(e) {
        e.preventDefault();
        
        if (!this.currentUser) {
            this.showNotification('Please sign in to create posts', 'warning');
            return;
        }
        
        const formData = new FormData(e.target);
        const postData = {
            title: formData.get('post-title') || document.getElementById('post-title').value,
            category: formData.get('post-category') || document.getElementById('post-category').value,
            content: formData.get('post-content') || document.getElementById('post-content').value,
            tags: (formData.get('post-tags') || document.getElementById('post-tags').value)
                .split(',').map(tag => tag.trim()).filter(tag => tag),
            is_anonymous: document.getElementById('post-anonymous').checked,
            is_featured: document.getElementById('post-featured').checked
        };
        
        if (!postData.title || !postData.category || !postData.content) {
            this.showNotification('Please fill in all required fields', 'warning');
            return;
        }
        
        if (postData.content.length < 50) {
            this.showNotification('Post content must be at least 50 characters', 'warning');
            return;
        }
        
        try {
            const newPost = {
                title: postData.title,
                content: postData.content,
                category: postData.category,
                tags: postData.tags,
                user_id: this.currentUser.id,
                is_anonymous: postData.is_anonymous,
                is_featured: postData.is_featured,
                upvotes: 0,
                downvotes: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // Save to Supabase
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('forum_posts')
                    .insert([newPost])
                    .select()
                    .single();
                
                if (error) throw error;
                newPost.id = data.id;
            }
            
            // Add to local data
            this.forumData.posts.unshift(newPost);
            
            // Reload posts
            this.loadPosts();
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('newPostModal'));
            if (modal) modal.hide();
            
            // Clear form
            e.target.reset();
            
            this.showNotification('Post created successfully!', 'success');
            this.updateForumStats();
            
        } catch (error) {
            console.error('Failed to create post:', error);
            this.showNotification('Failed to create post: ' + error.message, 'error');
        }
    }

    // View post details
    async viewPost(postId) {
        try {
            const post = this.forumData.posts.find(p => p.id === postId);
            if (!post) return;
            
            // Load comments for this post
            const comments = await this.loadPostComments(postId);
            
            // Show post detail modal
            this.showPostDetailModal(post, comments);
            
        } catch (error) {
            console.error('Failed to view post:', error);
            this.showNotification('Failed to load post details', 'error');
        }
    }

    // Load post comments
    async loadPostComments(postId) {
        try {
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('forum_comments')
                    .select(`
                        *,
                        profiles:user_id(display_name, avatar_url)
                    `)
                    .eq('post_id', postId)
                    .order('created_at', { ascending: true });
                
                if (error) throw error;
                return data || [];
            }
            
            // Fallback to local data
            return this.forumData.comments.filter(c => c.post_id === postId);
            
        } catch (error) {
            console.error('Failed to load comments:', error);
            return [];
        }
    }

    // Show post detail modal
    showPostDetailModal(post, comments) {
        const modal = document.getElementById('postDetailModal');
        const title = document.getElementById('postDetailTitle');
        const content = document.getElementById('postDetailContent');
        
        if (!modal || !title || !content) return;
        
        title.textContent = post.title;
        
        const profile = this.forumData.usersById[post.user_id];
        const userName = post.is_anonymous ? 'Anonymous User' : 
            (profile?.display_name || 'Unknown User');
        
        content.innerHTML = `
            <div class="post-detail mb-4">
                <div class="post-meta mb-3">
                    <small class="text-muted">
                        <i class="bi bi-person me-1"></i>${userName}
                        <i class="bi bi-clock me-2 ms-2"></i>${this.formatTimeAgo(post.created_at)}
                        <i class="bi bi-tag me-2 ms-2"></i>${post.category}
                    </small>
                </div>
                
                <div class="post-content mb-4">
                    ${post.content.replace(/\n/g, '<br>')}
                </div>
                
                <div class="post-tags mb-3">
                    ${(post.tags || []).map(tag => 
                        `<span class="badge bg-light text-dark me-1">${tag}</span>`
                    ).join('')}
                </div>
                
                <div class="post-actions">
                    <button class="btn btn-outline-primary btn-sm me-2" onclick="forum.upvotePost('${post.id}')">
                        <i class="bi bi-arrow-up"></i> ${post.upvotes || 0}
                    </button>
                    <button class="btn btn-outline-secondary btn-sm me-2" onclick="forum.downvotePost('${post.id}')">
                        <i class="bi bi-arrow-down"></i> ${post.downvotes || 0}
                    </button>
                </div>
            </div>
            
            <div class="comments-section">
                <h5>Comments (${comments.length})</h5>
                ${this.createCommentsHTML(comments)}
                
                ${this.currentUser ? `
                    <div class="add-comment mt-3">
                        <form id="addCommentForm">
                            <div class="mb-3">
                                <textarea class="form-control" id="commentContent" rows="3" 
                                    placeholder="Add a comment..."></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary btn-sm">Add Comment</button>
                        </form>
                    </div>
                ` : `
                    <div class="text-center mt-3">
                        <a href="/get-sober-spokane/auth/login.html" class="btn btn-outline-primary">
                            Sign in to comment
                        </a>
                    </div>
                `}
            </div>
        `;
        
        // Setup comment form
        const commentForm = document.getElementById('addCommentForm');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => this.handleNewComment(e, post.id));
        }
        
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    }

    // Create comments HTML
    createCommentsHTML(comments) {
        if (comments.length === 0) {
            return '<p class="text-muted">No comments yet. Be the first to comment!</p>';
        }
        
        return comments.map(comment => {
            const profile = this.forumData.usersById[comment.user_id];
            const userName = profile?.display_name || 'Unknown User';
            const timeAgo = this.formatTimeAgo(comment.created_at);
            
            return `
                <div class="comment-item border-start border-2 ps-3 mb-3">
                    <div class="comment-meta mb-1">
                        <strong>${userName}</strong>
                        <small class="text-muted ms-2">${timeAgo}</small>
                    </div>
                    <div class="comment-content">
                        ${comment.content.replace(/\n/g, '<br>')}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Handle new comment
    async handleNewComment(e, postId) {
        e.preventDefault();
        
        const content = document.getElementById('commentContent').value.trim();
        if (!content) {
            this.showNotification('Please enter a comment', 'warning');
            return;
        }
        
        try {
            const newComment = {
                post_id: postId,
                user_id: this.currentUser.id,
                content: content,
                created_at: new Date().toISOString()
            };
            
            // Save to Supabase
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('forum_comments')
                    .insert([newComment])
                    .select()
                    .single();
                
                if (error) throw error;
                newComment.id = data.id;
            }
            
            // Add to local data
            this.forumData.comments.push(newComment);
            
            // Reload post details
            this.viewPost(postId);
            
            // Clear form
            e.target.reset();
            
            this.showNotification('Comment added successfully!', 'success');
            this.updateForumStats();
            
        } catch (error) {
            console.error('Failed to add comment:', error);
            this.showNotification('Failed to add comment: ' + error.message, 'error');
        }
    }

    // Search posts
    searchPosts(query) {
        if (!query.trim()) {
            this.loadPosts();
            return;
        }
        
        const filteredPosts = this.forumData.posts.filter(post => 
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.content.toLowerCase().includes(query.toLowerCase()) ||
            (post.tags || []).some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
        
        this.displayFilteredPosts(filteredPosts);
    }

    // Filter posts by category
    filterPostsByCategory(category) {
        if (!category) {
            this.loadPosts();
            return;
        }
        
        const filteredPosts = this.forumData.posts.filter(post => post.category === category);
        this.displayFilteredPosts(filteredPosts);
    }

    // Sort posts
    sortPosts(sortBy) {
        let sortedPosts = [...this.forumData.posts];
        
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
                sortedPosts.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
                break;
            default:
                sortedPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        
        this.displayFilteredPosts(sortedPosts);
    }

    // Display filtered posts
    displayFilteredPosts(posts) {
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
        
        const postsHTML = posts.map(post => this.createPostHTML(post)).join('');
        container.innerHTML = postsHTML;
    }

    // Load more posts
    loadMorePosts() {
        if (this.isLoading) return;
        
        this.currentPage++;
        this.loadPosts();
    }

    // Update forum statistics
    updateForumStats() {
        const totalPosts = document.getElementById('totalPosts');
        const totalUsers = document.getElementById('totalUsers');
        const totalComments = document.getElementById('totalComments');
        const successStories = document.getElementById('successStories');
        
        if (totalPosts) totalPosts.textContent = this.forumData.posts.length;
        if (totalUsers) totalUsers.textContent = this.forumData.users.length;
        if (totalComments) totalComments.textContent = this.forumData.comments.length;
        if (successStories) {
            const featuredPosts = this.forumData.posts.filter(p => p.is_featured);
            successStories.textContent = featuredPosts.length;
        }
    }

    // Load featured success stories
    async loadFeaturedStories() {
        try {
            const featuredPosts = this.forumData.posts.filter(p => p.is_featured);
            const container = document.getElementById('featuredStories');
            
            if (!container) return;
            
            if (featuredPosts.length === 0) {
                container.innerHTML = `
                    <div class="col-12">
                        <div class="text-center py-4">
                            <i class="bi bi-star fs-1 text-muted"></i>
                            <h5 class="mt-3">No featured stories yet</h5>
                            <p class="text-muted">Share your success story to be featured here!</p>
                        </div>
                    </div>
                `;
                return;
            }
            
            const storiesHTML = featuredPosts.slice(0, 3).map(story => `
                <div class="col-md-4 mb-3">
                    <div class="card h-100 featured-story-card">
                        <div class="card-body">
                            <h6 class="card-title">${story.title}</h6>
                            <p class="card-text">${this.truncateText(story.content, 100)}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">
                                    <i class="bi bi-person me-1"></i>
                                    ${story.is_anonymous ? 'Anonymous' : (story.profiles?.display_name || 'Unknown')}
                                </small>
                                <button class="btn btn-sm btn-outline-primary" onclick="forum.viewPost('${story.id}')">
                                    Read More
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
            
            container.innerHTML = storiesHTML;
            
        } catch (error) {
            console.error('Failed to load featured stories:', error);
        }
    }

    // Utility functions
    formatTimeAgo(dateString) {
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

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    calculateSobrietyDays(sobrietyDate) {
        if (!sobrietyDate) return 0;
        
        const startDate = new Date(sobrietyDate);
        const today = new Date();
        const timeDiff = today.getTime() - startDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        return Math.max(0, daysDiff);
    }

    // Show notification
    showNotification(message, type = 'info') {
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

    // Enable authenticated features
    enableAuthenticatedFeatures() {
        const newPostBtn = document.getElementById('newPostBtn');
        if (newPostBtn) {
            newPostBtn.disabled = false;
            newPostBtn.title = '';
        }
    }

    // Disable authenticated features
    disableAuthenticatedFeatures() {
        const newPostBtn = document.getElementById('newPostBtn');
        if (newPostBtn) {
            newPostBtn.disabled = true;
            newPostBtn.title = 'Please sign in to create posts';
        }
    }

    // Update post votes
    async updatePostVotes(postId, upvotes, downvotes) {
        try {
            if (this.supabase) {
                await this.supabase
                    .from('forum_posts')
                    .update({ upvotes, downvotes })
                    .eq('id', postId);
            }
        } catch (error) {
            console.error('Failed to update post votes:', error);
        }
    }

    // Vote handling using forum_post_votes (one vote per user per post)
    async castVote(postId, value) {
        if (!this.currentUser) {
            this.showNotification('Please sign in to vote', 'warning');
            return;
        }
        try {
            // Check existing vote
            const { data: existing, error: fetchErr } = await this.supabase
                .from('forum_post_votes')
                .select('*')
                .eq('post_id', postId)
                .eq('user_id', this.currentUser.id)
                .maybeSingle();
            if (fetchErr && fetchErr.code !== 'PGRST116') throw fetchErr;

            if (!existing) {
                // Insert new vote
                const { error: insertErr } = await this.supabase
                    .from('forum_post_votes')
                    .insert({ post_id: postId, user_id: this.currentUser.id, vote: value });
                if (insertErr) throw insertErr;
            } else if (existing.vote === value) {
                // Same vote -> remove (toggle off)
                const { error: delErr } = await this.supabase
                    .from('forum_post_votes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', this.currentUser.id);
                if (delErr) throw delErr;
            } else {
                // Switch vote
                const { error: updErr } = await this.supabase
                    .from('forum_post_votes')
                    .update({ vote: value })
                    .eq('post_id', postId)
                    .eq('user_id', this.currentUser.id);
                if (updErr) throw updErr;
            }

            // Recompute totals for this post from votes view
            const { data: totals, error: totalsErr } = await this.supabase
                .from('forum_post_vote_totals')
                .select('upvotes, downvotes')
                .eq('post_id', postId)
                .maybeSingle();
            if (totalsErr && totalsErr.code !== 'PGRST116') throw totalsErr;

            // Update local and backend counts for convenience
            const post = this.forumData.posts.find(p => p.id === postId);
            if (post) {
                post.upvotes = totals?.upvotes || 0;
                post.downvotes = totals?.downvotes || 0;
                await this.updatePostVotes(postId, post.upvotes, post.downvotes);
            }
            this.loadPosts();
        } catch (error) {
            console.error('Failed to vote:', error);
            this.showNotification('Failed to record vote: ' + (error?.message || 'Unknown error'), 'error');
        }
    }

    upvotePost(postId) {
        this.castVote(postId, 1);
    }

    downvotePost(postId) {
        this.castVote(postId, -1);
    }

    reportPost(postId) {
        this.showNotification('Thank you for reporting. Our moderators will review this post.', 'info');
    }

    editPost(postId) {
        // Implement edit functionality
        this.showNotification('Edit functionality coming soon!', 'info');
    }

    async deletePost(postId) {
        if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return;
        }
        
        try {
            if (this.supabase) {
                await this.supabase
                    .from('forum_posts')
                    .delete()
                    .eq('id', postId);
            }
            
            const index = this.forumData.posts.findIndex(p => p.id === postId);
            if (index !== -1) {
                this.forumData.posts.splice(index, 1);
                this.loadPosts();
                this.updateForumStats();
                this.showNotification('Post deleted successfully!', 'success');
            }
        } catch (error) {
            console.error('Failed to delete post:', error);
            this.showNotification('Failed to delete post', 'error');
        }
    }

    showNewPostModal() {
        const modal = new bootstrap.Modal(document.getElementById('newPostModal'));
        modal.show();
    }
}

// Initialize forum when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create global forum instance
    window.forum = new CommunityForum();
    
    // Initialize forum
    window.forum.initialize();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CommunityForum;
}
