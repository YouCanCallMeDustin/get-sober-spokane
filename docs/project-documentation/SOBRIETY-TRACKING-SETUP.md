# Sobriety Tracking Setup Guide for Get Sober Spokane

This guide will walk you through setting up the enhanced sobriety tracking features for your community forum.

## 🚀 Quick Start

1. **Run the database migration** (see Database Setup below)
2. **Restart your server** to load the new API routes
3. **Test the setup** using the provided test script
4. **Access the new features** at `/profile` and through the forum

## 📊 Database Setup

### Step 1: Run the Migration

Execute the SQL migration in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of sobriety-tracking-schema.sql
-- This will create all necessary tables and functions
```

### Step 2: Verify Tables Created

The migration creates these new tables:
- `sobriety_checkins` - Daily check-in tracking
- `achievements` - Milestone definitions
- `user_achievements` - User achievement tracking

And adds columns to existing `profiles` table:
- `sobriety_start_date` - When user started sobriety
- `last_checkin` - Last daily check-in
- `current_streak` - Current check-in streak
- `longest_streak` - Longest streak achieved
- `bio` - User biography

## 🔧 Server Setup

### New API Routes Added

Your server now includes these new endpoints:

- `GET /api/user/profile/:userId` - Get user profile with sobriety data
- `PUT /api/user/profile` - Update user profile (sobriety date, bio)
- `POST /api/sobriety/checkin` - Daily check-in
- `GET /api/sobriety/checkins` - Get user's check-in history
- `GET /api/forum/posts` - Enhanced forum posts with sobriety info
- `GET /api/forum/stats` - Dynamic forum statistics
- `GET /profile/:userId?` - User profile page route

### Authentication Required

Most new endpoints require authentication. Users must be logged in to:
- Update their profile
- Perform daily check-ins
- View their check-in history

## 🎯 New Features

### 1. Sobriety Tracking

- **Daily Check-ins**: Users can check in daily with mood ratings and notes
- **Sober Days Counter**: Automatically calculates days since sobriety start
- **Streak Tracking**: Monitors daily check-in consistency

### 2. Achievement System

- **Bronze** 🥉 - 30 days sober
- **Silver** 🥈 - 90 days sober  
- **Gold** 🥇 - 180 days sober
- **Platinum** 💎 - 365 days sober
- **Diamond** 💎 - 1000 days sober

### 3. Enhanced User Profiles

- Sobriety badge with current achievement
- Progress bar to next milestone
- Check-in history and statistics
- Bio and personal information

### 4. Forum Improvements

- Usernames show sober days and achievements
- New categories: Success Stories, Challenges, Support
- Dynamic statistics from database
- Notification bell for new replies

## 🧪 Testing

### Run the Test Script

```bash
node test-sobriety-setup.js
```

This will verify:
- Database tables exist
- API functions work
- Data can be queried

### Manual Testing

1. **Visit `/profile`** - Should show your profile page
2. **Try daily check-in** - Click "Check In Today" button
3. **Update profile** - Set sobriety start date and bio
4. **View achievements** - Check progress to next milestone

## 📱 Frontend Integration

### New JavaScript Files

- `src/js/sobriety-utils.js` - Utility functions for date calculations
- `src/js/user-profile.js` - Profile page functionality

### PUG Templates Updated

- `src/pug/user-profile.pug` - Enhanced with sobriety features
- `src/pug/community-forum.pug` - New categories and improved structure
- `src/pug/layout.pug` - Added notification bell

### CSS Classes Added

The new features use Bootstrap classes and custom styling:
- `.sobriety-badge` - Main sobriety display
- `.achievement-progress` - Progress bar styling
- `.checkin-status` - Check-in status indicators

## 🔒 Security Features

### Row Level Security (RLS)

All new tables have RLS policies:
- Users can only view/edit their own data
- Achievements are read-only for all authenticated users
- Check-ins are private to each user

### Input Validation

- Sobriety dates validated (can't be in future)
- Mood ratings limited to 1-10 scale
- SQL injection protection via Supabase

## 📈 Performance Considerations

### Database Indexes

Created indexes for:
- `sobriety_checkins(user_id, checkin_date)`
- `profiles(sobriety_start_date)`
- `user_achievements(user_id)`

### Caching Strategy

- Profile data cached in session
- Achievement calculations done server-side
- Minimal client-side data processing

## 🚨 Troubleshooting

### Common Issues

1. **"Table doesn't exist" errors**
   - Run the migration SQL again
   - Check Supabase permissions

2. **API endpoints return 404**
   - Restart your server
   - Verify routes are added to server.js

3. **Check-ins not working**
   - Ensure user is authenticated
   - Check browser console for errors

4. **Achievements not showing**
   - Verify `check_and_award_achievements` function exists
   - Check user has sobriety start date set

### Debug Mode

Enable detailed logging in your server:

```javascript
// Add to server.js for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

## 🔄 Future Enhancements

### Planned Features

- **Push notifications** for daily check-ins
- **Social features** - share achievements, support friends
- **Analytics dashboard** - sobriety trends and insights
- **Mobile app** - native check-in experience
- **Integration** with recovery apps and wearables

### Customization Options

- **Achievement thresholds** - Adjust milestone days
- **Check-in reminders** - Email/SMS notifications
- **Privacy levels** - Control who sees sobriety info
- **Theme options** - Light/dark mode for profiles

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review server logs for error messages
3. Verify database permissions and RLS policies
4. Test individual API endpoints with Postman/curl

## 🎉 Success!

Once setup is complete, your users will have:
- ✅ Daily sobriety tracking
- ✅ Achievement milestones
- ✅ Enhanced community engagement
- ✅ Progress visualization
- ✅ Supportive check-in system

Your "Get Sober Spokane" community will be more engaging and supportive than ever!
