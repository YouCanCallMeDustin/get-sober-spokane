# Centralized Metadata System for Get Sober Spokane

## Overview

This document describes the centralized metadata system implemented for the Get Sober Spokane website. The system provides dynamic, user-personalized metadata for improved SEO and social media sharing while maintaining consistency across all pages.

## Architecture

### Core Components

1. **Metadata Injection Middleware** (`middleware/metaDataInjector.js`)
   - Automatically populates `res.locals.meta` with dynamic metadata
   - Provides helper functions for template access
   - Handles user profile integration

2. **Page Metadata Generator** (`middleware/pageMetaGenerator.js`)
   - Centralized configuration for all page metadata
   - Supports dynamic metadata based on user profiles
   - Provides fallback defaults for all pages

3. **Updated Layout Template** (`src/pug/layout.pug`)
   - Uses centralized metadata from `res.locals.meta`
   - Includes all necessary meta tags (Open Graph, Twitter Cards, SEO)
   - Supports dynamic content from user profiles

## How It Works

### 1. Middleware Initialization

The `metaDataInjector` middleware runs on every request and:

```javascript
// Automatically populates metadata
res.locals.meta = generateUserMeta(user);

// Provides helper functions
res.locals.getMeta = (key, fallback) => { /* ... */ };
res.locals.getUserMeta = (key, fallback) => { /* ... */ };
res.locals.setPageMeta = (pageMeta) => { /* ... */ };
```

### 2. Page-Specific Metadata

Each page can set its specific metadata using:

```javascript
// In routes
res.locals.setPageMeta(generatePageMeta('pageKey', user));

// Or in Pug templates
- res.locals.setPageMeta(generatePageMeta('pageKey', user))
```

### 3. Template Usage

Templates access metadata using helper functions:

```pug
// In layout.pug
title= getMeta('page.title') || "Get Sober Spokane"
meta(name="description" content=getMeta('page.description'))
meta(property="og:title" content=getMeta('page.title'))
```

## User Profile Integration

### Personalized Metadata

When a user is logged in, metadata is automatically personalized:

- **Title**: Includes user's name (e.g., "Dashboard - John Smith")
- **Description**: Mentions user's sobriety journey (e.g., "John Smith has been sober for 45 days")
- **Keywords**: Includes user-specific terms
- **Open Graph**: Uses user's avatar and profile information

### User Data Sources

The system integrates data from:
- Google Auth user profiles
- Sobriety tracking data
- Forum activity statistics
- User milestones and achievements

## Page Metadata Configurations

### Available Page Types

```javascript
const pageMetaConfigs = {
  home: { /* Home page metadata */ },
  dashboard: { /* Dashboard metadata */ },
  forum: { /* Community forum metadata */ },
  resourceDirectory: { /* Resource directory metadata */ },
  successStories: { /* Success stories metadata */ },
  userProfile: (user) => { /* Dynamic user profile metadata */ },
  userProfileEdit: { /* Profile edit metadata */ },
  addictionTreatments: { /* Treatment centers metadata */ },
  medicalMentalHealth: { /* Medical services metadata */ },
  shelterHousing: { /* Housing resources metadata */ },
  foodBasicNeeds: { /* Food banks metadata */ },
  employmentSkills: { /* Employment resources metadata */ },
  communityActivities: { /* Sober activities metadata */ },
  map: { /* Recovery map metadata */ },
  donations: { /* Donations page metadata */ },
  privacyPolicy: { /* Privacy policy metadata */ },
  termsOfService: { /* Terms of service metadata */ },
  error: { /* Error page metadata */ },
  notFound: { /* 404 page metadata */ }
};
```

### Dynamic Metadata Functions

Some pages use functions for dynamic metadata:

```javascript
userProfile: (user) => ({
  title: `${user?.name || 'User'} - Profile`,
  description: `View ${user?.name || 'community member'}'s recovery journey...`,
  image: user?.avatar || '/assets/img/logo.png'
})
```

## Implementation Examples

### Route Implementation

```javascript
// In routes/user.js
router.get('/:id', async (req, res) => {
  const userProfile = await userController.getUserProfile(id);
  
  // Set page-specific metadata
  const pageMeta = generatePageMeta('userProfile', userProfile);
  res.locals.setPageMeta(pageMeta);
  
  res.render('user-profile', { user: userProfile });
});
```

### Template Implementation

```pug
// In any Pug template
extends layout

block head
  - res.locals.setPageMeta(generatePageMeta('dashboard', user))

block content
  // Page content here
