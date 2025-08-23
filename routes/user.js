const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { profileUpdateLimiter, profileViewLimiter } = require('../middleware/rateLimiter');

/**
 * Authentication Middleware
 * Ensures user is logged in before accessing protected routes
 */
const requireAuth = (req, res, next) => {
  if (req.session.user && req.session.user.id) {
    next();
  } else {
    // Redirect to login with return URL
    const returnUrl = req.originalUrl;
    res.redirect(`/login?returnTo=${encodeURIComponent(returnUrl)}`);
  }
};

/**
 * Profile Ownership Middleware
 * Ensures user can only access their own profile for sensitive operations
 */
const requireProfileOwnership = (req, res, next) => {
  const { id } = req.params;
  if (req.session.user && req.session.user.id === id) {
    next();
  } else {
    res.status(403).render('error', {
      title: 'Access Denied',
      error: 'You can only access your own profile for this operation',
      currentUser: req.session.user || null
    });
  }
};

/**
 * User Routes
 */

/**
 * GET /user/:id - Get user profile by ID
 * Fetches and merges data from Google Auth, Dashboard DB, and Forum DB
 * Public route - anyone can view profiles, but authentication provides additional features
 */
router.get('/:id', profileViewLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get the merged user profile data
    const userProfile = await userController.getUserProfile(id);
    
    // Debug logging for authentication
    console.log('🔍 Debug - Session info:', {
      hasSession: !!req.session.user,
      sessionUserId: req.session.user?.id,
      profileUserId: id,
      isOwnProfile: req.session.user && req.session.user.id === id
    });

    // Render the user profile template with the data
    res.render('user-profile', {
      title: `${userProfile.name} - User Profile`,
      user: userProfile,
      isOwnProfile: req.session.user && req.session.user.id === id,
      currentUser: req.session.user || null
    });

  } catch (error) {
    console.error('Error in GET /user/:id:', error);
    
    // If it's a template rendering error, show a user-friendly error page
    if (error.message.includes('Failed to fetch user profile')) {
      return res.status(404).render('user-profile', {
        title: 'User Not Found',
        user: null,
        error: 'User profile not found or unavailable',
        isOwnProfile: false,
        currentUser: req.session.user || null
      });
    }
    
    res.status(500).render('user-profile', {
      title: 'Error - User Profile',
      user: null,
      error: 'An error occurred while loading the user profile',
      isOwnProfile: false,
      currentUser: req.session.user || null
    });
  }
});

/**
 * GET /user/:id/edit - Show edit profile form
 * TEMPORARILY DISABLED AUTH for demonstration
 */
router.get('/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current user profile data
    const userProfile = await userController.getUserProfile(id);
    
    res.render('user-profile-edit', {
      title: 'Edit Profile',
      user: userProfile,
      currentUser: req.session.user
    });

  } catch (error) {
    console.error('Error in GET /user/:id/edit:', error);
    res.status(500).json({ error: 'Failed to load edit profile form' });
  }
});

/**
 * POST /user/:id/edit - Update user profile
 * TEMPORARILY DISABLED AUTH for demonstration
 */
router.post('/:id/edit', profileUpdateLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const { sobriety_date, bio, location, privacy_settings } = req.body;
    
    // Validate required fields
    if (!sobriety_date) {
      return res.status(400).json({ error: 'Sobriety date is required' });
    }

    // Validate sobriety date is not in the future
    const sobrietyDate = new Date(sobriety_date);
    const today = new Date();
    if (sobrietyDate > today) {
      return res.status(400).json({ error: 'Sobriety date cannot be in the future' });
    }

    // Validate bio length
    if (bio && bio.length > 500) {
      return res.status(400).json({ error: 'Bio must be 500 characters or less' });
    }

    // Validate location length
    if (location && location.length > 100) {
      return res.status(400).json({ error: 'Location must be 100 characters or less' });
    }

    // Validate privacy settings
    const validPrivacySettings = ['public', 'community', 'private'];
    if (privacy_settings && !validPrivacySettings.includes(privacy_settings)) {
      return res.status(400).json({ error: 'Invalid privacy setting' });
    }

    // Update the user profile
    const updateData = {
      sobriety_date,
      bio: bio || null,
      location: location || 'Spokane, WA',
      privacy_settings: privacy_settings || 'public'
    };

    await userController.updateUserProfile(id, updateData);

    // Redirect back to the user profile with success message
    res.redirect(`/user/${id}?success=Profile updated successfully`);

  } catch (error) {
    console.error('Error in POST /user/:id/edit:', error);
    
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }
    
    // For non-AJAX requests, redirect with error
    res.redirect(`/user/${req.params.id}/edit?error=Failed to update profile`);
  }
});

/**
 * GET /user/:id/activity - Get user activity data (AJAX endpoint)
 */
router.get('/:id/activity', async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'posts', limit = 10 } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get user profile to access activity data
    const userProfile = await userController.getUserProfile(id);
    
    let activityData = [];
    
    switch (type) {
      case 'posts':
        activityData = userProfile.recentPosts || [];
        break;
      case 'comments':
        activityData = userProfile.recentComments || [];
        break;
      case 'achievements':
        activityData = userProfile.achievements || [];
        break;
      default:
        return res.status(400).json({ error: 'Invalid activity type' });
    }

    res.json({
      success: true,
      data: activityData.slice(0, parseInt(limit)),
      total: activityData.length
    });

  } catch (error) {
    console.error('Error in GET /user/:id/activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity data' });
  }
});

/**
 * GET /user/:id/stats - Get user statistics (AJAX endpoint)
 */
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get user profile to access stats
    const userProfile = await userController.getUserProfile(id);
    
    res.json({
      success: true,
      stats: {
        posts: userProfile.posts,
        comments: userProfile.comments,
        upvotes: userProfile.upvotes,
        sobrietyDays: userProfile.sobrietyDays,
        milestones: userProfile.milestones
      }
    });

  } catch (error) {
    console.error('Error in GET /user/:id/stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

module.exports = router;
