#!/usr/bin/env node

/**
 * Force Refresh Script
 * Clears cache and forces a complete reload of the application
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Force Refresh Script Starting...');

// Update timestamp file to force cache busting
const timestampPath = path.join(__dirname, '..', 'docs', 'css', 'timestamp.txt');
const newTimestamp = Date.now().toString();

try {
    fs.writeFileSync(timestampPath, newTimestamp);
    console.log(`✅ Updated timestamp to: ${newTimestamp}`);
} catch (error) {
    console.error('❌ Failed to update timestamp:', error.message);
}

// Update package.json version to force cache busting
const packagePath = path.join(__dirname, '..', 'package.json');
try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const currentVersion = packageJson.version;
    const versionParts = currentVersion.split('.');
    versionParts[2] = (parseInt(versionParts[2]) + 1).toString();
    packageJson.version = versionParts.join('.');
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log(`✅ Updated package version from ${currentVersion} to ${packageJson.version}`);
} catch (error) {
    console.error('❌ Failed to update package version:', error.message);
}

// Create a cache busting file
const cacheBusterPath = path.join(__dirname, '..', 'docs', 'cache-buster.js');
const cacheBusterContent = `
// Cache Buster - Generated ${new Date().toISOString()}
window.CACHE_BUSTER = {
    timestamp: ${newTimestamp},
    random: '${Math.random().toString(36).substr(2, 9)}',
    version: '${newTimestamp}'
};

// Force reload all cached resources
(function() {
    console.log('🔄 Applying cache busting...');
    
    // Force reload CSS
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
        const originalHref = link.href.split('?')[0];
        link.href = originalHref + '?v=' + window.CACHE_BUSTER.timestamp + '&r=' + window.CACHE_BUSTER.random;
    });
    
    // Force reload JS
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
        if (script.src && !script.src.includes('socket.io')) {
            const originalSrc = script.src.split('?')[0];
            script.src = originalSrc + '?v=' + window.CACHE_BUSTER.timestamp + '&r=' + window.CACHE_BUSTER.random;
        }
    });
    
    // Force reload images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (img.src && !img.src.includes('data:')) {
            const originalSrc = img.src.split('?')[0];
            img.src = originalSrc + '?v=' + window.CACHE_BUSTER.timestamp + '&r=' + window.CACHE_BUSTER.random;
        }
    });
    
    console.log('✅ Cache busting applied');
})();
`;

try {
    fs.writeFileSync(cacheBusterPath, cacheBusterContent);
    console.log('✅ Created cache buster file');
} catch (error) {
    console.error('❌ Failed to create cache buster file:', error.message);
}

console.log('\n🎯 Cache busting complete!');
console.log('🌐 Open http://localhost:3000/chat in your browser');
console.log('💡 If you still see cached content:');
console.log('   1. Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)');
console.log('   2. Or open Developer Tools and right-click the refresh button');
console.log('   3. Select "Empty Cache and Hard Reload"');
console.log('   4. Or try opening in an incognito/private window');

// Wait a moment for the server to restart
setTimeout(() => {
    console.log('\n🌐 Try opening http://localhost:3000/chat in a few seconds');
}, 2000);
