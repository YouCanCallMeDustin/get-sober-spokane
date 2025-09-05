const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables for user controller');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * User Controller - Handles user profile data fetching and merging
 */
class UserController {
  
  /**
   * Get user profile by ID
   * @param {string} userId - User ID from Google Auth
   * @returns {Object} Merged user profile data
   */
  async getUserProfile(userId) {
    try {
      // Fetch data from multiple sources
      const [googleAuthData, sobrietyData, forumStats] = await Promise.allSettled([
        this.getGoogleAuthUser(userId),
        this.getSobrietyData(userId),
        this.getForumStats(userId)
      ]);

      // Debug logging
      console.log('🔍 Debug - Data fetched for user:', userId);
      console.log('Google Auth data:', googleAuthData.status === 'fulfilled' ? googleAuthData.value : 'Failed');
      console.log('Sobriety data:', sobrietyData.status === 'fulfilled' ? sobrietyData.value : 'Failed');
      console.log('Forum stats:', forumStats.status === 'fulfilled' ? forumStats.value : 'Failed');

      // Check if we have at least some basic user data
      if (googleAuthData.status === 'rejected' && sobrietyData.status === 'rejected') {
        console.error('No user data found for ID:', userId);
        return null;
      }

      // Merge the data with fallbacks
      const profile = {
        id: userId,
        // Google Auth data
        name: sobrietyData.status === 'fulfilled' && sobrietyData.value.display_name ? 
              sobrietyData.value.display_name : 
              (googleAuthData.status === 'fulfilled' ? googleAuthData.value.name : 'Unknown User'),
        email: googleAuthData.status === 'fulfilled' ? googleAuthData.value.email : 'No email available',
        avatar_url: googleAuthData.status === 'fulfilled' ? googleAuthData.value.avatar : null,
        memberSince: googleAuthData.status === 'fulfilled' ? googleAuthData.value.created_at : null,
        
        // Sobriety data (prioritize user_profiles over Google Auth)
        bio: sobrietyData.status === 'fulfilled' && sobrietyData.value.bio ? 
              sobrietyData.value.bio : 
              (googleAuthData.status === 'fulfilled' ? googleAuthData.value.bio : 'No bio available'),
        sobrietyDate: sobrietyData.status === 'fulfilled' ? sobrietyData.value.sobriety_date : null,
        sobrietyDays: sobrietyData.status === 'fulfilled' ? sobrietyData.value.days_sober : 0,
        milestones: sobrietyData.status === 'fulfilled' ? sobrietyData.value.milestones : [],
        location: sobrietyData.status === 'fulfilled' ? sobrietyData.value.location : 'Spokane, WA',
        
        // Avatar priority: 1. Profile avatar_url, 2. Google picture, 3. Default
        avatar_url: (sobrietyData.status === 'fulfilled' && sobrietyData.value.avatar_url) ? 
                     sobrietyData.value.avatar_url : 
                     (googleAuthData.status === 'fulfilled' ? googleAuthData.value.avatar : null),
        
        // Forum stats
        posts: forumStats.status === 'fulfilled' ? forumStats.value.posts : 0,
        comments: forumStats.status === 'fulfilled' ? forumStats.value.comments : 0,
        upvotes: forumStats.status === 'fulfilled' ? forumStats.value.upvotes : 0,
        
        // Recent activity
        recentPosts: forumStats.status === 'fulfilled' ? forumStats.value.recent_posts : [],
        recentComments: forumStats.status === 'fulfilled' ? forumStats.value.recent_comments : [],
        achievements: forumStats.status === 'fulfilled' ? forumStats.value.achievements : []
      };

      console.log('🎯 Final merged profile:', profile);

      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null; // Return null instead of throwing error
    }
  }

  /**
   * Get Google Auth user data
   * @param {string} userId - User ID
   * @returns {Object} Google Auth user data
   */
  async getGoogleAuthUser(userId) {
    try {
      const { data: user, error } = await supabase.auth.admin.getUserById(userId);
      
      if (error) {
        console.error('Error fetching Google Auth user:', error);
        return null;
      }

      if (!user || !user.user) {
        console.error('No user data returned from Supabase');
        return null;
      }

      return {
        name: user.user.user_metadata?.full_name || 
              user.user.user_metadata?.name || 
              user.user.email?.split('@')[0] || 
              'Unknown User',
        email: user.user.email || 'No email available',
        avatar: user.user.user_metadata?.avatar_url || 
                user.user.user_metadata?.picture || 
                null,
        bio: user.user.user_metadata?.bio || null,
        created_at: user.user.created_at || null
      };
    } catch (error) {
      console.error('Error in getGoogleAuthUser:', error);
      return null;
    }
  }

