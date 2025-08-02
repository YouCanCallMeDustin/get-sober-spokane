const fs = require('fs');
const path = require('path');
const { optimizeAllPages } = require('./seo-optimizer');

// SEO Automation Script
class SEOAutomation {
    constructor() {
        this.resourceFile = path.join(__dirname, '../src/js/resource-directory.js');
        this.lastUpdateFile = path.join(__dirname, '../.seo-last-update');
        this.config = {
            updateInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
            autoSync: true,
            generateReports: true
        };
    }
    
    // Check if SEO update is needed
    needsUpdate() {
        if (!fs.existsSync(this.lastUpdateFile)) {
            return true;
        }
        
        const lastUpdate = fs.readFileSync(this.lastUpdateFile, 'utf8');
        const lastUpdateTime = new Date(lastUpdate).getTime();
        const currentTime = new Date().getTime();
        
        return (currentTime - lastUpdateTime) > this.config.updateInterval;
    }
    
    // Monitor resource directory changes
    monitorResourceChanges() {
        const resourceContent = fs.readFileSync(this.resourceFile, 'utf8');
        const resourceHash = this.generateHash(resourceContent);
        const hashFile = path.join(__dirname, '../.resource-hash');
        
        let previousHash = '';
        if (fs.existsSync(hashFile)) {
            previousHash = fs.readFileSync(hashFile, 'utf8');
        }
        
        if (previousHash !== resourceHash) {
            console.log('🔄 Resource directory changed, updating SEO...');
            this.updateSEO();
            fs.writeFileSync(hashFile, resourceHash);
        }
    }
    
    // Generate hash for content
    generateHash(content) {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }
    
    // Update SEO based on resource changes
    async updateSEO() {
        try {
            // Extract resource data
            const resourceData = this.extractResourceData();
            
            // Update structured data with new resources
            this.updateStructuredData(resourceData);
            
            // Generate new sitemap
            this.updateSitemap(resourceData);
            
            // Update meta descriptions with resource counts
            this.updateMetaDescriptions(resourceData);
            
            // Mark as updated
            fs.writeFileSync(this.lastUpdateFile, new Date().toISOString());
            
            console.log('✅ SEO updated successfully');
            
        } catch (error) {
            console.error('❌ SEO update failed:', error);
        }
    }
    
    // Extract resource data from JavaScript file
    extractResourceData() {
        const content = fs.readFileSync(this.resourceFile, 'utf8');
        const resourceMatch = content.match(/this\.resources\s*=\s*\[([\s\S]*?)\];/);
        
        if (!resourceMatch) {
            throw new Error('Could not extract resource data');
        }
        
        // Parse the resource array (simplified parsing)
        const resourceText = resourceMatch[1];
        const resources = [];
        
        // Extract basic resource information
        const resourceMatches = resourceText.matchAll(/id:\s*['"]([^'"]+)['"][\s\S]*?name:\s*['"]([^'"]+)['"][\s\S]*?category:\s*['"]([^'"]+)['"]/g);
        
        for (const match of resourceMatches) {
            resources.push({
                id: match[1],
                name: match[2],
                category: match[3]
            });
        }
        
        return {
            total: resources.length,
            byCategory: this.groupByCategory(resources),
            resources: resources
        };
    }
    
    // Group resources by category
    groupByCategory(resources) {
        const grouped = {};
        resources.forEach(resource => {
            if (!grouped[resource.category]) {
                grouped[resource.category] = [];
            }
            grouped[resource.category].push(resource);
        });
        return grouped;
    }
    
