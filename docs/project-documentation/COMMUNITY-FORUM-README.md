# Community Forum - Get Sober Spokane

## Overview

The Community Forum is a comprehensive platform designed to connect recovery community members in Spokane, WA. It provides a safe, supportive environment for sharing experiences, asking questions, and celebrating milestones together.

## Features

### 🏠 Forum Homepage
- **Main Forum Listing**: Browse all community discussions organized by categories
- **Category Navigation**: Easy access to different discussion areas
- **Search & Filtering**: Find specific topics, users, or content quickly
- **Real-time Statistics**: View community activity and engagement metrics

### 💬 Discussion Threads
- **Post Creation**: Create new discussion topics with rich text formatting
- **Category Selection**: Choose from predefined recovery-focused categories
- **Tag System**: Add relevant tags to help others find your posts
- **Anonymous Posting**: Option to post anonymously for sensitive topics

### 👤 User Profiles
- **Sobriety Counter**: Display your current sobriety days prominently
- **Recovery Milestones**: Track and share your recovery achievements
- **Activity History**: View your posts, comments, and community contributions
- **Privacy Settings**: Control who can see your profile information

### ⭐ Success Stories Section
- **Dedicated Area**: Special section for celebrating recovery milestones
- **Category-based Organization**: Stories organized by recovery stage
- **Featured Stories**: Highlighted success stories for community inspiration
- **Milestone Sharing**: Share specific achievements and what helped you succeed

### 🔄 Real-time Updates
- **Live Notifications**: Get notified of responses and community activity
- **Activity Feed**: See recent community activity and engagement
- **Upvote/Downvote System**: Community-driven content quality control
- **Comment Threads**: Engage in meaningful discussions

### 🛡️ Moderation Tools
- **Content Reporting**: Report inappropriate or concerning content
- **Community Guidelines**: Clear rules for respectful participation
- **Admin Controls**: Basic content moderation capabilities
- **User Management**: Tools for managing community members

### 🔍 Search & Filtering
- **Advanced Search**: Find posts by title, content, or tags
- **Category Filters**: Browse specific discussion areas
- **Sort Options**: Sort by newest, oldest, most voted, or most commented
- **Tag-based Navigation**: Discover content through relevant tags

## Categories

The forum is organized into the following categories:

1. **General Discussion** - General topics and conversations about recovery
2. **Recovery Support** - Support and encouragement for recovery journey
3. **Treatment & Resources** - Information about treatment options and resources
4. **Family & Friends** - Support for family members and friends
5. **Mental Health** - Mental health discussions and support
6. **Employment & Housing** - Job and housing support for recovery
7. **Sober Activities** - Fun activities and events for sober living
8. **Success Stories** - Celebrating recovery milestones and achievements

## Getting Started

### For New Users
1. **Sign Up**: Create an account using your email or Google account
2. **Complete Profile**: Add your display name, bio, and sobriety date
3. **Browse Categories**: Explore different discussion areas
4. **Introduce Yourself**: Post in the General Discussion category
5. **Engage**: Comment on posts and start conversations

### For Returning Users
1. **Check Activity**: Review recent posts and comments
2. **Update Profile**: Keep your sobriety counter and milestones current
3. **Share Progress**: Post updates about your recovery journey
4. **Support Others**: Comment on posts and offer encouragement

## Community Guidelines

### Be Supportive
- Offer encouragement and positive reinforcement
- Share your experiences to help others
- Be patient with those in early recovery

### Be Respectful
- Treat all members with kindness and respect
- Avoid judgmental language or criticism
- Respect different recovery paths and approaches

### Be Safe
- Don't share specific medical advice
- Report concerning content immediately
- Protect your privacy and others' privacy

### Be Authentic
- Share honest experiences and challenges
- Focus on hope and recovery
- Avoid promoting specific treatment methods

## Technical Features

### Authentication
- **Supabase Integration**: Secure user authentication and data storage
- **Google OAuth**: Easy sign-in with Google accounts
- **Session Management**: Persistent login across browser sessions

