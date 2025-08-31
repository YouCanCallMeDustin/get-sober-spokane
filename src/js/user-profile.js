// Populate user profile page from Supabase
// Version: 2025-01-31-v2 (with activity loading)
(function(){
  let supabaseClient = null;
  let currentUser = null;
  let viewingUserId = null;

  document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded - Starting profile initialization');
    
    const supabaseUrl = window.APP_CONFIG?.SUPABASE_URL || '';
    const supabaseKey = window.APP_CONFIG?.SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseKey || typeof window.supabase === 'undefined') {
      console.error('Missing Supabase configuration');
      return;
    }
    
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    const { data: { session } } = await supabaseClient.auth.getSession();
    currentUser = session?.user || null;
    console.log('Current user:', currentUser?.id);

    const params = new URLSearchParams(window.location.search);
    viewingUserId = params.get('id') || currentUser?.id || null;
    if (!viewingUserId) {
      console.error('No viewing user ID found');
      return;
    }
    console.log('Viewing user ID:', viewingUserId);

    try {
      // Load profile and activity in parallel
      console.log('Loading profile and activity...');
      await Promise.all([
        renderProfile(viewingUserId),
        loadUserActivity(viewingUserId)
      ]);
      
      console.log('Setting up UI components...');
      setupEditProfileModal();
      setupActivityTabs();
      
      console.log('Profile initialization complete');
    } catch (error) {
      console.error('Error during profile initialization:', error);
    }
  });

  async function renderProfile(userId){
    try {
      console.log('renderProfile - Starting for user:', userId);
      
      const [{ data: profile }, postsCount, commentsCount, upvotesCount] = await Promise.all([
        supabaseClient.from('forum_user_profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabaseClient.from('forum_posts').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabaseClient.from('forum_comments').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabaseClient.from('forum_post_votes').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('vote', 1)
      ]);

      console.log('renderProfile - Profile data:', profile);
      console.log('renderProfile - Posts count:', postsCount?.count);
      console.log('renderProfile - Comments count:', commentsCount?.count);
      console.log('renderProfile - Upvotes count:', upvotesCount?.count);

      const nameEl = document.querySelector('#userDisplayName') || document.querySelector('h1, .profile-title, .stories-hero-title');
      if (nameEl && profile?.display_name) nameEl.textContent = profile.display_name;

      const avatarImg = document.querySelector('#userAvatar');
      if (avatarImg){
        const googlePic = currentUser?.user_metadata?.picture || currentUser?.user_metadata?.avatar_url || null;
        const src = profile?.avatar_url || googlePic || '/assets/img/default-avatar.png';
        if (avatarImg.src !== src) avatarImg.src = src;
        avatarImg.alt = 'Avatar';
      }

      const bioEl = document.querySelector('#userBio');
      if (bioEl) bioEl.textContent = profile?.bio || 'No bio available';

      const locationEl = document.querySelector('#userLocation');
      if (locationEl) locationEl.textContent = profile?.location || 'Not set';

      const postsEl = document.querySelector('#userPosts');
      if (postsEl && typeof postsCount?.count === 'number') postsEl.textContent = postsCount.count;
      const commentsEl = document.querySelector('#userComments');
      if (commentsEl && typeof commentsCount?.count === 'number') commentsEl.textContent = commentsCount.count;
      const upvotesEl = document.querySelector('#userUpvotes');
      if (upvotesEl && typeof upvotesCount?.count === 'number') upvotesEl.textContent = upvotesCount.count;

      if (profile?.sobriety_date){
        console.log('renderProfile - Sobriety date found:', profile.sobriety_date);
        const daysEl = document.querySelector('#sobrietyDays');
        if (daysEl){
          const start = new Date(profile.sobriety_date);
          const now = new Date();
          const diff = Math.max(0, Math.ceil((now - start)/(1000*3600*24)));
          console.log('renderProfile - Calculating sobriety days:', diff);
          daysEl.textContent = diff;
        } else {
          console.log('renderProfile - Sobriety days element not found');
        }
        const dateEl = document.querySelector('#sobrietyDate');
        if (dateEl) dateEl.textContent = profile.sobriety_date;
      } else {
        console.log('renderProfile - No sobriety date found');
        const daysEl = document.querySelector('#sobrietyDays');
        if (daysEl) daysEl.textContent = '0';
        const dateEl = document.querySelector('#sobrietyDate');
        if (dateEl) dateEl.textContent = 'Not set';
      }

      const editBtn = document.getElementById('editProfileBtn');
      if (editBtn) editBtn.style.display = (currentUser && currentUser.id === userId) ? 'inline-block' : 'none';
    } catch (e) {
      console.error('Failed to render profile', e);
    }
  }

  function setupEditProfileModal(){
    const editBtn = document.getElementById('editProfileBtn');
    if (!editBtn || !currentUser || currentUser.id !== viewingUserId) return;
    editBtn.addEventListener('click', async () => {
      await openEditModal();
    });
  }

  async function openEditModal(){
    const modalEl = document.getElementById('editProfileModal');
    if (!modalEl) return;

    // Ensure avatar controls exist; if not, inject them at the top of the form
    const formEl = modalEl.querySelector('#editProfileForm');
    if (formEl && !formEl.querySelector('#avatarPreview')){
      const wrapper = document.createElement('div');
      wrapper.className = 'mb-3 text-center';
      wrapper.innerHTML = `
        <img id="avatarPreview" src="" alt="Avatar" style="width:96px;height:96px;border-radius:50%;object-fit:cover;">
        <div class="mt-2">
          <input type="file" id="avatarInput" accept="image/*">
        </div>`;
      formEl.insertBefore(wrapper, formEl.firstChild);
    }

    // Load current profile values
    const { data: profile } = await supabaseClient.from('forum_user_profiles').select('*').eq('user_id', viewingUserId).maybeSingle();
    const displayNameInput = document.getElementById('edit-display-name');
    const bioInput = document.getElementById('edit-bio');
    const locationInput = document.getElementById('edit-location');
    const sobrietyDateInput = document.getElementById('edit-sobriety-date');
    const avatarPrev = document.getElementById('avatarPreview');

    if (displayNameInput) displayNameInput.value = profile?.display_name || '';
    if (bioInput) bioInput.value = profile?.bio || '';
    if (locationInput) locationInput.value = profile?.location || '';
    if (sobrietyDateInput) sobrietyDateInput.value = profile?.sobriety_date || '';
          if (avatarPrev) avatarPrev.src = profile?.avatar_url || '/assets/img/default-avatar.png';

    // Simple client-side square center crop for avatar
    let avatarDataUrl = null;
    const avatarInput = document.getElementById('avatarInput');
    if (avatarInput){
      avatarInput.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            const size = Math.min(img.width, img.height);
            const sx = (img.width - size)/2;
            const sy = (img.height - size)/2;
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = 256;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, sx, sy, size, size, 0, 0, 256, 256);
            avatarDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            if (avatarPrev) avatarPrev.src = avatarDataUrl;
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      };
    }

    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn){
      saveBtn.onclick = async (e) => {
        e.preventDefault();
        try {
          const updates = {
            user_id: viewingUserId,
            display_name: displayNameInput?.value.trim() || null,
            bio: bioInput?.value.trim() || null,
            location: locationInput?.value.trim() || null,
            sobriety_date: sobrietyDateInput?.value || null,
            updated_at: new Date().toISOString()
          };
          if (avatarDataUrl) updates.avatar_url = avatarDataUrl;

          const { error } = await supabaseClient.from('forum_user_profiles').upsert(updates);
          if (error) throw error;

          await renderProfile(viewingUserId);
          const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
          modalInstance.hide();
        } catch (err) {
          console.error('Failed to save profile', err);
          alert('Failed to save profile');
        }
      };
    }

    const modalInstance = new bootstrap.Modal(modalEl);
    modalInstance.show();
  }

  async function loadUserActivity(userId) {
    try {
      console.log('loadUserActivity - Starting for user:', userId);
      
      // Fetch posts and comments for the user
      const [postsResponse, commentsResponse] = await Promise.all([
        supabaseClient.from('forum_posts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
        supabaseClient.from('forum_comments')
          .select('*, forum_posts(title)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      console.log('loadUserActivity - Posts response:', postsResponse);
      console.log('loadUserActivity - Comments response:', commentsResponse);

      const posts = postsResponse.data || [];
      const comments = commentsResponse.data || [];
      
      console.log('loadUserActivity - Found posts:', posts.length);
      console.log('loadUserActivity - Found comments:', comments.length);

      // Store activity data for tab switching
      window.userActivityData = {
        posts: posts,
        comments: comments,
        achievements: [] // Placeholder for future achievements
      };

      console.log('loadUserActivity - Rendering posts tab');
      // Show posts by default
      renderActivityTab('posts');
    } catch (error) {
      console.error('Error loading user activity:', error);
    }
  }

  function setupActivityTabs() {
    const tabs = document.querySelectorAll('[data-activity-tab]');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Render the selected tab content
        const tabType = tab.getAttribute('data-activity-tab');
        renderActivityTab(tabType);
      });
    });
  }

  function renderActivityTab(tabType) {
    const contentContainer = document.getElementById('activity-content');
    if (!contentContainer) {
      console.error('Activity content container not found');
      return;
    }

    const activityData = window.userActivityData || { posts: [], comments: [], achievements: [] };
    
    let html = '';
    
    switch (tabType) {
      case 'posts':
        if (activityData.posts.length === 0) {
          html = '<div class="text-center text-muted py-4">No posts yet</div>';
        } else {
          html = activityData.posts.map(post => createPostHTML(post)).join('');
        }
        break;
        
      case 'comments':
        if (activityData.comments.length === 0) {
          html = '<div class="text-center text-muted py-4">No comments yet</div>';
        } else {
          html = activityData.comments.map(comment => createCommentHTML(comment)).join('');
        }
        break;
        
      case 'achievements':
        html = '<div class="text-center text-muted py-4">Achievements coming soon!</div>';
        break;
        
      default:
        html = '<div class="text-center text-muted py-4">No activity found</div>';
    }
    
    contentContainer.innerHTML = html;
  }

  function createPostHTML(post) {
    return `
      <div class="activity-item border-bottom pb-3 mb-3">
        <div class="d-flex align-items-start">
          <div class="flex-grow-1">
            <h6 class="mb-1">
              <a href="/community-forum.html" class="text-decoration-none">${post.title || 'Untitled Post'}</a>
            </h6>
            <p class="text-muted small mb-2">${truncateText(post.content || '', 150)}</p>
            <div class="d-flex align-items-center text-muted small">
              <span class="me-3">
                <i class="fas fa-thumbs-up me-1"></i>${post.upvotes || 0}
              </span>
              <span class="me-3">
                <i class="fas fa-comment me-1"></i>${post.comment_count || 0}
              </span>
              <span>${formatTimeAgo(post.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function createCommentHTML(comment) {
    return `
      <div class="activity-item border-bottom pb-3 mb-3">
        <div class="d-flex align-items-start">
          <div class="flex-grow-1">
            <h6 class="mb-1">
              <span class="text-muted">Comment on:</span>
              <a href="/community-forum.html" class="text-decoration-none">${comment.forum_posts?.title || 'Unknown Post'}</a>
            </h6>
            <p class="text-muted small mb-2">${truncateText(comment.content || '', 150)}</p>
            <div class="d-flex align-items-center text-muted small">
              <span class="me-3">
                <i class="fas fa-thumbs-up me-1"></i>${comment.upvotes || 0}
              </span>
              <span>${formatTimeAgo(comment.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function formatTimeAgo(dateString) {
    if (!dateString) return 'Unknown time';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  }

  function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
})();
