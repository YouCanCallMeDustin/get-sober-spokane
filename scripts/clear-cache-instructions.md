# Browser Cache Clearing Instructions

## The Issue
Your browser is still showing the old form questions because it's using a cached version of the HTML and JavaScript files.

## Solution: Force Browser Cache Refresh

### Method 1: Hard Refresh (Recommended)
**Chrome/Edge:** Press `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)
**Firefox:** Press `Ctrl + F5` (or `Cmd + Shift + R` on Mac)

### Method 2: Developer Tools
1. Open Developer Tools (`F12`)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Method 3: Clear All Browser Data
1. Press `Ctrl + Shift + Delete` (or `Cmd + Shift + Delete` on Mac)
2. Select "All time" for time range
3. Check "Cached images and files"
4. Click "Clear data"

### Method 4: Incognito/Private Mode
1. Open a new incognito/private window
2. Navigate to `localhost:3000/sponsor-finder.html`
3. This will load fresh files without cache

## What Should Happen After Cache Clear
- The form should show: "Your experience as a sponsor:" instead of "Current challenges or needs:"
- The form should show: "What kind of support can you offer?" instead of "What kind of support are you looking for?"
- Form submission should work without errors

## Verification
After clearing cache, you should see the new timestamp in the page source:
`<script src="/js/sponsor-finder.js?v=1756691269000"></script>`
