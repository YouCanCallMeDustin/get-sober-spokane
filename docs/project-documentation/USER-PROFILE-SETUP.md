# User Profile System Setup

This document describes the modular user profile system for the Sober Spokane Express.js + PUG application.

## Overview

The user profile system provides:
- **Route**: `/user/:id` - View user profiles
- **Edit Route**: `/user/:id/edit` - Edit profile information
- **API Endpoints**: Activity and stats data
- **Server-side Rendering**: PUG templates with merged data

## Architecture

### Files Created

1. **`controllers/userController.js`** - Data fetching and merging logic
2. **`routes/user.js`** - Express routes for user profiles
3. **`src/pug/user-profile-edit.pug`** - Edit profile template
4. **Updated `src/pug/user-profile.pug`** - Main profile template
5. **Updated `src/scss/components/_forum.scss`** - Profile styling
6. **Updated `server.js`** - Added user routes

### Data Sources

The system merges data from three sources:

1. **Google Auth** (via Supabase)
   - Name, email, avatar
   - Account creation date
   - User metadata

2. **Dashboard Database** (`user_profiles` table)
   - Sobriety date
   - Bio
   - Location
   - Privacy settings

3. **Forum Database**
   - Post count
   - Comment count
   - Upvotes received
   - Recent activity
   - Achievements

## Database Schema

### Required Tables

```sql
-- User profiles table (Dashboard DB)
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sobriety_date DATE,
  bio TEXT,
  location VARCHAR(100) DEFAULT 'Spokane, WA',
  privacy_settings VARCHAR(20) DEFAULT 'public',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  upvotes INTEGER DEFAULT 0
);

-- Forum comments table
CREATE TABLE IF NOT EXISTS forum_comments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum votes table
CREATE TABLE IF NOT EXISTS forum_votes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Environment Variables

Ensure these are set in your `.env` file:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SESSION_SECRET=your_session_secret
```

## Usage

### View User Profile

```
GET /user/:id
```

Example: `/user/123e4567-e89b-12d3-a456-426614174000`

### Edit User Profile

```
GET /user/:id/edit
POST /user/:id/edit
```

### API Endpoints

```
GET /user/:id/activity?type=posts&limit=10
GET /user/:id/stats
```

## Features

### Profile Display
- Avatar with fallback
- Name, email, bio
- Sobriety counter (days sober)
- Recovery milestones
- Community stats (posts, comments, upvotes)
- Recent activity tabs
- Achievements system

### Edit Profile
- Sobriety date (required)
- Bio (optional)
- Location (optional)
- Privacy settings
- Form validation
- Character counters

### Error Handling
- Graceful fallbacks for missing data
- User-friendly error messages
- Non-breaking data display
- Comprehensive logging

### Responsive Design
- Mobile-first approach
- Bootstrap 5 integration
- Custom SCSS styling
- Accessibility features

## Security

- Authentication required for profile editing
- Users can only edit their own profiles
- Input validation and sanitization
- CSRF protection via form tokens
- Privacy settings control

## Customization

### Adding New Fields

1. Update the database schema
2. Modify `userController.js` methods
3. Update PUG templates
4. Add form handling in routes
5. Update SCSS styling

### Modifying Milestones

Edit the `calculateMilestones()` method in `userController.js`:

```javascript
calculateMilestones(daysSober) {
  const milestones = [
    { days: 1, name: 'First Day', icon: '🌅' },
    { days: 7, name: 'One Week', icon: '📅' },
    // Add your custom milestones here
  ];
  
  return milestones.filter(milestone => daysSober >= milestone.days);
}
```

### Custom Achievements

Modify the `calculateAchievements()` method:

```javascript
calculateAchievements(posts, comments, upvotes) {
  const achievements = [];
  
  // Add your custom achievement logic
  if (posts >= 100) {
    achievements.push({ name: 'Century Poster', icon: '🏆', type: 'posts' });
  }
  
  return achievements;
}
```

## Testing

### Manual Testing

1. Start the server: `npm start`
2. Navigate to `/user/[valid-user-id]`
3. Test edit functionality
4. Verify data display
5. Check responsive design

### Error Scenarios

- Invalid user ID
- Missing database tables
- Network errors
- Authentication failures
- Missing user data

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Check `.env` file
   - Verify variable names

2. **"User profile not found"**
   - Check user ID format
   - Verify database tables exist
   - Check Supabase permissions

3. **Styling not applied**
   - Run `npm run build:scss`
   - Check CSS file paths
   - Verify Bootstrap integration

4. **Form submission errors**
   - Check form action URL
   - Verify CSRF tokens
   - Check server logs

### Debug Mode

Enable detailed logging in `userController.js`:

```javascript
// Add at the top of methods
console.log('Debug:', { userId, method: 'getUserProfile' });
```

## Performance

### Optimization Tips

1. **Database Indexing**
   ```sql
   CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
   CREATE INDEX idx_forum_posts_user_id ON forum_posts(user_id);
   CREATE INDEX idx_forum_comments_user_id ON forum_comments(user_id);
   ```

2. **Caching**
   - Consider Redis for session storage
   - Implement profile data caching
   - Cache achievement calculations

3. **Lazy Loading**
   - Load activity data on demand
   - Implement pagination for large datasets
   - Use AJAX for dynamic content

## Future Enhancements

- Profile picture upload
- Social connections (followers/following)
- Privacy controls per field
- Activity feed pagination
- Real-time notifications
- Profile verification badges
- Recovery journey timeline
- Community challenges
- Anonymous posting options

## Support

For issues or questions:
1. Check server logs
2. Verify database connectivity
3. Test with minimal data
4. Review authentication flow
5. Check browser console errors
