// Populate user profile page from Supabase
(function(){
  let supabaseClient = null;
  let currentUser = null;

  document.addEventListener('DOMContentLoaded', async () => {
    const supabaseUrl = window.APP_CONFIG?.SUPABASE_URL || '';
    const supabaseKey = window.APP_CONFIG?.SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseKey || typeof window.supabase === 'undefined') return;
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    const { data: { session } } = await supabaseClient.auth.getSession();
    currentUser = session?.user || null;

    const params = new URLSearchParams(window.location.search);
    const profileUserId = params.get('id') || currentUser?.id || null;
    if (!profileUserId) return;

    await renderProfile(profileUserId);
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
      if (bioEl && profile?.bio) bioEl.textContent = profile.bio;

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
      }
    } catch (e) {
      console.error('Failed to render profile', e);
    }
  }
})();
