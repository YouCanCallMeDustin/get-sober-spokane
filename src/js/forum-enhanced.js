// Enhanced Community Forum with Advanced Features
// src/js/forum-enhanced.js
// Builds on top of existing community-forum-enhanced.js

class EnhancedCommunityForum extends CommunityForum {
    constructor() {
        super();
        this.enhancedFeatures = {
            threading: true,
            mentions: true,
            bookmarks: true,
            notifications: true,
            advancedSearch: true,
            userFollowing: true,
            richTextEditor: true,
            moderationTools: true
        };
        this.notificationSettings = {
            email: true,
            push: true,
            mentions: true,
            replies: true,
            votes: false
        };
        this.followingUsers = new Set();
        this.bookmarkedPosts = new Set();
        this.mentions = [];
        this.notifications = [];
    }

    // Override initialize to add enhanced features
    async initialize() {
        await super.initialize();
        await this.initializeEnhancedFeatures();
    }

    // Initialize enhanced features
    async initializeEnhancedFeatures() {
        try {
            if (this.currentUser) {
                await this.loadUserPreferences();
                await this.loadFollowingUsers();
                await this.loadBookmarkedPosts();
                await this.loadNotifications();
                await this.loadMentions();
            }
            this.setupEnhancedEventListeners();
            this.initializeRichTextEditor();
            this.setupRealTimeUpdates();
        } catch (error) {
            console.error('Failed to initialize enhanced features:', error);
        }
    }

    // Load user preferences and settings
    async loadUserPreferences() {
        try {
            const { data, error } = await this.supabase
                .from('profiles_consolidated')
                .select('notification_settings, privacy_settings')
                .eq('user_id', this.currentUser.id)
                .single();

            if (data && !error) {
                this.notificationSettings = { ...this.notificationSettings, ...data.notification_settings };
            }
        } catch (error) {
            console.error('Failed to load user preferences:', error);
        }
    }

    // Load users that current user is following
    async loadFollowingUsers() {
        try {
            const { data, error } = await this.supabase
                .from('forum_user_follows')
                .select('following_user_id')
                .eq('follower_user_id', this.currentUser.id);

            if (data && !error) {
                this.followingUsers = new Set(data.map(f => f.following_user_id));
            }
        } catch (error) {
            console.error('Failed to load following users:', error);
        }
    }

    // Load bookmarked posts
    async loadBookmarkedPosts() {
        try {
            const { data, error } = await this.supabase
                .from('forum_bookmarks')
                .select('post_id')
                .eq('user_id', this.currentUser.id);

            if (data && !error) {
                this.bookmarkedPosts = new Set(data.map(b => b.post_id));
            }
        } catch (error) {
            console.error('Failed to load bookmarked posts:', error);
        }
    }

    // Load notifications
    async loadNotifications() {
        try {
            const { data, error } = await this.supabase
                .from('user_notifications')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (data && !error) {
                this.notifications = data;
                this.updateNotificationBadge();
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    }

    // Load mentions
    async loadMentions() {
        try {
            const { data, error } = await this.supabase
                .from('forum_mentions')
                .select('*')
                .eq('mentioned_user_id', this.currentUser.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (data && !error) {
                this.mentions = data;
            }
        } catch (error) {
            console.error('Failed to load mentions:', error);
        }
    }

    // Setup enhanced event listeners
    setupEnhancedEventListeners() {
        super.setupEventListeners();
        
        // Enhanced search with filters
        const searchInput = document.getElementById('forum-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.enhancedSearch(e.target.value));
        }

        // Bookmark functionality
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="bookmark"]')) {
                e.preventDefault();
                this.toggleBookmark(e.target.dataset.postId);
            }
        });