### Data Security
- **Row Level Security**: Database-level data protection
- **User Privacy Controls**: Granular privacy settings
- **Secure API Endpoints**: Protected data access

### Performance
- **Pagination**: Efficient loading of large content
- **Caching**: Optimized data retrieval
- **Responsive Design**: Works on all devices and screen sizes

## Database Schema

The forum uses the following main tables:

- **forum_posts**: Main discussion posts
- **forum_comments**: Comments on posts
- **forum_user_profiles**: Extended user information
- **forum_categories**: Discussion categories
- **forum_user_achievements**: User milestones and achievements
- **forum_user_follows**: User following relationships
- **forum_post_reports**: Content moderation reports

## File Structure

```
src/
├── pug/
│   ├── community-forum.pug          # Main forum page
│   ├── user-profile.pug             # User profile page
│   └── success-stories.pug          # Success stories page
├── js/
│   ├── community-forum-enhanced.js  # Enhanced forum functionality
│   └── community-forum.js           # Basic forum functionality
└── scss/
    └── components/
        └── _forum.scss              # Forum styling
```

## Setup Instructions

### 1. Database Setup
Run the SQL commands in `forum-database-setup.sql` in your Supabase project:

```bash
# Copy the SQL content and run it in your Supabase SQL editor
```

### 2. Build the Pug Templates
The Pug templates need to be compiled to HTML:

```bash
npm run build-pug
```

### 3. Compile SCSS
Compile the SCSS styles:

```bash
npm run build-scss
```

### 4. Update Navigation
Ensure the forum links are properly configured in your navigation.

## Usage Examples

### Creating a Post
1. Click "New Post" button
2. Fill in title, category, and content
3. Add relevant tags
4. Choose posting options (anonymous, featured)
5. Submit and share with the community

### Sharing a Success Story
1. Navigate to Success Stories section
2. Click "Share My Story"
3. Select your recovery stage
4. Describe your milestone and journey
5. Allow featuring if desired

### Managing Your Profile
1. Click on your profile or username
2. Edit display name, bio, and location
3. Update sobriety date
4. Adjust privacy settings
5. View your activity and achievements

## Troubleshooting

### Common Issues

**Can't create posts?**
- Ensure you're signed in
- Check that your account is verified
- Try refreshing the page

**Posts not loading?**
- Check your internet connection
- Verify Supabase credentials are correct
- Check browser console for errors

**Profile not updating?**
- Ensure you have proper permissions
- Check that required fields are filled
- Try logging out and back in

### Getting Help

- **Technical Issues**: Check the browser console for error messages
- **Account Problems**: Contact support through the main website
- **Content Concerns**: Use the report function for inappropriate content

## Future Enhancements

### Planned Features
- **Real-time Chat**: Live messaging between community members
- **Event Calendar**: Community events and meeting schedules
- **Resource Library**: Shared documents and helpful resources
- **Mobile App**: Native mobile application for better access
- **Advanced Moderation**: AI-powered content filtering

### Community Requests
- **Video Sharing**: Share recovery journey videos
- **Group Chats**: Private group discussions
- **Achievement Badges**: Gamification of recovery milestones
- **Integration**: Connect with other recovery apps and services

## Contributing

### Community Moderation
- Report inappropriate content
- Help new members feel welcome
- Share positive experiences and encouragement
- Follow community guidelines

### Feature Requests
- Suggest new features through the feedback system
- Participate in community discussions about improvements
- Share ideas for better community engagement

## Support

For technical support or questions about the community forum:

- **Email**: support@soberspokane.org
- **Website**: https://soberspokane.org/contact
- **Community**: Ask questions in the forum's General Discussion

---

**Remember**: This community is built on the foundation of mutual support, respect, and hope. Every post, comment, and interaction contributes to creating a safe space for recovery and growth.

*Together, we're stronger in recovery.* 💙
