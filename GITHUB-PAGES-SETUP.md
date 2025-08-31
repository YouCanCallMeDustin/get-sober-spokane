# GitHub Pages Setup Guide

## Overview
This repository is configured to automatically deploy to GitHub Pages using GitHub Actions. The site will be built from the `docs/` directory.

## Prerequisites
- GitHub repository with your project
- GitHub Pages enabled on your repository

## Setup Steps

### 1. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **GitHub Actions**

### 2. Repository Settings
- **Branch**: `main` (or your default branch)
- **Folder**: `/docs` (this is where your built files are located)

### 3. Automatic Deployment
The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that will:
- Automatically build your project when you push to `main`
- Deploy the built files to GitHub Pages
- Update the site automatically

## File Structure for GitHub Pages
```
docs/
├── index.html              # Home page
├── css/
│   └── styles.css         # Compiled CSS
├── js/
│   ├── config.js          # Configuration
│   ├── auth.js            # Authentication
│   └── scripts.js         # Main scripts
├── assets/
│   └── img/               # Images and media
└── [other HTML pages]
```

## Local Development

### Build the Project
```bash
# Install dependencies
npm install

# Build for production
npm run build:full

# Or build individual components
npm run build:scss      # Compile SCSS to CSS
npm run build:assets    # Copy assets
npm run build:pug       # Compile Pug templates
```

### Development Server
```bash
# Start development server
npm run start

# Start with auto-refresh
npm run dev:refresh
```

## Deployment Process

### Automatic (Recommended)
1. Make changes to your source files (Pug templates, SCSS, etc.)
2. Run `npm run build:full` locally to test
3. Commit and push to `main` branch
4. GitHub Actions automatically builds and deploys

### Manual
1. Run `npm run build:full`
2. Commit the updated `docs/` folder
3. Push to GitHub
4. GitHub Pages will serve the updated files

## Troubleshooting

### Common Issues

#### CSS/JS Not Loading
- Ensure all paths in HTML files are relative (not absolute)
- Check that files exist in the `docs/` directory
- Verify the build process completed successfully

#### Images Not Displaying
- Ensure image paths are relative: `assets/img/logo.png`
- Check that images were copied to `docs/assets/img/`

#### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires Node 18+)
- Review build script output for specific errors

### Build Verification
After building, verify these files exist:
- `docs/css/styles.css` (compiled CSS)
- `docs/js/` (JavaScript files)
- `docs/assets/` (images and media)
- `docs/*.html` (HTML pages)

## Custom Domain (Optional)
If you want to use a custom domain:
1. Add your domain to GitHub Pages settings
2. Update your DNS records
3. The site will be available at your custom domain

## Performance Tips
- Images are automatically optimized to WebP format
- CSS is minified and autoprefixed
- JavaScript files are optimized for production
- SEO optimization is included in the build process

## Support
If you encounter issues:
1. Check the GitHub Actions logs
2. Verify the build process works locally
3. Ensure all file paths are relative
4. Check that the `docs/` directory contains all necessary files
