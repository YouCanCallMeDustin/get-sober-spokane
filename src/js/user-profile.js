/*!
* Start Bootstrap - Creative v7.0.7 (https://YOUR_USERNAME.github.io/sober-spokane)
* Copyright 2013-2025 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-creative/blob/master/LICENSE)
* Built: 2025-08-31T17:54:28.739Z
*/
// Populate user profile page from Supabase
// Version: 2025-01-31-v3 (fixed and cleaned up)
(function() {
  let supabaseClient = null;
  let currentUser = null;
  let viewingUserId = null;

  // Wait for both DOM and window to be fully ready
  function waitForReady() {
    return new Promise((resolve) => {
      if (document.readyState === 'complete' && window.supabase) {
        resolve();
      } else {
        window.addEventListener('load', () => {
          // Additional delay to ensure everything is loaded
          setTimeout(resolve, 500);
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded - Starting profile initialization');
    
    try {
      // Wait for everything to be fully ready
      await waitForReady();
      console.log('Page fully loaded, proceeding with initialization');
      
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

      // Load profile and activity in parallel
      console.log('Loading profile and activity...');
      await Promise.all([
        renderProfile(viewingUserId),
        loadUserActivity(viewingUserId)
      ]);
      
      console.log('Setting up UI components...');
      setupEditProfileModal();
      setupActivityTabs();
      setupInlineBioEdit();
      
      console.log('Profile initialization complete');
      
      // Test profile picture loading
      testProfilePictureLoading();
    } catch (error) {
      console.error('Error during profile initialization:', error);
    }
  });

  // Test function to help debug profile picture issues
  function testProfilePictureLoading() {
    console.log('=== Profile Picture Debug Test ===');
    const avatarImg = document.querySelector('#userAvatar');
    if (avatarImg) {
      console.log('Avatar element found:', avatarImg);
      console.log('Current src:', avatarImg.src);
      console.log('Image loaded:', avatarImg.complete);
      console.log('Image natural width:', avatarImg.naturalWidth);
      console.log('Image natural height:', avatarImg.naturalHeight);
      
      // Test if the default logo loads
      avatarImg.onload = function() {
        console.log('Image loaded successfully:', this.src);
      };
      
      avatarImg.onerror = function() {
        console.error('Image failed to load:', this.src);
      };
    } else {
      console.error('Avatar element not found!');
    }
    console.log('=== End Profile Picture Debug Test ===');
  }

  async function renderProfile(userId) {
    try {
      console.log('renderProfile - Starting for user:', userId);
      
      const [{ data: profile }, postsCount, commentsCount, upvotesCount, { data: milestones }] = await Promise.all([
        supabaseClient.from('forum_user_profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabaseClient.from('forum_posts').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabaseClient.from('forum_comments').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabaseClient.from('forum_post_votes').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('vote', 1),
        supabaseClient.from('recovery_milestones').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      ]);

      console.log('renderProfile - Profile data:', profile);
      console.log('renderProfile - Posts count:', postsCount?.count);
      console.log('renderProfile - Comments count:', commentsCount?.count);
      console.log('renderProfile - Upvotes count:', upvotesCount?.count);
      console.log('renderProfile - Milestones:', milestones);

      // Update display name
      const nameEl = document.querySelector('#userDisplayName') || document.querySelector('h1, .profile-title, .stories-hero-title');
      if (nameEl && profile?.display_name) {
        nameEl.textContent = profile.display_name;
      }

      // Update avatar with improved fallback logic
      const avatarImg = document.querySelector('#userAvatar');
      if (avatarImg) {
        // Priority: 1. Profile avatar_url, 2. Google picture, 3. Default logo
        const googlePic = currentUser?.user_metadata?.picture || currentUser?.user_metadata?.avatar_url || null;
        const profileAvatar = profile?.avatar_url;
        
        console.log('Avatar loading - Profile avatar_url:', profileAvatar);
        console.log('Avatar loading - Google picture:', googlePic);
        
        // Try profile avatar first, then Google picture, then default
        let src = profileAvatar || googlePic || '/assets/img/logo.png';
        
        console.log('Avatar loading - Initial src:', src);
        
        // Set up error handling before setting src
        avatarImg.onerror = function() {
          console.error('Failed to load avatar image:', this.src);
          
          // If Google picture failed, try default logo
          if (this.src === googlePic) {
            console.log('Google picture failed, trying default logo');
            this.src = '/assets/img/logo.png';
          }
          // If profile avatar failed, try Google picture
          else if (this.src === profileAvatar && googlePic) {
            console.log('Profile avatar failed, trying Google picture');
            this.src = googlePic;
          }
          // If everything failed, use default
          else {
            console.log('All avatars failed, using default logo');
            this.src = '/assets/img/logo.png';
          }
        };
        
        // Set up success handler
        avatarImg.onload = function() {
          console.log('Avatar loaded successfully:', this.src);
        };
        
        // Set the initial src
        avatarImg.src = src;
        avatarImg.alt = 'Avatar';
      }

      // Update bio
      const bioEl = document.querySelector('#userBio');
      if (bioEl) {
        bioEl.textContent = profile?.bio || 'No bio available';
      }

      // Update location
      const locationEl = document.querySelector('#userLocation');
      if (locationEl) {
        locationEl.textContent = profile?.location || 'Not set';
      }

      // Load member since date
      const memberSinceEl = document.querySelector('#memberSince');
      if (memberSinceEl) {
        if (profile?.join_date) {
          const joinDate = new Date(profile.join_date);
          memberSinceEl.textContent = joinDate.toLocaleDateString();
        } else if (profile?.created_at) {
          const createdDate = new Date(profile.created_at);
          memberSinceEl.textContent = createdDate.toLocaleDateString();
        } else {
          memberSinceEl.textContent = 'Unknown';
        }
      }

      // Update activity counts
      const postsEl = document.querySelector('#userPosts');
      if (postsEl && typeof postsCount?.count === 'number') {
        postsEl.textContent = postsCount.count;
      }
      
      const commentsEl = document.querySelector('#userComments');
      if (commentsEl && typeof commentsCount?.count === 'number') {
        commentsEl.textContent = commentsCount.count;
      }
      
      const upvotesEl = document.querySelector('#userUpvotes');
      if (upvotesEl && typeof upvotesCount?.count === 'number') {
        upvotesEl.textContent = upvotesCount.count;
      }

      // Update sobriety information
      if (profile?.sobriety_date) {
        console.log('renderProfile - Sobriety date found:', profile.sobriety_date);
        const daysEl = document.querySelector('#sobrietyDays');
        if (daysEl) {
          const start = new Date(profile.sobriety_date);
          const now = new Date();
          const diff = Math.max(0, Math.ceil((now - start) / (1000 * 3600 * 24)));
          console.log('renderProfile - Calculating sobriety days:', diff);
          daysEl.textContent = diff;
        } else {
          console.log('renderProfile - Sobriety days element not found');
        }
        
        const dateEl = document.querySelector('#sobrietyDate');
        if (dateEl) {
          dateEl.textContent = profile.sobriety_date;
        }
      } else {
        console.log('renderProfile - No sobriety date found');
        const daysEl = document.querySelector('#sobrietyDays');
        if (daysEl) {
          daysEl.textContent = '0';
        }
        
        const dateEl = document.querySelector('#sobrietyDate');
        if (dateEl) {
          dateEl.textContent = 'Not set';
        }
      }

      // Load and display milestones
      const milestonesContainer = document.getElementById('userMilestones');
      if (milestonesContainer) {
        if (milestones && milestones.length > 0) {
          const milestonesHTML = milestones.map(milestone => `
            <div class="milestone-item d-flex align-items-center mb-2">
              <div class="flex-grow-1">
                <a href="#" class="milestone-link text-decoration-none" data-milestone-id="${milestone.id}">
                  <h6 class="mb-1 text-primary">${milestone.title}</h6>
                  <small class="text-muted">${formatTimeAgo(milestone.created_at)}</small>
                </a>
              </div>
            </div>
          `).join('');
          milestonesContainer.innerHTML = milestonesHTML;
          
          // Add click event listeners to milestone links
          const milestoneLinks = milestonesContainer.querySelectorAll('.milestone-link');
          milestoneLinks.forEach(link => {
            link.addEventListener('click', (e) => {
              e.preventDefault();
              const milestoneId = link.getAttribute('data-milestone-id');
              const milestone = milestones.find(m => m.id === milestoneId);
              if (milestone) {
                showMilestoneModal(milestone);
              }
            });
          });
        } else {
          milestonesContainer.innerHTML = '<p class="text-muted">No milestones yet</p>';
        }
      }

      // Show/hide edit button based on user permissions
      const editBtn = document.getElementById('editProfileBtn');
      if (editBtn) {
        editBtn.style.display = (currentUser && currentUser.id === userId) ? 'inline-block' : 'none';
      }
    } catch (e) {
      console.error('Failed to render profile', e);
    }
  }

  function setupEditProfileModal() {
    const editBtn = document.getElementById('editProfileBtn');
    if (!editBtn || !currentUser || currentUser.id !== viewingUserId) {
      return;
    }
    
    editBtn.addEventListener('click', async () => {
      await openEditModal();
    });
  }

  async function openEditModal() {
    const modalEl = document.getElementById('editProfileModal');
    if (!modalEl) {
      return;
    }

    // Ensure avatar controls exist; if not, inject them at the top of the form
    const formEl = modalEl.querySelector('#editProfileForm');
    if (formEl && !formEl.querySelector('#avatarPreview')) {
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

    if (displayNameInput) {
      displayNameInput.value = profile?.display_name || '';
    }
    if (bioInput) {
      bioInput.value = profile?.bio || '';
    }
    if (locationInput) {
      locationInput.value = profile?.location || '';
    }
    if (sobrietyDateInput) {
      sobrietyDateInput.value = profile?.sobriety_date || '';
    }
    if (avatarPrev) {
      avatarPrev.src = profile?.avatar_url || '/assets/img/logo.png';
    }

    // Simple client-side square center crop for avatar
    let avatarDataUrl = null;
    const avatarInput = document.getElementById('avatarInput');
    if (avatarInput) {
      avatarInput.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            const size = Math.min(img.width, img.height);
            const sx = (img.width - size) / 2;
            const sy = (img.height - size) / 2;
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = 256;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, sx, sy, size, size, 0, 0, 256, 256);
            avatarDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            if (avatarPrev) {
              avatarPrev.src = avatarDataUrl;
            }
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      };
    }

    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) {
      saveBtn.onclick = async (e) => {
        e.preventDefault();
        
        // Show loading state
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;
        
        try {
          const updates = {
            user_id: viewingUserId,
            display_name: displayNameInput?.value.trim() || null,
            bio: bioInput?.value.trim() || null,
            location: locationInput?.value.trim() || null,
            sobriety_date: sobrietyDateInput?.value || null
          };
          
          if (avatarDataUrl) {
            updates.avatar_url = avatarDataUrl;
          }

          const { error } = await supabaseClient.from('forum_user_profiles').upsert(updates);
          if (error) throw error;

          // Update the profile display
          await renderProfile(viewingUserId);
          
          // Properly close the modal and clean up
          const modalInstance = bootstrap.Modal.getInstance(modalEl);
          if (modalInstance) {
            modalInstance.hide();
            
            // Ensure modal backdrop is removed
            modalInstance._config.backdrop = true;
            modalEl.addEventListener('hidden.bs.modal', function cleanup() {
              // Remove any lingering backdrop
              const backdrops = document.querySelectorAll('.modal-backdrop');
              backdrops.forEach(backdrop => backdrop.remove());
              
              // Remove body class that might be causing the fade
              document.body.classList.remove('modal-open');
              document.body.style.overflow = '';
              document.body.style.paddingRight = '';
              
              // Remove this event listener
              modalEl.removeEventListener('hidden.bs.modal', cleanup);
            }, { once: true });
          }
          
          // Show success message
          showSuccessMessage('Profile updated successfully!');
          
        } catch (err) {
          console.error('Failed to save profile', err);
          showErrorMessage('Failed to save profile. Please try again.');
        } finally {
          // Restore button state
          saveBtn.textContent = originalText;
          saveBtn.disabled = false;
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

  function showSuccessMessage(message) {
    // Create a temporary success message
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
    successDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    successDiv.innerHTML = `
      <i class="bi bi-check-circle me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(successDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.remove();
      }
    }, 5000);
  }

  function showErrorMessage(message) {
    // Create a temporary error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed';
    errorDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    errorDiv.innerHTML = `
      <i class="bi bi-exclamation-triangle me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 8000);
  }

  function showMilestoneModal(milestone) {
    // Create modal HTML if it doesn't exist
    let modal = document.getElementById('milestoneModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'modal fade';
      modal.id = 'milestoneModal';
      modal.setAttribute('tabindex', '-1');
      modal.setAttribute('aria-labelledby', 'milestoneModalLabel');
      modal.setAttribute('aria-hidden', 'true');
      
      modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title text-white" id="milestoneModalLabel">
                <i class="bi bi-trophy me-2"></i>
                <span id="milestoneModalTitle" class="text-white"></span>
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="milestone-details">
                <div class="milestone-date mb-3">
                  <i class="bi bi-calendar-event me-2 text-muted"></i>
                  <span id="milestoneModalDate" class="text-muted"></span>
                </div>
                <div class="milestone-description">
                  <p id="milestoneModalDescription" class="mb-0"></p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
    }
    
    // Update modal content
    document.getElementById('milestoneModalTitle').textContent = milestone.title;
    document.getElementById('milestoneModalDate').textContent = formatTimeAgo(milestone.created_at);
    document.getElementById('milestoneModalDescription').textContent = milestone.description;
    
    // Show the modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
  }

  // Setup inline bio editing
  function setupInlineBioEdit() {
    console.log('setupInlineBioEdit - Starting setup');
    
    // Wait a bit for DOM to be fully ready
    setTimeout(() => {
      const editBioBtn = document.getElementById('editBioBtn');
      console.log('setupInlineBioEdit - Edit button found:', editBioBtn);
      
      if (!editBioBtn) {
        console.log('setupInlineBioEdit - Edit button not found, retrying...');
        // Retry once more after a longer delay
        setTimeout(() => {
          const retryBtn = document.getElementById('editBioBtn');
          if (retryBtn) {
            console.log('setupInlineBioEdit - Edit button found on retry');
            setupEditButtonListeners(retryBtn);
          } else {
            console.error('setupInlineBioEdit - Edit button still not found after retry');
          }
        }, 1000);
        return;
      }
      
      setupEditButtonListeners(editBioBtn);
    }, 100);
  }
  
  function setupEditButtonListeners(editBioBtn) {
    console.log('setupEditButtonListeners - Setting up click handler');
    
    // Remove any existing listeners to prevent duplicates
    editBioBtn.removeEventListener('click', handleEditBioClick);
    editBioBtn.addEventListener('click', handleEditBioClick);
    
    console.log('setupEditButtonListeners - Click handler set up successfully');
  }
  
  function handleEditBioClick() {
    console.log('handleEditBioClick - Edit button clicked');
    
    const bioEl = document.getElementById('userBio');
    if (!bioEl) {
      console.error('handleEditBioClick - Bio element not found');
      return;
    }
    
    const currentBio = bioEl.textContent;
    console.log('handleEditBioClick - Current bio:', currentBio);
      
    // Create inline edit form
    const editForm = document.createElement('div');
    editForm.className = 'd-flex align-items-center mb-2';
    editForm.innerHTML = `
      <textarea class="form-control me-2" id="inlineBioInput" rows="2" maxlength="500" placeholder="Tell us about yourself...">${currentBio === 'No bio available' ? '' : currentBio}</textarea>
      <button class="btn btn-success btn-sm me-2" id="saveBioBtn" type="button">
        <i class="bi bi-check"></i>
      </button>
      <button class="btn btn-secondary btn-sm" id="cancelBioBtn" type="button">
        <i class="bi bi-x"></i>
      </button>
    `;
    
    // Replace the bio element with the edit form
    bioEl.parentNode.replaceChild(editForm, bioEl);
    
    // Focus on input
    const textarea = document.getElementById('inlineBioInput');
    textarea.focus();
    
    // Setup save button
    document.getElementById('saveBioBtn').addEventListener('click', async function() {
      const newBio = textarea.value.trim();
      try {
        const { error } = await supabaseClient.from('forum_user_profiles').upsert({
          user_id: viewingUserId,
          bio: newBio || null
        });
        
        if (error) throw error;
        
        // Update bio display and restore the original bio element
        bioEl.textContent = newBio || 'No bio available';
        editForm.parentNode.replaceChild(bioEl, editForm);
        
      } catch (err) {
        console.error('Failed to save bio:', err);
        alert('Failed to save bio');
      }
    });
    
    // Setup cancel button
    document.getElementById('cancelBioBtn').addEventListener('click', function() {
      // Restore the original bio element
      editForm.parentNode.replaceChild(bioEl, editForm);
    });
  }
})();
