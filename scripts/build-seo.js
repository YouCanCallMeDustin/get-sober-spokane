const { optimizeAllPages } = require('./seo-optimizer');
const fs = require('fs');
const path = require('path');

// SEO Build Script
async function buildSEO() {
    console.log('🔧 Starting SEO build process...');
    
    try {
        // Run comprehensive SEO optimization
        await optimizeAllPages();
        
        // Create sitemap
        createSitemap();
        
        // Create robots.txt
        createRobotsTxt();
        
        // Update package.json with sharp dependency
        updatePackageJson();
        
        console.log('✅ SEO build complete!');
        console.log('📋 Next steps:');
        console.log('  1. Run: npm install sharp');
        console.log('  2. Build the project: npm run build');
        console.log('  3. Submit sitemap to Google Search Console');
        console.log('  4. Monitor Core Web Vitals');
        
    } catch (error) {
        console.error('❌ SEO build failed:', error);
        process.exit(1);
    }
}

// discover all pug files and map to URLs
function getPages() {
    const srcPath = path.join(__dirname, '../src/pug');
    const pages = [];
    
    // Recursive search for .pug files
    function findPugFiles(dir, prefix = '') {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory()) {
                if (file !== 'layouts' && file !== 'includes' && file !== 'mixins' && file !== 'auth') {
                    findPugFiles(fullPath, prefix + file + '/');
                }
            } else if (file.endsWith('.pug')) {
                // Ignore layouts/includes if they were somehow in the wrong place
                if (file.startsWith('_') || file.includes('layout') || file.includes('mixin')) return;
                
                let url = prefix + file.replace('.pug', '.html');
                if (url === 'index.html') url = '/';
                
                // Determine priority and frequency
                let priority = '0.8';
                let changefreq = 'weekly';
                
                if (url === '/') {
                    priority = '1.0';
                } else if (url.includes('recovery-resources.html') || url.startsWith('blog/')) {
                    priority = '0.7';
                    changefreq = 'monthly';
                } else if (url.includes('privacy-policy') || url.includes('terms-of-service')) {
                    priority = '0.3';
                    changefreq = 'yearly';
                } else if (['shelter-housing.html', 'addiction-treatments-support.html', 'medical-mental-health.html', 'resource-directory.html'].includes(url)) {
                    priority = '0.9';
                }
                
                pages.push({ url: url.startsWith('/') ? url : '/' + url, priority, changefreq });
            }
        });
    }
    
    findPugFiles(srcPath);
    return pages;
}

// Create XML sitemap
function createSitemap() {
    const baseUrl = 'https://www.getsoberspokane.com';
    const pages = getPages();
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    
    const sitemapPath = path.join(__dirname, '../docs/sitemap.xml');
    const staticSitemapPath = path.join(__dirname, '../public/static/sitemap.xml');
    
    fs.writeFileSync(sitemapPath, sitemap);
    
    // Also update public/static if it exists
    if (fs.existsSync(path.join(__dirname, '../public/static'))) {
        fs.writeFileSync(staticSitemapPath, sitemap);
    }
    
    console.log(`✓ Sitemap created with ${pages.length} pages`);
}