  /**
   * Get sobriety data from Dashboard database
   * @param {string} userId - User ID
   * @returns {Object} Sobriety data
   */
  async getSobrietyData(userId) {
    try {
      // Debug: Check what database we're connecting to
      console.log('🔍 Debug - Supabase URL:', process.env.SUPABASE_URL);
      console.log('🔍 Debug - User ID being queried:', userId);
      
      // Query the forum_user_profiles table first (matches frontend)
      let { data: sobrietyData, error } = await supabase
        .from('forum_user_profiles')
        .select('sobriety_date, bio, location, privacy_settings, avatar_url, display_name')
        .eq('user_id', userId)
        .single();

      // If that fails, try the consolidated profiles table
      if (error && error.code !== 'PGRST116') {
        console.log('Trying profiles_consolidated table as fallback...');
        const fallbackResult = await supabase
          .from('profiles_consolidated')
          .select('sobriety_date, bio, location, privacy_settings, avatar_url, display_name')
          .eq('user_id', userId)
          .single();
        
        sobrietyData = fallbackResult.data;
        error = fallbackResult.error;
      }

      // If still no data, try the profiles view
      if (error && error.code !== 'PGRST116') {
        console.log('Trying profiles view as last resort...');
        const lastResortResult = await supabase
          .from('profiles')
          .select('sobriety_date, bio, location, privacy_settings, avatar_url, display_name')
          .eq('user_id', userId)
          .single();
        
        sobrietyData = lastResortResult.data;
        error = lastResortResult.error;
      }

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching sobriety data:', error);
        // Don't return null for database errors, provide fallback data
        return {
          sobriety_date: null,
          days_sober: 0,
          bio: null,
          location: 'Spokane, WA',
          milestones: [],
          privacy_settings: 'public',
          avatar_url: null
        };
      }

      if (!sobrietyData) {
        return {
          sobriety_date: null,
          days_sober: 0,
          bio: null,
          location: 'Spokane, WA',
          milestones: [],
          privacy_settings: 'public',
          avatar_url: null
        };
      }

      // Calculate days sober
      const daysSober = sobrietyData.sobriety_date ? 
        Math.floor((new Date() - new Date(sobrietyData.sobriety_date)) / (1000 * 60 * 60 * 24)) : 0;

      // Get milestones based on days sober
      const milestones = this.calculateMilestones(daysSober);

      return {
        sobriety_date: sobrietyData.sobriety_date,
        days_sober: daysSober,
        bio: sobrietyData.bio,
        location: sobrietyData.location || 'Spokane, WA',
        milestones: milestones,
        privacy_settings: sobrietyData.privacy_settings || 'public',
        avatar_url: sobrietyData.avatar_url || null,
        display_name: sobrietyData.display_name || null
      };
    } catch (error) {
      console.error('Error in getSobrietyData:', error);
      // Provide fallback data on error
      return {
        sobriety_date: null,
        days_sober: 0,
        bio: null,
        location: 'Spokane, WA',
        milestones: [],
        privacy_settings: 'public',
        avatar_url: null
      };
    }
  }

  /**
   * Get forum statistics and recent activity
   * @param {string} userId - User ID
   * @returns {Object} Forum stats and activity
   */
  async getForumStats(userId) {
    try {
      // Get post count
      const { count: posts, error: postsError } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (postsError) {
        console.error('Error fetching post count:', postsError);
      }

      // Get comment count
      const { count: comments, error: commentsError } = await supabase
        .from('forum_comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (commentsError) {
        console.error('Error fetching comment count:', commentsError);
      }

      // Get upvotes received (forum_posts table has upvotes column)
      const { data: postsWithVotes, error: upvotesError } = await supabase
        .from('forum_posts')
        .select('upvotes')
        .eq('user_id', userId);

      let upvotes = 0;
      if (postsWithVotes && !upvotesError) {
        upvotes = postsWithVotes.reduce((total, post) => total + (post.upvotes || 0), 0);
      }

      if (upvotesError) {
        console.error('Error fetching upvotes:', upvotesError);
      }

      // Get recent posts
      const { data: recentPosts, error: recentPostsError } = await supabase
        .from('forum_posts')
        .select('id, title, content, created_at, upvotes')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentPostsError) {
        console.error('Error fetching recent posts:', recentPostsError);
      }

      // Get recent comments
      const { data: recentComments, error: recentCommentsError } = await supabase
        .from('forum_comments')
        .select('id, content, created_at, post_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentCommentsError) {
        console.error('Error fetching recent comments:', recentCommentsError);
      }

      // Get achievements based on activity
      const achievements = this.calculateAchievements(
        posts || 0,
        comments || 0,
        upvotes || 0
      );

      return {
        posts: posts || 0,
        comments: comments || 0,
        upvotes: upvotes || 0,
        recent_posts: recentPosts || [],
        recent_comments: recentComments || [],
        achievements: achievements
      };
    } catch (error) {
      console.error('Error in getForumStats:', error);
      // Provide fallback data on error
      return {
        posts: 0,
        comments: 0,
        upvotes: 0,
        recent_posts: [],
        recent_comments: [],
        achievements: []
      };
    }
  }

  /**
   * Calculate sobriety milestones
   * @param {number} daysSober - Number of days sober
   * @returns {Array} Array of achieved milestones
   */
  calculateMilestones(daysSober) {
    const milestones = [
      { days: 1, name: 'First Day', icon: '🌅' },
      { days: 7, name: 'One Week', icon: '📅' },
      { days: 30, name: 'One Month', icon: '🌙' },
      { days: 90, name: 'Three Months', icon: '🌸' },
      { days: 180, name: 'Six Months', icon: '🌻' },
      { days: 365, name: 'One Year', icon: '🎉' },
      { days: 730, name: 'Two Years', icon: '🏆' },
      { days: 1095, name: 'Three Years', icon: '💎' }
    ];

    return milestones.filter(milestone => daysSober >= milestone.days);
  }

  /**
   * Calculate forum achievements
   * @param {number} posts - Number of posts
   * @param {number} comments - Number of comments
   * @param {number} upvotes - Number of upvotes received
   * @returns {Array} Array of achievements
   */
  calculateAchievements(posts, comments, upvotes) {
    const achievements = [];

    // Post achievements
    if (posts >= 1) achievements.push({ name: 'First Post', icon: '📝', type: 'posts' });
    if (posts >= 10) achievements.push({ name: 'Regular Poster', icon: '📚', type: 'posts' });
    if (posts >= 50) achievements.push({ name: 'Community Leader', icon: '👑', type: 'posts' });

    // Comment achievements
    if (comments >= 1) achievements.push({ name: 'First Comment', icon: '💬', type: 'comments' });
    if (comments >= 25) achievements.push({ name: 'Engaged Member', icon: '🤝', type: 'comments' });
    if (comments >= 100) achievements.push({ name: 'Discussion Master', icon: '🎯', type: 'comments' });

    // Upvote achievements
    if (upvotes >= 10) achievements.push({ name: 'Helpful Member', icon: '👍', type: 'upvotes' });
    if (upvotes >= 50) achievements.push({ name: 'Valued Contributor', icon: '⭐', type: 'upvotes' });
    if (upvotes >= 100) achievements.push({ name: 'Community Favorite', icon: '💖', type: 'upvotes' });

    return achievements;
  }

  /**
   * Update user profile (sobriety date, bio, etc.)
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated profile data
   */
  async updateUserProfile(userId, updateData) {
    try {
      // Try forum_user_profiles first (matches frontend)
      let { data, error } = await supabase
        .from('forum_user_profiles')
        .upsert({
          user_id: userId,
          sobriety_date: updateData.sobriety_date,
          bio: updateData.bio,
          location: updateData.location,
          privacy_settings: updateData.privacy_settings,
          display_name: updateData.display_name,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      // If that fails, try profiles_consolidated
      if (error) {
        console.log('Trying profiles_consolidated table as fallback for update...');
        const fallbackResult = await supabase
          .from('profiles_consolidated')
          .upsert({
            user_id: userId,
            sobriety_date: updateData.sobriety_date,
            bio: updateData.bio,
            location: updateData.location,
            privacy_settings: updateData.privacy_settings,
            display_name: updateData.display_name,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        data = fallbackResult.data;
        error = fallbackResult.error;
      }

      // If still fails, try the profiles view
      if (error) {
        console.log('Trying profiles view as last resort for update...');
        const lastResortResult = await supabase
          .from('profiles')
          .upsert({
            user_id: userId,
            sobriety_date: updateData.sobriety_date,
            bio: updateData.bio,
            location: updateData.location,
            privacy_settings: updateData.privacy_settings,
            display_name: updateData.display_name,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        data = lastResortResult.data;
        error = lastResortResult.error;
      }

      if (error) {
        console.error('Error updating user profile:', error);
        throw new Error('Failed to update profile');
      }

      return data;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      throw error;
    }
  }
}

module.exports = new UserController();
