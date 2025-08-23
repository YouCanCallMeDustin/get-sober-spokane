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

      const nameEl = document.querySelector('#userDisplayName') || document.querySelector('h1, .profile-title, .stories-hero-title');
      if (nameEl && profile?.display_name) nameEl.textContent = profile.display_name;

      const avatarImg = document.querySelector('#userAvatar');
      if (avatarImg){
        const googlePic = currentUser?.user_metadata?.picture || currentUser?.user_metadata?.avatar_url || null;
        const src = profile?.avatar_url || googlePic || '/get-sober-spokane/assets/img/default-avatar.png';
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
        const daysEl = document.querySelector('#sobrietyDays');
        if (daysEl){
          const start = new Date(profile.sobriety_date);
          const now = new Date();
          const diff = Math.max(0, Math.ceil((now - start)/(1000*3600*24)));
          daysEl.textContent = diff;
        }
        const dateEl = document.querySelector('#sobrietyDate');
        if (dateEl) dateEl.textContent = profile.sobriety_date;
      } else {
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
    if (avatarPrev) avatarPrev.src = profile?.avatar_url || '/get-sober-spokane/assets/img/default-avatar.png';

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
})();