// Create robots.txt
function createRobotsTxt() {
    const pages = getPages();
    const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://www.getsoberspokane.com/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Disallow admin areas
Disallow: /admin/
Disallow: /private/
Disallow: /auth/

# Allow all important pages
${pages.filter(p => parseFloat(p.priority) >= 0.7).map(p => `Allow: ${p.url}`).join('\n')}`;
    
    const robotsPath = path.join(__dirname, '../docs/robots.txt');
    const staticRobotsPath = path.join(__dirname, '../public/static/robots.txt');
    
    fs.writeFileSync(robotsPath, robotsTxt);
    
    if (fs.existsSync(path.join(__dirname, '../public/static'))) {
        fs.writeFileSync(staticRobotsPath, robotsTxt);
    }
    
    console.log('✓ Robots.txt created');
}

// Update package.json with sharp dependency
function updatePackageJson() {
    const packagePath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Add sharp dependency if not present
    if (!packageJson.dependencies.sharp) {
        packageJson.dependencies.sharp = '^0.32.0';
        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
        console.log('✓ Added sharp dependency to package.json');
    }
    
    // Add SEO build script
    if (!packageJson.scripts['build:seo']) {
        packageJson.scripts['build:seo'] = 'node scripts/build-seo.js';
        packageJson.scripts['build:full'] = 'npm run build:seo && npm run build';
        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
        console.log('✓ Added SEO build scripts to package.json');
    }
}

// Create performance monitoring script
function createPerformanceMonitor() {
    const monitorScript = `
// Performance Monitoring Script
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }
    
    init() {
        // Monitor Core Web Vitals
        this.monitorLCP();
        this.monitorFID();
        this.monitorCLS();
        
        // Monitor resource loading
        this.monitorResourceTiming();
        
        // Monitor user interactions
        this.monitorUserInteractions();
    }
    
    monitorLCP() {
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.metrics.lcp = lastEntry.startTime;
            this.logMetric('LCP', lastEntry.startTime);
        }).observe({entryTypes: ['largest-contentful-paint']});
    }
    
    monitorFID() {
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                this.metrics.fid = entry.processingStart - entry.startTime;
                this.logMetric('FID', this.metrics.fid);
            });
        }).observe({entryTypes: ['first-input']});
    }
    
    monitorCLS() {
        let clsValue = 0;
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                    this.metrics.cls = clsValue;
                    this.logMetric('CLS', clsValue);
                }
            });
        }).observe({entryTypes: ['layout-shift']});
    }
    
    monitorResourceTiming() {
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (entry.initiatorType === 'img' || entry.initiatorType === 'video') {
                    this.logMetric('Resource Load', entry.duration, entry.name);
                }
            });
        }).observe({entryTypes: ['resource']});
    }
    
    monitorUserInteractions() {
        // Track search interactions
        const searchInput = document.getElementById('resourceSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.logMetric('User Interaction', 'Search Input');
            });
        }
        
        // Track resource clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.resource-details-btn')) {
                this.logMetric('User Interaction', 'Resource Details Click');
            }
        });
    }
    
    logMetric(name, value, context = '') {
        console.log(\`[Performance] \${name}: \${value}\${context ? ' - ' + context : ''}\`);
        
        // Send to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'performance_metric', {
                metric_name: name,
                metric_value: value,
                metric_context: context
            });
        }
    }
    
    getMetrics() {
        return this.metrics;
    }
}

// Initialize performance monitoring
if (typeof PerformanceObserver !== 'undefined') {
    window.performanceMonitor = new PerformanceMonitor();
}
`;
    
    const monitorPath = path.join(__dirname, '../src/js/performance-monitor.js');
    fs.writeFileSync(monitorPath, monitorScript);
    console.log('✓ Performance monitor created: src/js/performance-monitor.js');
}

// Create accessibility improvements
function createAccessibilityEnhancements() {
    const accessibilityScript = `
// Accessibility Enhancements
class AccessibilityEnhancements {
    constructor() {
        this.init();
    }
    
    init() {
        this.addSkipLinks();
        this.enhanceKeyboardNavigation();
        this.addFocusIndicators();
        this.improveScreenReaderSupport();
        this.addHighContrastToggle();
    }
    
    addSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link sr-only sr-only-focusable';
        skipLink.style.cssText = \`
            position: absolute;
            top: -40px;
            left: 6px;
            z-index: 1000;
            padding: 8px 16px;
            background: #000;
            color: #fff;
            text-decoration: none;
            border-radius: 4px;
        \`;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
    
    enhanceKeyboardNavigation() {
        // Add keyboard navigation for resource cards
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const target = e.target.closest('.resource-card');
                if (target) {
                    e.preventDefault();
                    const detailsBtn = target.querySelector('.resource-details-btn');
                    if (detailsBtn) {
                        detailsBtn.click();
                    }
                }
            }
        });
        
        // Make resource cards focusable
        document.querySelectorAll('.resource-card').forEach(card => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', 'View resource details');
        });
    }
    
    addFocusIndicators() {
        const style = document.createElement('style');
        style.textContent = \`
            *:focus {
                outline: 2px solid #2c5aa0 !important;
                outline-offset: 2px !important;
            }
            
            .btn:focus,
            .nav-link:focus {
                box-shadow: 0 0 0 3px rgba(44, 90, 160, 0.25) !important;
            }
        \`;
        document.head.appendChild(style);
    }
    
    improveScreenReaderSupport() {
        // Add ARIA labels to interactive elements
        document.querySelectorAll('.btn').forEach(btn => {
            if (!btn.getAttribute('aria-label')) {
                const text = btn.textContent.trim();
                btn.setAttribute('aria-label', text);
            }
        });
        
        // Add live regions for dynamic content
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
        
        // Announce search results
        const searchInput = document.getElementById('resourceSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                setTimeout(() => {
                    const results = document.querySelectorAll('.resource-card');
                    liveRegion.textContent = \`Found \${results.length} resources\`;
                }, 500);
            });
        }
    }
    
    addHighContrastToggle() {
        const toggle = document.createElement('button');
        toggle.textContent = 'High Contrast';
        toggle.className = 'btn btn-sm btn-outline-secondary';
        toggle.style.cssText = \`
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 1000;
        \`;
        
        toggle.addEventListener('click', () => {
            document.body.classList.toggle('high-contrast');
            const isActive = document.body.classList.contains('high-contrast');
            toggle.textContent = isActive ? 'Normal Contrast' : 'High Contrast';
        });
        
        document.body.appendChild(toggle);
        
        // Add high contrast styles
        const highContrastStyle = document.createElement('style');
        highContrastStyle.textContent = \`
            .high-contrast {
                filter: contrast(150%) brightness(110%);
            }
            
            .high-contrast * {
                border: 1px solid #000 !important;
            }
        \`;
        document.head.appendChild(highContrastStyle);
    }
}

// Initialize accessibility enhancements
document.addEventListener('DOMContentLoaded', () => {
    new AccessibilityEnhancements();
});
`;
    
    const accessibilityPath = path.join(__dirname, '../src/js/accessibility.js');
    fs.writeFileSync(accessibilityPath, accessibilityScript);
    console.log('✓ Accessibility enhancements created: src/js/accessibility.js');
}

// Run the build
if (require.main === module) {
    buildSEO();
}

module.exports = { buildSEO }; 