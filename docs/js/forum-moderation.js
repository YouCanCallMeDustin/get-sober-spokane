// Forum Moderation Tools
// src/js/forum-moderation.js

class ForumModeration {
    constructor(forum) {
        this.forum = forum;
        this.supabase = forum.supabase;
        this.currentUser = forum.currentUser;
        this.isModerator = false;
        this.moderationActions = [];
    }

    // Initialize moderation tools
    async initialize() {
        try {
            await this.checkModeratorStatus();
            if (this.isModerator) {
                this.setupModerationUI();
                this.setupModerationEventListeners();
                await this.loadModerationActions();
            }
        } catch (error) {
            console.error('Failed to initialize moderation tools:', error);
        }
    }

    // Check if current user is a moderator
    async checkModeratorStatus() {
        if (!this.currentUser) return;

        try {
            // Check if user has moderator role or is admin
            const { data, error } = await this.supabase
                .from('profiles_consolidated')
                .select('custom_title, reputation')
                .eq('user_id', this.currentUser.id)
                .single();

            if (data && !error) {
                // Check if user has moderator title or high reputation
                this.isModerator = data.custom_title?.toLowerCase().includes('moderator') || 
                                 data.reputation >= 1000;
            }
        } catch (error) {
            console.error('Failed to check moderator status:', error);
        }
    }

    // Setup moderation UI elements
    setupModerationUI() {
        // Add moderation controls to post cards
        this.addModerationControls();
        
        // Add moderation panel to forum
        this.addModerationPanel();
        
        // Add moderation buttons to post detail modal
        this.addModalModerationControls();
    }

    // Add moderation controls to post cards
    addModerationControls() {
        // This will be called when posts are rendered
        const postCards = document.querySelectorAll('.post-card');
        postCards.forEach(card => {
            this.addPostModerationControls(card);
        });
    }

    // Add moderation controls to a specific post card
    addPostModerationControls(postCard) {
        const postId = postCard.dataset.postId;
        if (!postId) return;

        const dropdown = postCard.querySelector('.dropdown-menu');
        if (!dropdown) return;

        // Add moderation options
        const moderationOptions = `
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-warning" href="#" data-action="moderate" data-type="pin" data-id="${postId}">
                <i class="bi bi-pin-angle"></i> Pin Post
            </a></li>
            <li><a class="dropdown-item text-warning" href="#" data-action="moderate" data-type="unpin" data-id="${postId}">
                <i class="bi bi-pin-angle-fill"></i> Unpin Post
            </a></li>
            <li><a class="dropdown-item text-info" href="#" data-action="moderate" data-type="feature" data-id="${postId}">
                <i class="bi bi-star"></i> Feature Post
            </a></li>
            <li><a class="dropdown-item text-danger" href="#" data-action="moderate" data-type="lock" data-id="${postId}">
                <i class="bi bi-lock"></i> Lock Post
            </a></li>
            <li><a class="dropdown-item text-danger" href="#" data-action="moderate" data-type="unlock" data-id="${postId}">
                <i class="bi bi-unlock"></i> Unlock Post
            </a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="#" data-action="moderate" data-type="delete" data-id="${postId}">
                <i class="bi bi-trash"></i> Delete Post
            </a></li>
        `;

        dropdown.insertAdjacentHTML('beforeend', moderationOptions);
    }