        // Follow/Unfollow functionality
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="follow"]')) {
                e.preventDefault();
                this.toggleFollow(e.target.dataset.userId);
            }
        });

        // Notification settings
        document.addEventListener('change', (e) => {
            if (e.target.matches('[data-setting="notification"]')) {
                this.updateNotificationSetting(e.target.name, e.target.checked);
            }
        });
    }

    // Enhanced search with filters and tags
    async enhancedSearch(query) {
        if (!query.trim()) {
            this.loadPosts();
            return;
        }

        try {
            // Search posts with full-text search
            const { data: posts, error } = await this.supabase
                .from('forum_posts')
                .select(`
                    *,
                    forum_user_profiles!inner(display_name, avatar_url, reputation)
                `)
                .textSearch('title,content', query)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            // Also search by tags
            const { data: tagPosts, error: tagError } = await this.supabase
                .from('forum_post_tags_enhanced')
                .select(`
                    post_id,
                    forum_posts!inner(*, forum_user_profiles!inner(display_name, avatar_url, reputation))
                `)
                .ilike('tag_id', `%${query}%`);

            if (!tagError && tagPosts) {
                const tagPostIds = tagPosts.map(tp => tp.post_id);
                const additionalPosts = await this.supabase
                    .from('forum_posts')
                    .select(`
                        *,
                        forum_user_profiles!inner(display_name, avatar_url, reputation)
                    `)
                    .in('id', tagPostIds)
                    .order('created_at', { ascending: false });

                if (additionalPosts.data) {
                    posts.push(...additionalPosts.data);
                }
            }

            // Remove duplicates
            const uniquePosts = posts.filter((post, index, self) => 
                index === self.findIndex(p => p.id === post.id)
            );

            this.displayFilteredPosts(uniquePosts);
        } catch (error) {
            console.error('Enhanced search failed:', error);
            // Fallback to basic search
            super.searchPosts(query);
        }
    }

    // Create enhanced post HTML with new features
    createPostHTML(post) {
        const baseHTML = super.createPostHTML(post);
        
        // Add enhanced features to the base HTML
        const enhancedHTML = baseHTML.replace(
            /<div class="d-flex justify-content-between align-items-center">/,
            `
            <div class="d-flex justify-content-between align-items-center">
                <div class="enhanced-post-actions">
                    ${this.createBookmarkButton(post.id)}
                    ${this.createFollowButton(post.user_id)}
                    ${this.createShareButton(post.id)}
                </div>
            </div>
            <div class="d-flex justify-content-between align-items-center">
        `);

        return enhancedHTML;
    }

    // Create bookmark button
    createBookmarkButton(postId) {
        const isBookmarked = this.bookmarkedPosts.has(postId);
        return `
            <button class="btn btn-sm btn-outline-secondary" 
                    data-action="bookmark" 
                    data-post-id="${postId}"
                    title="${isBookmarked ? 'Remove bookmark' : 'Bookmark post'}">
                <i class="bi bi-${isBookmarked ? 'bookmark-fill' : 'bookmark'}"></i>
            </button>
        `;
    }

    // Create follow button
    createFollowButton(userId) {
        if (!this.currentUser || this.currentUser.id === userId) return '';
        
        const isFollowing = this.followingUsers.has(userId);
        return `
            <button class="btn btn-sm btn-outline-primary" 
                    data-action="follow" 
                    data-user-id="${userId}"
                    title="${isFollowing ? 'Unfollow user' : 'Follow user'}">
                <i class="bi bi-${isFollowing ? 'person-check-fill' : 'person-plus'}"></i>
                ${isFollowing ? 'Following' : 'Follow'}
            </button>
        `;
    }

    // Create share button
    createShareButton(postId) {
        return `
            <button class="btn btn-sm btn-outline-info" 
                    onclick="forum.sharePost('${postId}')"
                    title="Share post">
                <i class="bi bi-share"></i>
            </button>
        `;
    }

    // Toggle bookmark
    async toggleBookmark(postId) {
        if (!this.currentUser) {
            this.showNotification('Please sign in to bookmark posts', 'warning');
            return;
        }

        try {
            const isBookmarked = this.bookmarkedPosts.has(postId);
            
            if (isBookmarked) {
                // Remove bookmark
                const { error } = await this.supabase
                    .from('forum_bookmarks')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', this.currentUser.id);
                
                if (error) throw error;
                this.bookmarkedPosts.delete(postId);
                this.showNotification('Post removed from bookmarks', 'info');
            } else {
                // Add bookmark
                const { error } = await this.supabase
                    .from('forum_bookmarks')
                    .insert({
                        post_id: postId,
                        user_id: this.currentUser.id
                    });
                
                if (error) throw error;
                this.bookmarkedPosts.add(postId);
                this.showNotification('Post bookmarked', 'success');
            }
            
            // Update UI
            this.loadPosts();
        } catch (error) {
            console.error('Failed to toggle bookmark:', error);
            this.showNotification('Failed to update bookmark', 'error');
        }
    }

    // Toggle follow
    async toggleFollow(userId) {
        if (!this.currentUser) {
            this.showNotification('Please sign in to follow users', 'warning');
            return;
        }

        try {
            const isFollowing = this.followingUsers.has(userId);
            
            if (isFollowing) {
                // Unfollow
                const { error } = await this.supabase
                    .from('forum_user_follows')
                    .delete()
                    .eq('follower_user_id', this.currentUser.id)
                    .eq('following_user_id', userId);
                
                if (error) throw error;
                this.followingUsers.delete(userId);
                this.showNotification('Unfollowed user', 'info');
            } else {
                // Follow
                const { error } = await this.supabase
                    .from('forum_user_follows')
                    .insert({
                        follower_user_id: this.currentUser.id,
                        following_user_id: userId
                    });
                
                if (error) throw error;
                this.followingUsers.add(userId);
                this.showNotification('Following user', 'success');
            }
            
            // Update UI
            this.loadPosts();
        } catch (error) {
            console.error('Failed to toggle follow:', error);
            this.showNotification('Failed to update follow status', 'error');
        }
    }

    // Share post
    async sharePost(postId) {
        const post = this.forumData.posts.find(p => p.id === postId);
        if (!post) return;

        const shareData = {
            title: post.title,
            text: post.content.substring(0, 200) + '...',
            url: `${window.location.origin}/community-forum.html#post-${postId}`
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.log('Share cancelled');
            }
        } else {
            // Fallback to clipboard
            await navigator.clipboard.writeText(shareData.url);
            this.showNotification('Post link copied to clipboard', 'success');
        }
    }

    // Enhanced comment creation with threading
    async handleNewComment(e, postId) {
        e.preventDefault();
        
        const content = document.getElementById('commentContent').value.trim();
        if (!content) {
            this.showNotification('Please enter a comment', 'warning');
            return;
        }

        // Check for mentions
        const mentions = this.extractMentions(content);
        
        try {
            const newComment = {
                post_id: postId,
                user_id: this.currentUser.id,
                content: content,
                created_at: new Date().toISOString()
            };

            // Save comment
            const { data, error } = await this.supabase
                .from('forum_comments')
                .insert([newComment])
                .select()
                .single();
            
            if (error) throw error;
            newComment.id = data.id;

            // Create mentions if any
            if (mentions.length > 0) {
                await this.createMentions(mentions, postId, newComment.id);
            }

            // Add to local data
            this.forumData.comments.push(newComment);

            // Update post comment count
            const post = this.forumData.posts.find(p => p.id === postId);
            if (post) {
                post.comments_count = (post.comments_count || 0) + 1;
            }

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

    // Extract mentions from text
    extractMentions(text) {
        const mentionRegex = /@(\w+)/g;
        const mentions = [];
        let match;
        
        while ((match = mentionRegex.exec(text)) !== null) {
            mentions.push(match[1]);
        }
        
        return [...new Set(mentions)]; // Remove duplicates
    }

    // Create mentions
    async createMentions(usernames, postId, commentId = null) {
        try {
            // Get user IDs for mentioned usernames
            const { data: users, error } = await this.supabase
                .from('profiles_consolidated')
                .select('user_id, display_name')
                .in('display_name', usernames);

            if (error) throw error;

            // Create mention records
            const mentions = users.map(user => ({
                post_id: postId,
                comment_id: commentId,
                mentioned_user_id: user.user_id,
                mentioning_user_id: this.currentUser.id
            }));

            if (mentions.length > 0) {
                const { error: insertError } = await this.supabase
                    .from('forum_mentions')
                    .insert(mentions);

                if (insertError) throw insertError;

                // Create notifications for mentioned users
                await this.createNotifications(mentions, 'mention');
            }
        } catch (error) {
            console.error('Failed to create mentions:', error);
        }
    }

    // Create notifications
    async createNotifications(mentions, type) {
        try {
            const notifications = mentions.map(mention => ({
                user_id: mention.mentioned_user_id,
                type: type,
                title: this.getNotificationTitle(type),
                message: this.getNotificationMessage(type, mention),
                data: {
                    post_id: mention.post_id,
                    comment_id: mention.comment_id,
                    from_user_id: mention.mentioning_user_id
                }
            }));

            const { error } = await this.supabase
                .from('user_notifications')
                .insert(notifications);

            if (error) throw error;
        } catch (error) {
            console.error('Failed to create notifications:', error);
        }
    }

    // Get notification title
    getNotificationTitle(type) {
        const titles = {
            mention: 'You were mentioned',
            reply: 'New reply to your post',
            vote: 'Your post received a vote',
            follow: 'Someone started following you'
        };
        return titles[type] || 'New notification';
    }

    // Get notification message
    getNotificationMessage(type, mention) {
        const user = this.forumData.usersById[mention.mentioning_user_id];
        const userName = user?.display_name || 'Someone';
        
        const messages = {
            mention: `${userName} mentioned you in a post`,
            reply: `${userName} replied to your post`,
            vote: `${userName} voted on your post`,
            follow: `${userName} started following you`
        };
        return messages[type] || 'You have a new notification';
    }

    // Update notification badge
    updateNotificationBadge() {
        const unreadCount = this.notifications.filter(n => !n.is_read).length;
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'inline' : 'none';
        }
    }

    // Setup real-time updates
    setupRealTimeUpdates() {
        if (!this.supabase) return;

        // Listen for new posts
        this.supabase
            .channel('forum_posts')
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'forum_posts' },
                (payload) => this.handleNewPostRealtime(payload)
            )
            .subscribe();

        // Listen for new comments
        this.supabase
            .channel('forum_comments')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'forum_comments' },
                (payload) => this.handleNewCommentRealtime(payload)
            )
            .subscribe();

        // Listen for new notifications
        if (this.currentUser) {
            this.supabase
                .channel('notifications')
                .on('postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'user_notifications' },
                    (payload) => this.handleNewNotificationRealtime(payload)
                )
                .subscribe();
        }
    }

    // Handle new post in real-time
    handleNewPostRealtime(payload) {
        const newPost = payload.new;
        this.forumData.posts.unshift(newPost);
        this.loadPosts();
        this.updateForumStats();
    }

    // Handle new comment in real-time
    handleNewCommentRealtime(payload) {
        const newComment = payload.new;
        this.forumData.comments.push(newComment);
        
        // Update comment count for the post
        const post = this.forumData.posts.find(p => p.id === newComment.post_id);
        if (post) {
            post.comments_count = (post.comments_count || 0) + 1;
        }
        
        this.loadPosts();
    }

    // Handle new notification in real-time
    handleNewNotificationRealtime(payload) {
        const newNotification = payload.new;
        if (newNotification.user_id === this.currentUser.id) {
            this.notifications.unshift(newNotification);
            this.updateNotificationBadge();
        }
    }

    // Initialize rich text editor
    initializeRichTextEditor() {
        // This would integrate with a rich text editor like Quill or TinyMCE
        // For now, we'll add basic markdown support
        const contentTextarea = document.getElementById('post-content');
        if (contentTextarea) {
            contentTextarea.addEventListener('input', (e) => {
                this.previewMarkdown(e.target.value);
            });
        }
    }

    // Preview markdown (basic implementation)
    previewMarkdown(text) {
        const preview = document.getElementById('markdown-preview');
        if (!preview) return;

        // Basic markdown conversion
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');

        preview.innerHTML = html;
    }

    // Update notification setting
    async updateNotificationSetting(setting, enabled) {
        try {
            const { error } = await this.supabase
                .from('profiles_consolidated')
                .update({
                    notification_settings: {
                        ...this.notificationSettings,
                        [setting]: enabled
                    }
                })
                .eq('user_id', this.currentUser.id);

            if (error) throw error;
            
            this.notificationSettings[setting] = enabled;
            this.showNotification('Notification settings updated', 'success');
        } catch (error) {
            console.error('Failed to update notification setting:', error);
            this.showNotification('Failed to update settings', 'error');
        }
    }

    // Show notifications panel
    showNotificationsPanel() {
        const panel = document.getElementById('notificationsPanel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }

    // Mark notification as read
    async markNotificationAsRead(notificationId) {
        try {
            const { error } = await this.supabase
                .from('user_notifications')
                .update({ is_read: true })
                .eq('id', notificationId);

            if (error) throw error;

            // Update local data
            const notification = this.notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.is_read = true;
            }

            this.updateNotificationBadge();
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }

    // Get user's personalized feed
    async getPersonalizedFeed() {
        if (!this.currentUser) return [];

        try {
            // Get posts from followed users
            const { data: followingPosts, error: followingError } = await this.supabase
                .from('forum_posts')
                .select(`
                    *,
                    forum_user_profiles!inner(display_name, avatar_url, reputation)
                `)
                .in('user_id', Array.from(this.followingUsers))
                .order('created_at', { ascending: false })
                .limit(20);

            if (followingError) throw followingError;

            // Get bookmarked posts
            const { data: bookmarkedPosts, error: bookmarkError } = await this.supabase
                .from('forum_bookmarks')
                .select(`
                    post_id,
                    forum_posts!inner(*, forum_user_profiles!inner(display_name, avatar_url, reputation))
                `)
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (bookmarkError) throw bookmarkError;

            // Combine and deduplicate
            const allPosts = [
                ...(followingPosts || []),
                ...(bookmarkedPosts?.map(bp => bp.forum_posts) || [])
            ];

            const uniquePosts = allPosts.filter((post, index, self) => 
                index === self.findIndex(p => p.id === post.id)
            );

            return uniquePosts;
        } catch (error) {
            console.error('Failed to get personalized feed:', error);
            return [];
        }
    }

    // Load personalized feed
    async loadPersonalizedFeed() {
        const feed = await this.getPersonalizedFeed();
        this.displayFilteredPosts(feed);
    }
}

// Initialize enhanced forum when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create enhanced forum instance
    window.forum = new EnhancedCommunityForum();
    
    // Initialize forum
    window.forum.initialize();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedCommunityForum;
}
