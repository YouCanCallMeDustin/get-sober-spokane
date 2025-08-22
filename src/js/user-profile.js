// Populate user profile page from Supabase
(function(){
  let supabaseClient = null;
  let currentUser = null;
  let viewingUserId = null;

  document.addEventListener('DOMContentLoaded', async () => {
    const supabaseUrl = window.APP_CONFIG?.SUPABASE_URL || '';
    const supabaseKey = window.APP_CONFIG?.SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseKey || typeof window.supabase === 'undefined') return;
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    const { data: { session } } = await supabaseClient.auth.getSession();
    currentUser = session?.user || null;

    const params = new URLSearchParams(window.location.search);
    viewingUserId = params.get('id') || currentUser?.id || null;
    if (!viewingUserId) return;

    await renderProfile(viewingUserId);
    setupEditProfileModal();
  });

  async function renderProfile(userId){
    try {
      const [{ data: profile }, postsCount, commentsCount, upvotesCount] = await Promise.all([
        supabaseClient.from('forum_user_profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabaseClient.from('forum_posts').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabaseClient.from('forum_comments').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabaseClient.from('forum_post_votes').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('vote', 1)
      ]);

      // Header
      const nameEl = document.querySelector('#userDisplayName') || document.querySelector('h1, .profile-title, .stories-hero-title');
      if (nameEl && profile?.display_name) nameEl.textContent = profile.display_name;

      const avatarImg = document.querySelector('#userAvatar');
      if (avatarImg && profile?.avatar_url) avatarImg.src = profile.avatar_url;

      const bioEl = document.querySelector('#userBio');
      if (bioEl) bioEl.textContent = profile?.bio || 'No bio available';

      const locationEl = document.querySelector('#userLocation');
      if (locationEl && profile?.location) locationEl.textContent = profile.location;

      // Counters
      const postsEl = document.querySelector('#userPosts');
      if (postsEl && typeof postsCount?.count === 'number') postsEl.textContent = postsCount.count;
      const commentsEl = document.querySelector('#userComments');
      if (commentsEl && typeof commentsCount?.count === 'number') commentsEl.textContent = commentsCount.count;
      const upvotesEl = document.querySelector('#userUpvotes');
      if (upvotesEl && typeof upvotesCount?.count === 'number') upvotesEl.textContent = upvotesCount.count;

      // Sobriety days
      if (profile?.sobriety_date){
        const daysEl = document.querySelector('#sobrietyDays');
        if (daysEl){
          const start = new Date(profile.sobriety_date);
          const now = new Date();
          const diff = Math.max(0, Math.ceil((now - start)/(1000*3600*24)));
          daysEl.textContent = diff;
        }
        const dateEl = document.querySelector('#sobrietyDateText');
        if (dateEl) dateEl.textContent = profile.sobriety_date;
      }

      // Show Edit Profile button only for owner
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
    // Create modal markup if not present
    let modal = document.getElementById('profileEditModal');
    if (!modal){
      modal = document.createElement('div');
      modal.className = 'modal fade';
      modal.id = 'profileEditModal';
      modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Edit Profile</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="profileEditForm">
                <div class="mb-3 text-center">
                  <img id="avatarPreview" src="" alt="Avatar" style="width:96px;height:96px;border-radius:50%;object-fit:cover;">
                  <div class="mt-2">
                    <input type="file" id="avatarInput" accept="image/*">
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Display Name</label>
                  <input type="text" class="form-control" id="displayNameInput" maxlength="80">
                </div>
                <div class="mb-3">
                  <label class="form-label">Bio</label>
                  <textarea class="form-control" id="bioInput" rows="3" maxlength="500"></textarea>
                </div>
                <div class="mb-3">
                  <label class="form-label">Location</label>
                  <input type="text" class="form-control" id="locationInput" maxlength="120">
                </div>
                <div class="mb-3">
                  <label class="form-label">Sobriety Date</label>
                  <input type="date" class="form-control" id="sobrietyDateInput">
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" id="saveProfileBtn">Save</button>
            </div>
          </div>
        </div>`;
      document.body.appendChild(modal);
    }

    // Load current profile values
    const { data: profile } = await supabaseClient.from('forum_user_profiles').select('*').eq('user_id', viewingUserId).maybeSingle();
    document.getElementById('displayNameInput').value = profile?.display_name || '';
    document.getElementById('bioInput').value = profile?.bio || '';
    document.getElementById('locationInput').value = profile?.location || '';
    document.getElementById('sobrietyDateInput').value = profile?.sobriety_date || '';
    const avatarPrev = document.getElementById('avatarPreview');
    avatarPrev.src = profile?.avatar_url || '/get-sober-spokane/assets/img/default-avatar.png';

    // Simple client-side square crop using canvas (center crop)
    let avatarDataUrl = null;
    document.getElementById('avatarInput').onchange = (e) => {
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
          canvas.width = canvas.height = 256; // standard avatar size
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, sx, sy, size, size, 0, 0, 256, 256);
          avatarDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          avatarPrev.src = avatarDataUrl;
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };

    // Save handler
    document.getElementById('saveProfileBtn').onclick = async () => {
      try {
        const updates = {
          user_id: viewingUserId,
          display_name: document.getElementById('displayNameInput').value.trim(),
          bio: document.getElementById('bioInput').value.trim(),
          location: document.getElementById('locationInput').value.trim(),
          sobriety_date: document.getElementById('sobrietyDateInput').value || null,
          updated_at: new Date().toISOString()
        };
        if (avatarDataUrl) updates.avatar_url = avatarDataUrl;
        const { error } = await supabaseClient.from('forum_user_profiles').upsert(updates);
        if (error) throw error;
        // Refresh UI
        await renderProfile(viewingUserId);
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('profileEditModal')) || new bootstrap.Modal(document.getElementById('profileEditModal'));
        modalInstance.hide();
      } catch (e) {
        console.error('Failed to save profile', e);
        alert('Failed to save profile');
      }
    };

    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
  }
})();