    // Add moderation panel to forum
    addModerationPanel() {
        const forumContent = document.querySelector('.forum-content .container');
        if (!forumContent) return;

        const moderationPanel = document.createElement('div');
        moderationPanel.className = 'moderation-panel card mb-4';
        moderationPanel.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0">
                    <i class="bi bi-shield-check me-2"></i>
                    Moderation Panel
                </h6>
                <button class="btn btn-sm btn-outline-secondary" id="refreshModerationBtn">
                    <i class="bi bi-arrow-clockwise"></i>
                </button>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-3">
                        <div class="moderation-stat">
                            <div class="stat-number" id="reportedPosts">0</div>
                            <div class="stat-label">Reported Posts</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="moderation-stat">
                            <div class="stat-number" id="pendingApprovals">0</div>
                            <div class="stat-label">Pending Approvals</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="moderation-stat">
                            <div class="stat-number" id="moderationActions">0</div>
                            <div class="stat-label">Actions Today</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="moderation-stat">
                            <div class="stat-number" id="activeUsers">0</div>
                            <div class="stat-label">Active Users</div>
                        </div>
                    </div>
                </div>
                <div class="moderation-actions mt-3">
                    <button class="btn btn-outline-primary btn-sm me-2" id="viewReportsBtn">
                        <i class="bi bi-flag"></i> View Reports
                    </button>
                    <button class="btn btn-outline-warning btn-sm me-2" id="viewPendingBtn">
                        <i class="bi bi-clock"></i> Pending Approvals
                    </button>
                    <button class="btn btn-outline-info btn-sm me-2" id="viewUsersBtn">
                        <i class="bi bi-people"></i> User Management
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" id="moderationLogBtn">
                        <i class="bi bi-list-ul"></i> Moderation Log
                    </button>
                </div>
            </div>
        `;

        // Insert after forum controls
        const forumControls = document.querySelector('.forum-controls');
        if (forumControls) {
            forumControls.insertAdjacentElement('afterend', moderationPanel);
        }
    }

    // Add moderation controls to post detail modal
    addModalModerationControls() {
        // This will be called when the modal is shown
        const modal = document.getElementById('postDetailModal');
        if (!modal) return;

        // Add moderation section to modal
        const modalBody = modal.querySelector('.modal-body');
        if (!modalBody) return;

        // Check if moderation section already exists
        if (modalBody.querySelector('.moderation-section')) return;

        const moderationSection = document.createElement('div');
        moderationSection.className = 'moderation-section mt-3 p-3 bg-light rounded';
        moderationSection.innerHTML = `
            <h6 class="text-muted mb-2">
                <i class="bi bi-shield-check me-2"></i>
                Moderation Actions
            </h6>
            <div class="btn-group btn-group-sm" role="group">
                <button type="button" class="btn btn-outline-warning" data-action="moderate" data-type="pin">
                    <i class="bi bi-pin-angle"></i> Pin
                </button>
                <button type="button" class="btn btn-outline-info" data-action="moderate" data-type="feature">
                    <i class="bi bi-star"></i> Feature
                </button>
                <button type="button" class="btn btn-outline-danger" data-action="moderate" data-type="lock">
                    <i class="bi bi-lock"></i> Lock
                </button>
                <button type="button" class="btn btn-outline-danger" data-action="moderate" data-type="delete">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </div>
        `;

        modalBody.appendChild(moderationSection);
    }

    // Setup moderation event listeners
    setupModerationEventListeners() {
        // Moderation action buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="moderate"]')) {
                e.preventDefault();
                this.handleModerationAction(e.target);
            }
        });

        // Refresh moderation data
        const refreshBtn = document.getElementById('refreshModerationBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadModerationData());
        }

        // Moderation panel buttons
        const viewReportsBtn = document.getElementById('viewReportsBtn');
        if (viewReportsBtn) {
            viewReportsBtn.addEventListener('click', () => this.showReportsModal());
        }

        const viewPendingBtn = document.getElementById('viewPendingBtn');
        if (viewPendingBtn) {
            viewPendingBtn.addEventListener('click', () => this.showPendingModal());
        }

        const viewUsersBtn = document.getElementById('viewUsersBtn');
        if (viewUsersBtn) {
            viewUsersBtn.addEventListener('click', () => this.showUsersModal());
        }

        const moderationLogBtn = document.getElementById('moderationLogBtn');
        if (moderationLogBtn) {
            moderationLogBtn.addEventListener('click', () => this.showModerationLogModal());
        }
    }

    // Handle moderation action
    async handleModerationAction(button) {
        const actionType = button.dataset.type;
        const targetId = button.dataset.id;
        const postId = targetId || this.getCurrentPostId();

        if (!postId) {
            this.forum.showNotification('Unable to identify target for moderation action', 'error');
            return;
        }

        try {
            let result;
            switch (actionType) {
                case 'pin':
                    result = await this.pinPost(postId);
                    break;
                case 'unpin':
                    result = await this.unpinPost(postId);
                    break;
                case 'feature':
                    result = await this.featurePost(postId);
                    break;
                case 'lock':
                    result = await this.lockPost(postId);
                    break;
                case 'unlock':
                    result = await this.unlockPost(postId);
                    break;
                case 'delete':
                    result = await this.deletePost(postId);
                    break;
                default:
                    throw new Error('Unknown moderation action');
            }

            if (result.success) {
                this.forum.showNotification(result.message, 'success');
                await this.recordModerationAction(actionType, postId, result.details);
                this.forum.loadPosts(); // Refresh posts
            } else {
                this.forum.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Moderation action failed:', error);
            this.forum.showNotification('Moderation action failed: ' + error.message, 'error');
        }
    }

    // Pin post
    async pinPost(postId) {
        const { error } = await this.supabase
            .from('forum_posts')
            .update({ is_pinned: true })
            .eq('id', postId);

        if (error) throw error;
        return { success: true, message: 'Post pinned successfully' };
    }

    // Unpin post
    async unpinPost(postId) {
        const { error } = await this.supabase
            .from('forum_posts')
            .update({ is_pinned: false })
            .eq('id', postId);

        if (error) throw error;
        return { success: true, message: 'Post unpinned successfully' };
    }

    // Feature post
    async featurePost(postId) {
        const { error } = await this.supabase
            .from('forum_posts')
            .update({ is_featured: true })
            .eq('id', postId);

        if (error) throw error;
        return { success: true, message: 'Post featured successfully' };
    }

    // Lock post
    async lockPost(postId) {
        const { error } = await this.supabase
            .from('forum_posts')
            .update({ is_locked: true })
            .eq('id', postId);

        if (error) throw error;
        return { success: true, message: 'Post locked successfully' };
    }

    // Unlock post
    async unlockPost(postId) {
        const { error } = await this.supabase
            .from('forum_posts')
            .update({ is_locked: false })
            .eq('id', postId);

        if (error) throw error;
        return { success: true, message: 'Post unlocked successfully' };
    }

    // Delete post (moderator version)
    async deletePost(postId) {
        if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return { success: false, message: 'Deletion cancelled' };
        }

        const { error } = await this.supabase
            .from('forum_posts')
            .delete()
            .eq('id', postId);

        if (error) throw error;
        return { success: true, message: 'Post deleted successfully' };
    }

    // Get current post ID from modal
    getCurrentPostId() {
        const modal = document.getElementById('postDetailModal');
        if (!modal) return null;

        const postDetail = modal.querySelector('.post-detail');
        if (!postDetail) return null;

        return postDetail.dataset.postId;
    }

    // Record moderation action
    async recordModerationAction(actionType, targetId, details = {}) {
        try {
            const { error } = await this.supabase
                .from('forum_moderation_actions')
                .insert({
                    moderator_id: this.currentUser.id,
                    target_type: 'post',
                    target_id: targetId,
                    action_type: actionType,
                    details: details
                });

            if (error) throw error;
        } catch (error) {
            console.error('Failed to record moderation action:', error);
        }
    }

    // Load moderation data
    async loadModerationData() {
        try {
            // Load reported posts count
            const { count: reportedCount } = await this.supabase
                .from('forum_reports_enhanced')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            // Load pending approvals count
            const { count: pendingCount } = await this.supabase
                .from('forum_posts')
                .select('*', { count: 'exact', head: true })
                .eq('is_approved', false);

            // Load moderation actions count for today
            const today = new Date().toISOString().split('T')[0];
            const { count: actionsCount } = await this.supabase
                .from('forum_moderation_actions')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', today);

            // Load active users count (users active in last 7 days)
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            const { count: activeUsersCount } = await this.supabase
                .from('profiles_consolidated')
                .select('*', { count: 'exact', head: true })
                .gte('last_active', weekAgo);

            // Update UI
            this.updateModerationStats({
                reportedPosts: reportedCount || 0,
                pendingApprovals: pendingCount || 0,
                moderationActions: actionsCount || 0,
                activeUsers: activeUsersCount || 0
            });
        } catch (error) {
            console.error('Failed to load moderation data:', error);
        }
    }

    // Update moderation statistics
    updateModerationStats(stats) {
        const elements = {
            reportedPosts: document.getElementById('reportedPosts'),
            pendingApprovals: document.getElementById('pendingApprovals'),
            moderationActions: document.getElementById('moderationActions'),
            activeUsers: document.getElementById('activeUsers')
        };

        Object.keys(stats).forEach(key => {
            if (elements[key]) {
                elements[key].textContent = stats[key];
            }
        });
    }

    // Show reports modal
    async showReportsModal() {
        try {
            const { data: reports, error } = await this.supabase
                .from('forum_reports_enhanced')
                .select(`
                    *,
                    forum_posts!inner(title, content),
                    forum_user_profiles!inner(display_name)
                `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.createReportsModal(reports || []);
        } catch (error) {
            console.error('Failed to load reports:', error);
            this.forum.showNotification('Failed to load reports', 'error');
        }
    }

    // Create reports modal
    createReportsModal(reports) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'reportsModal';
        modal.innerHTML = `
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-flag me-2"></i>
                            Reported Content
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="reports-list">
                            ${reports.map(report => this.createReportItem(report)).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();

        // Clean up when modal is hidden
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    // Create report item
    createReportItem(report) {
        return `
            <div class="report-item card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="report-content">
                            <h6 class="card-title">${report.forum_posts.title}</h6>
                            <p class="card-text">${report.description}</p>
                            <div class="report-meta">
                                <small class="text-muted">
                                    Reported by: ${report.forum_user_profiles.display_name} | 
                                    Reason: ${report.reason} | 
                                    ${this.forum.formatTimeAgo(report.created_at)}
                                </small>
                            </div>
                        </div>
                        <div class="report-actions">
                            <button class="btn btn-sm btn-outline-primary me-2" onclick="moderation.viewReportedContent('${report.target_id}')">
                                <i class="bi bi-eye"></i> View
                            </button>
                            <button class="btn btn-sm btn-outline-success me-2" onclick="moderation.resolveReport('${report.id}', 'resolved')">
                                <i class="bi bi-check"></i> Resolve
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="moderation.resolveReport('${report.id}', 'dismissed')">
                                <i class="bi bi-x"></i> Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // View reported content
    async viewReportedContent(postId) {
        const post = this.forum.forumData.posts.find(p => p.id === postId);
        if (post) {
            const comments = await this.forum.loadPostComments(postId);
            this.forum.showPostDetailModal(post, comments);
        }
    }

    // Resolve report
    async resolveReport(reportId, status) {
        try {
            const { error } = await this.supabase
                .from('forum_reports_enhanced')
                .update({ 
                    status: status,
                    moderator_id: this.currentUser.id,
                    resolved_at: new Date().toISOString()
                })
                .eq('id', reportId);

            if (error) throw error;

            this.forum.showNotification(`Report ${status} successfully`, 'success');
            this.loadModerationData(); // Refresh stats
        } catch (error) {
            console.error('Failed to resolve report:', error);
            this.forum.showNotification('Failed to resolve report', 'error');
        }
    }

    // Load moderation actions
    async loadModerationActions() {
        try {
            const { data, error } = await this.supabase
                .from('forum_moderation_actions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            this.moderationActions = data || [];
        } catch (error) {
            console.error('Failed to load moderation actions:', error);
        }
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ForumModeration;
}