    // Update structured data with resource information
    updateStructuredData(resourceData) {
        const structuredDataPath = path.join(__dirname, '../src/js/structured-data.js');
        
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Spokane Recovery Resources",
            "description": `Comprehensive directory of ${resourceData.total} recovery resources in Spokane, WA`,
            "numberOfItems": resourceData.total,
            "itemListElement": resourceData.resources.map((resource, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "Service",
                    "name": resource.name,
                    "description": `${resource.category} service in Spokane, WA`,
                    "serviceType": resource.category,
                    "areaServed": {
                        "@type": "City",
                        "name": "Spokane"
                    }
                }
            }))
        };
        
        const scriptContent = `// Auto-generated structured data
window.structuredData = ${JSON.stringify(structuredData, null, 2)};

// Inject structured data into page
document.addEventListener('DOMContentLoaded', function() {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(window.structuredData);
    document.head.appendChild(script);
});`;
        
        fs.writeFileSync(structuredDataPath, scriptContent);
        console.log('✓ Updated structured data');
    }
    
    // Update sitemap with resource information
    updateSitemap(resourceData) {
        const baseUrl = 'https://getsoberspokane.org';
        const pages = [
            { url: '/', priority: '1.0', changefreq: 'weekly' },
            { url: '/shelter-housing.html', priority: '0.9', changefreq: 'weekly' },
            { url: '/addiction-treatments-support.html', priority: '0.9', changefreq: 'weekly' },
            { url: '/medical-mental-health.html', priority: '0.9', changefreq: 'weekly' },
            { url: '/food-basic-needs.html', priority: '0.8', changefreq: 'weekly' },
            { url: '/employment-skills.html', priority: '0.8', changefreq: 'weekly' },
            { url: '/community-engagement-sober-activities.html', priority: '0.8', changefreq: 'weekly' },
            { url: '/resource-directory.html', priority: '0.9', changefreq: 'daily' },
            { url: '/map.html', priority: '0.7', changefreq: 'weekly' },
            { url: '/donations.html', priority: '0.6', changefreq: 'monthly' }
        ];
        
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
        fs.writeFileSync(sitemapPath, sitemap);
        console.log('✓ Updated sitemap');
    }
    
    // Update meta descriptions with resource counts
    updateMetaDescriptions(resourceData) {
        const pugDir = path.join(__dirname, '../src/pug');
        const pugFiles = fs.readdirSync(pugDir).filter(file => file.endsWith('.pug'));
        
        const descriptions = {
            'resource-directory': `Comprehensive directory of ${resourceData.total} recovery resources in Spokane, WA. Search and filter ${Object.keys(resourceData.byCategory).length} categories including addiction treatment centers, shelters, food banks, mental health services, and support groups.`,
            'shelter-housing': `Find ${resourceData.byCategory.shelter?.length || 0} emergency shelters, transitional housing, and housing assistance programs in Spokane, WA. Support for individuals and families experiencing homelessness.`,
            'addiction-treatments-support': `Comprehensive directory of ${resourceData.byCategory.treatment?.length || 0} addiction treatment centers and ${resourceData.byCategory.support?.length || 0} support groups in Spokane, WA. AA, NA, SMART Recovery, and evidence-based treatment programs.`,
            'medical-mental-health': `Find ${resourceData.byCategory.medical?.length || 0} hospitals, mental health clinics, crisis intervention services, and healthcare providers in Spokane, WA. Comprehensive medical and behavioral health support.`,
            'food-basic-needs': `Access ${resourceData.byCategory.food?.length || 0} food banks, pantries, clothing assistance, and basic necessities in Spokane, WA. Free food, hygiene products, and community resource support.`
        };
        
        pugFiles.forEach(file => {
            const pageKey = file.replace('.pug', '');
            if (descriptions[pageKey]) {
                const templatePath = path.join(pugDir, file);
                let template = fs.readFileSync(templatePath, 'utf8');
                
                // Update description
                template = template.replace(
                    /meta\(name='description',\s+content='[^']+'\)/,
                    `meta(name='description', content='${descriptions[pageKey]}')`
                );
                
                fs.writeFileSync(templatePath, template);
                console.log(`✓ Updated description for ${pageKey}`);
            }
        });
    }
    
    // Generate SEO improvement report
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            automation: {
                lastUpdate: fs.existsSync(this.lastUpdateFile) ? fs.readFileSync(this.lastUpdateFile, 'utf8') : 'Never',
                nextUpdate: new Date(Date.now() + this.config.updateInterval).toISOString(),
                autoSync: this.config.autoSync
            },
            resources: this.extractResourceData(),
            recommendations: [
                'Monitor Google Search Console for new indexing',
                'Track Core Web Vitals in PageSpeed Insights',
                'Submit updated sitemap to search engines',
                'Monitor local search rankings for Spokane recovery terms',
                'Consider adding more long-tail keywords',
                'Build local backlinks from recovery organizations'
            ],
            nextActions: [
                'Run: npm run build:full',
                'Submit sitemap to Google Search Console',
                'Monitor search performance for 30 days',
                'Update resource directory weekly',
                'Review and respond to user feedback'
            ]
        };
        
        const reportPath = path.join(__dirname, '../seo-automation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log('📊 SEO automation report generated');
        
        return report;
    }
    
    // Start automation monitoring
    startMonitoring() {
        console.log('🤖 Starting SEO automation monitoring...');
        
        // Initial check
        if (this.needsUpdate()) {
            this.updateSEO();
        }
        
        // Monitor resource changes
        this.monitorResourceChanges();
        
        // Generate report
        if (this.config.generateReports) {
            this.generateReport();
        }
        
        console.log('✅ SEO automation monitoring active');
    }
}

// CLI interface
if (require.main === module) {
    const automation = new SEOAutomation();
    const command = process.argv[2];
    
    switch (command) {
        case 'update':
            automation.updateSEO();
            break;
        case 'monitor':
            automation.startMonitoring();
            break;
        case 'report':
            automation.generateReport();
            break;
        case 'check':
            console.log('Needs update:', automation.needsUpdate());
            break;
        default:
            console.log('Usage: node seo-automation.js [update|monitor|report|check]');
            console.log('  update  - Force SEO update');
            console.log('  monitor - Start monitoring mode');
            console.log('  report  - Generate SEO report');
            console.log('  check   - Check if update is needed');
    }
}

module.exports = SEOAutomation; 