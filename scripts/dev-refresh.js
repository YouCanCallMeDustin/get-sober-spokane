#!/usr/bin/env node

/**
 * Development Refresh Script
 * Automatically rebuilds CSS and provides cache-busting for development
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Development Refresh - Rebuilding CSS...');

try {
  // Create a timestamp file for cache busting FIRST
  const timestamp = Date.now();
  const timestampFile = path.join(__dirname, '..', 'docs', 'css', 'timestamp.txt');
  fs.writeFileSync(timestampFile, timestamp.toString());
  console.log(`🕐 Generated timestamp: ${timestamp}`);
  
  // Rebuild SCSS
  console.log('📝 Compiling SCSS...');
  execSync('npm run build:scss', { stdio: 'inherit' });
  
  // Rebuild Pug templates (now with timestamp)
  console.log('📄 Compiling Pug templates...');
  execSync('npm run build:pug', { stdio: 'inherit' });
  
  console.log('✅ Development refresh complete!');
  console.log(`🕐 Timestamp: ${timestamp}`);
  console.log('🌐 Refresh your browser to see changes');
  console.log('💡 Tip: Use Ctrl+F5 (or Cmd+Shift+R) for hard refresh');
  
} catch (error) {
  console.error('❌ Development refresh failed:', error.message);
  process.exit(1);
}