```

### Layout Template

```pug
// In layout.pug
doctype html
html(lang="en")
  head
    meta(charset="utf-8")
    meta(name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no")
    
    // Primary Meta Tags
    title= getMeta('page.title') || "Get Sober Spokane"
    meta(name="description" content=getMeta('page.description'))
    meta(name="keywords" content=getMeta('page.keywords'))
    
    // Open Graph / Facebook
    meta(property="og:type" content=getMeta('page.type'))
    meta(property="og:title" content=getMeta('page.title'))
    meta(property="og:description" content=getMeta('page.description'))
    meta(property="og:image" content=getMeta('site.url') + getMeta('page.image'))
    
    // Twitter Cards
    meta(name="twitter:card" content="summary_large_image")
    meta(name="twitter:title" content=getMeta('page.title'))
    meta(name="twitter:description" content=getMeta('page.description'))
    meta(name="twitter:image" content=getMeta('site.url') + getMeta('page.image'))
```

## Benefits

### 1. SEO Improvements
- **Consistent metadata** across all pages
- **Dynamic keywords** based on user profiles
- **Personalized descriptions** for better engagement
- **Proper Open Graph** and Twitter Card implementation

### 2. User Experience
- **Personalized titles** show user's name when logged in
- **Relevant descriptions** mention user's recovery journey
- **Dynamic content** based on user's sobriety milestones

### 3. Maintainability
- **Centralized configuration** - all metadata in one place
- **Easy updates** - change metadata without touching templates
- **Consistent structure** - standardized metadata format
- **Scalable** - easy to add new pages and metadata types

### 4. Social Media Optimization
- **Rich social sharing** with proper Open Graph tags
- **User-specific images** when available
- **Engaging descriptions** that mention user achievements

## Migration Guide

### For Existing Templates

1. **Remove hardcoded metadata**:
   ```pug
   // Remove this
   title My Page Title
   meta(name="description" content="My description")
   ```

2. **Add metadata block**:
   ```pug
   extends layout
   
   block head
     - res.locals.setPageMeta(generatePageMeta('pageKey', user))
   ```

3. **Update routes** to pass user data:
   ```javascript
   res.render('template', { user: req.session?.user || null });
   ```

### For New Templates

1. **Extend the layout**:
   ```pug
   extends layout
   ```

2. **Set page metadata**:
   ```pug
   block head
     - res.locals.setPageMeta(generatePageMeta('pageKey', user))
   ```

3. **Add content**:
   ```pug
   block content
     // Your page content here
   ```

## Configuration

### Adding New Page Types

1. **Add to pageMetaConfigs** in `middleware/pageMetaGenerator.js`:
   ```javascript
   newPageType: {
     title: 'New Page Title',
     description: 'Page description',
     keywords: 'relevant, keywords, here',
     type: 'website'
   }
   ```

2. **Use in templates**:
   ```pug
   - res.locals.setPageMeta(generatePageMeta('newPageType', user))
   ```

### Customizing Default Metadata

Edit the `defaultMeta` object in `middleware/metaDataInjector.js`:

```javascript
const defaultMeta = {
  site: {
    name: 'Get Sober Spokane',
    url: 'https://getsoberspokane.org',
    // ... other site defaults
  },
  page: {
    title: 'Get Sober Spokane',
    description: 'Recovery support community in Spokane, WA',
    // ... other page defaults
  }
};
```

## Testing

### Verify Metadata Generation

1. **Check page source** for proper meta tags
2. **Test social sharing** with Facebook/Twitter debuggers
3. **Verify user personalization** when logged in
4. **Check SEO tools** for metadata consistency

### Debug Helper

Add this to any template for debugging:

```pug
block head
  - console.log('Metadata:', res.locals.meta)
  - res.locals.setPageMeta(generatePageMeta('pageKey', user))
```

## Troubleshooting

### Common Issues

1. **Metadata not updating**: Ensure `setPageMeta` is called before rendering
2. **User data missing**: Check that user object is passed to template
3. **Helper functions undefined**: Verify middleware is loaded in server.js
4. **Page not found**: Add page type to `pageMetaConfigs`

### Debug Steps

1. Check browser console for errors
2. Verify middleware is loaded in correct order
3. Test with and without user authentication
4. Validate metadata in social media debuggers

## Future Enhancements

### Planned Features

1. **A/B Testing**: Different metadata for different user segments
2. **Analytics Integration**: Track metadata performance
3. **Dynamic Images**: Generate custom Open Graph images
4. **Localization**: Support for multiple languages
5. **Schema.org**: Enhanced structured data markup

### Performance Optimizations

1. **Caching**: Cache generated metadata for anonymous users
2. **Lazy Loading**: Load user-specific metadata on demand
3. **CDN Integration**: Serve metadata from edge locations

---

This centralized metadata system provides a robust, scalable foundation for SEO and social media optimization while maintaining excellent user experience through personalization.
