const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
sharp.concurrency(1); // Limit to 1 thread to save memory

// SEO Configuration for all pages
const seoConfig = {
    baseUrl: 'https://www.getsoberspokane.com',
    defaultImage: '/assets/img/logo.png',
    organization: {
        name: 'Get Sober Spokane',
        description: 'Comprehensive recovery support community providing addiction treatment resources, mental health services, shelter, food assistance, and recovery support in Spokane, Washington.',
        phone: '+1-509-389-9350',
        email: 'spokanesober@gmail.com',
        address: {
            locality: 'Spokane',
            region: 'WA',
            country: 'US',
            coordinates: '47.6588, -117.4260'
        }
    },
    pages: {
        'index': {
            title: 'Get Sober Spokane - Recovery Support Community | Addiction Treatment Resources Spokane, WA',
            description: 'Find addiction treatment, mental health services, shelters, food banks, and recovery support in Spokane, WA. Comprehensive resource directory for individuals and families seeking sobriety and recovery.',
            keywords: 'addiction treatment Spokane, recovery support Spokane, sober living Spokane, mental health Spokane, shelter Spokane, food bank Spokane, AA meetings Spokane, NA meetings Spokane',
            schemaType: 'NonProfit',
            image: '/assets/img/logo.png'
        },
        'shelter-housing': {
            title: 'Shelter & Housing Resources Spokane, WA | Emergency Housing & Transitional Programs',
            description: 'Find emergency shelters, transitional housing, and housing assistance programs in Spokane, WA. Support for individuals and families experiencing homelessness.',
            keywords: 'shelter Spokane, housing assistance Spokane, emergency shelter Spokane, homeless services Spokane, transitional housing Spokane',
            schemaType: 'Service',
            image: '/assets/img/12.jpg'
        },
        'addiction-treatments-support': {
            title: 'Addiction Treatment Centers & Support Groups Spokane, WA | Recovery Programs',
            description: 'Comprehensive addiction treatment centers, detox facilities, and support groups in Spokane, WA. AA, NA, SMART Recovery, and evidence-based treatment programs.',
            keywords: 'addiction treatment Spokane, detox Spokane, AA meetings Spokane, NA meetings Spokane, recovery programs Spokane, substance abuse treatment Spokane',
            schemaType: 'MedicalBusiness',
            image: '/assets/img/10.jpg'
        },
        'medical-mental-health': {
            title: 'Medical & Mental Health Services Spokane, WA | Crisis Intervention & Healthcare',
            description: 'Find hospitals, mental health clinics, crisis intervention services, and healthcare providers in Spokane, WA. Comprehensive medical and behavioral health support.',
            keywords: 'mental health Spokane, crisis intervention Spokane, hospitals Spokane, healthcare Spokane, behavioral health Spokane, medical services Spokane',
            schemaType: 'MedicalBusiness',
            image: '/assets/img/9.jpg'
        },
        'food-basic-needs': {
            title: 'Food Banks & Basic Needs Assistance Spokane, WA | Free Food & Essentials',
            description: 'Access food banks, pantries, clothing assistance, and basic necessities in Spokane, WA. Free food, hygiene products, and community resource support.',
            keywords: 'food bank Spokane, free food Spokane, basic needs Spokane, clothing assistance Spokane, community resources Spokane',
            schemaType: 'Service',
            image: '/assets/img/11.jpg'
        },
        'employment-skills': {
            title: 'Employment & Skills Training Spokane, WA | Job Training & Workforce Development',
            description: 'Job training programs, employment services, and workforce development resources in Spokane, WA. Career counseling, resume building, and job placement assistance.',
            keywords: 'job training Spokane, employment services Spokane, workforce development Spokane, career counseling Spokane, job placement Spokane',
            schemaType: 'Service',
            image: '/assets/img/8.jpg'
        },
        'community-engagement-sober-activities': {
            title: 'Sober Activities & Community Events Spokane, WA | Alcohol-Free Social Events',
            description: 'Discover sober social events, fitness programs, and community activities in Spokane, WA. Alcohol-free entertainment, volunteer opportunities, and recovery community events.',
            keywords: 'sober activities Spokane, alcohol-free events Spokane, recovery community Spokane, sober social events Spokane, fitness programs Spokane',
            schemaType: 'Event',
            image: '/assets/img/7.jpg'
        },
        'resource-directory': {
            title: 'Recovery Resource Directory Spokane, WA | Comprehensive Addiction Treatment & Support',
            description: 'Comprehensive directory of recovery resources in Spokane, WA. Search and filter addiction treatment centers, shelters, food banks, mental health services, and support groups.',
            keywords: 'recovery resources Spokane, resource directory Spokane, addiction treatment directory Spokane, support groups Spokane, recovery services Spokane',
            schemaType: 'WebPage',
            image: '/assets/img/logo.png'
        },
        'map': {
            title: 'Recovery Resources Map Spokane, WA | Interactive Resource Locator',
            description: 'Interactive map showing recovery resources, treatment centers, shelters, and support services in Spokane, WA. Find nearby addiction treatment and mental health services.',
            keywords: 'recovery map Spokane, resource locator Spokane, treatment centers map Spokane, support services map Spokane',
            schemaType: 'WebPage',
            image: '/assets/img/logo.png'
        },
        'donations': {
            title: 'Donate to Get Sober Spokane | Support Recovery Community Spokane, WA',
            description: 'Support the recovery community in Spokane, WA. Your donation helps provide addiction treatment resources, mental health services, shelter, and food assistance.',
            keywords: 'donate Spokane, recovery support Spokane, addiction treatment funding Spokane, community support Spokane',
            schemaType: 'DonationPage',
            image: '/assets/img/13.jpg'
        }
    }
};

// Generate meta tags for a specific page
function generateMetaTags(pageKey, pageConfig) {
    const baseUrl = seoConfig.baseUrl;
    const pageUrl = pageKey === 'index' ? baseUrl : `${baseUrl}/${pageKey}.html`;
    const imageUrl = `${baseUrl}${pageConfig.image}`;

    return {
        // Primary Meta Tags
        title: pageConfig.title,
        description: pageConfig.description,
        keywords: pageConfig.keywords,
        canonical: pageUrl,

        // Open Graph
        ogType: 'website',
        ogUrl: pageUrl,
        ogTitle: pageConfig.title,
        ogDescription: pageConfig.description,
        ogImage: imageUrl,
        ogSiteName: seoConfig.organization.name,
        ogLocale: 'en_US',

        // Twitter
        twitterCard: 'summary_large_image',
        twitterUrl: pageUrl,
        twitterTitle: pageConfig.title,
        twitterDescription: pageConfig.description,
        twitterImage: imageUrl,

        // Additional SEO
        geoRegion: 'US-WA',
        geoPlacename: 'Spokane',
        geoPosition: seoConfig.organization.address.coordinates,
        robots: 'index, follow',
        language: 'English',
        revisitAfter: '7 days'
    };
}

// Generate structured data for a specific page
function generateStructuredData(pageKey, pageConfig) {
    const baseUrl = seoConfig.baseUrl;
    const org = seoConfig.organization;

    let schema = {
        "@context": "https://schema.org",
        "@type": pageConfig.schemaType,
        "name": pageConfig.title.split('|')[0].trim(),
        "description": pageConfig.description,
        "url": pageKey === 'index' ? baseUrl : `${baseUrl}/${pageKey}.html`,
        "image": `${baseUrl}${pageConfig.image}`,
        "address": {
            "@type": "PostalAddress",
            "addressLocality": org.address.locality,
            "addressRegion": org.address.region,
            "addressCountry": org.address.country
        },
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": org.phone,
            "contactType": "customer service",
            "email": org.email
        },
        "serviceArea": {
            "@type": "City",
            "name": "Spokane"
        }
    };

    // Add specific schema properties based on page type
    if (pageConfig.schemaType === 'MedicalBusiness') {
        schema.medicalSpecialty = "Addiction Medicine";
        schema.availableService = {
            "@type": "MedicalProcedure",
            "name": "Addiction Treatment"
        };
    }

    if (pageConfig.schemaType === 'Service') {
        schema.serviceType = "Recovery Support";
        schema.areaServed = {
            "@type": "City",
            "name": "Spokane"
        };
    }

    if (pageConfig.schemaType === 'Event') {
        schema.eventStatus = "EventScheduled";
        schema.eventAttendanceMode = "OfflineEventAttendanceMode";
    }

    return schema;
}

// Optimize images to WebP format
async function optimizeImages() {
    const imageDir = path.join(__dirname, '../src/assets/img');
    const outputDir = path.join(__dirname, '../docs/assets/img');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const imageFiles = fs.readdirSync(imageDir).filter(file =>
        /\.(jpg|jpeg|png)$/i.test(file)
    );

    console.log('Optimizing images to WebP format...');

    for (const file of imageFiles) {
        const inputPath = path.join(imageDir, file);
        const outputPath = path.join(outputDir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));

        try {
            // Check if file already exists to skip re-processing
            if (fs.existsSync(outputPath)) {
                const inputStat = fs.statSync(inputPath);
                const outputStat = fs.statSync(outputPath);
                // Skip if output is newer than input
                if (outputStat.mtime > inputStat.mtime) {
                    console.log(`- Skipping (already optimized): ${file}`);
                    continue;
                }
            }

            await sharp(inputPath)
                .webp({ quality: 85 })
                .toFile(outputPath);

            console.log(`✓ Optimized: ${file} -> ${path.basename(outputPath)}`);
        } catch (error) {
            console.error(`✗ Error optimizing ${file}:`, error.message);
        }
    }
}

// Generate responsive image sizes
async function generateResponsiveImages() {
    const imageDir = path.join(__dirname, '../src/assets/img');
    const outputDir = path.join(__dirname, '../docs/assets/img');

    const sizes = [
        { width: 480, suffix: '-sm' },
        { width: 768, suffix: '-md' },
        { width: 1024, suffix: '-lg' },
        { width: 1200, suffix: '-xl' }
    ];

    const imageFiles = fs.readdirSync(imageDir).filter(file =>
        /\.(jpg|jpeg|png)$/i.test(file)
    );

    console.log('Generating responsive image sizes...');

    for (const file of imageFiles) {
        const inputPath = path.join(imageDir, file);

        for (const size of sizes) {
            const outputPath = path.join(outputDir, file.replace(/\.(jpg|jpeg|png)$/i, `${size.suffix}.webp`));

            try {
                // Check if file already exists
                if (fs.existsSync(outputPath)) {
                    const inputStat = fs.statSync(inputPath);
                    const outputStat = fs.statSync(outputPath);
                    if (outputStat.mtime > inputStat.mtime) {
                        continue;
                    }
                }

                await sharp(inputPath)
                    .resize(size.width, null, { withoutEnlargement: true })
                    .webp({ quality: 85 })
                    .toFile(outputPath);

                console.log(`✓ Generated: ${file} ${size.width}px -> ${path.basename(outputPath)}`);
            } catch (error) {
                console.error(`✗ Error generating ${file} ${size.width}px:`, error.message);
            }
        }
    }
}

// Create lazy loading JavaScript
function createLazyLoadingScript() {
    return `
// Lazy Loading Implementation
document.addEventListener('DOMContentLoaded', function() {
    // Intersection Observer for lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    // Video lazy loading
    const videoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;
                const source = video.querySelector('source');
                if (source && source.dataset.src) {
                    source.src = source.dataset.src;
                    video.load();
                    observer.unobserve(video);
                }
            }
        });
    });

    // Observe all lazy images
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });

    // Observe all lazy videos
    document.querySelectorAll('video[data-src]').forEach(video => {
        videoObserver.observe(video);
    });
});

// Preload critical resources
function preloadCriticalResources() {
    const criticalResources = [
        '/assets/img/logo.png',
        '/css/styles.css',
        '/assets/img/bg-masthead.mp4'
    ];

    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        
        if (resource.endsWith('.css')) {
            link.as = 'style';
        } else if (resource.endsWith('.mp4')) {
            link.as = 'video';
            link.type = 'video/mp4';
        } else {
            link.as = 'image';
        }
        
        document.head.appendChild(link);
    });
}

// Initialize preloading
preloadCriticalResources();
`;
}

// Update Pug templates with SEO optimizations
function updatePugTemplate(templatePath, pageKey) {
    if (!seoConfig.pages[pageKey]) {
        console.log(`No SEO config found for page: ${pageKey}`);
        return;
    }

    const pageConfig = seoConfig.pages[pageKey];
    const metaTags = generateMetaTags(pageKey, pageConfig);
    const structuredData = generateStructuredData(pageKey, pageConfig);

    let template = fs.readFileSync(templatePath, 'utf8');

    // Update title
    template = template.replace(
        /title\s+[^\\n]+/,
        `title ${metaTags.title}`
    );

    // Update description
    template = template.replace(
        /meta\(name='description',\s+content='[^']+'\)/,
        `meta(name='description', content='${metaTags.description}')`
    );

    // Add comprehensive meta tags
    const metaTagsSection = `
        // Primary Meta Tags
        meta(name='keywords', content='${metaTags.keywords}')
        meta(name='robots', content='${metaTags.robots}')
        meta(name='language', content='${metaTags.language}')
        meta(name='revisit-after', content='${metaTags.revisitAfter}')
        
        // Open Graph / Facebook
        meta(property='og:type', content='${metaTags.ogType}')
        meta(property='og:url', content='${metaTags.ogUrl}')
        meta(property='og:title', content='${metaTags.ogTitle}')
        meta(property='og:description', content='${metaTags.ogDescription}')
        meta(property='og:image', content='${metaTags.ogImage}')
        meta(property='og:image:width', content='1200')
        meta(property='og:image:height', content='630')
        meta(property='og:site_name', content='${metaTags.ogSiteName}')
        meta(property='og:locale', content='${metaTags.ogLocale}')
        
        // Twitter
        meta(name='twitter:card', content='${metaTags.twitterCard}')
        meta(name='twitter:url', content='${metaTags.twitterUrl}')
        meta(name='twitter:title', content='${metaTags.twitterTitle}')
        meta(name='twitter:description', content='${metaTags.twitterDescription}')
        meta(name='twitter:image', content='${metaTags.twitterImage}')
        
        // Additional SEO Meta Tags
        meta(name='geo.region', content='${metaTags.geoRegion}')
        meta(name='geo.placename', content='${metaTags.geoPlacename}')
        meta(name='geo.position', content='${metaTags.geoPosition}')
        meta(name='ICBM', content='${metaTags.geoPosition}')
        link(rel='canonical', href='${metaTags.canonical}')
        
        // Apple Touch Icon
        link(rel='apple-touch-icon', href='assets/img/logo.png')
        
        // Preload critical resources
        link(rel='preload', href='css/styles.css', as='style')
        link(rel='preload', href='assets/img/logo.png', as='image')
        ${pageKey === 'index' ? "link(rel='preload', href='assets/img/bg-masthead.mp4', as='video', type='video/mp4')" : ''}
    `;

    // Insert meta tags after existing meta tags
    const metaInsertPoint = template.indexOf("meta(name='author'");
    if (metaInsertPoint !== -1) {
        const insertAfter = template.indexOf('\n', metaInsertPoint) + 1;
        template = template.slice(0, insertAfter) + metaTagsSection + template.slice(insertAfter);
    }

    // Add structured data before closing head tag
    const structuredDataScript = `
        // Structured Data
        script(type='application/ld+json').
            ${JSON.stringify(structuredData, null, 12)}
    `;

    const headEnd = template.lastIndexOf('</head>');
    if (headEnd !== -1) {
        template = template.slice(0, headEnd) + structuredDataScript + template.slice(headEnd);
    }

    // Add lazy loading attributes to images
    template = template.replace(
        /<img([^>]+)src=['"]([^'"]+)['"]([^>]*)>/g,
        (match, before, src, after) => {
            if (src.includes('logo.png') || src.includes('bg-masthead.mp4')) {
                return match; // Don't lazy load critical images
            }
            return `<img${before}data-src="${src}"${after} class="lazy">`;
        }
    );

    // Add lazy loading attributes to videos
    template = template.replace(
        /<video([^>]+)><source\s+src=['"]([^'"]+)['"]([^>]*)>/g,
        (match, before, src, after) => {
            return `<video${before}><source data-src="${src}"${after}>`;
        }
    );

    fs.writeFileSync(templatePath, template);
    console.log(`✓ Updated SEO for: ${pageKey}`);
}

// Main optimization function
async function optimizeAllPages() {
    console.log('🚀 Starting comprehensive SEO optimization...');

    // Optimize images
    await optimizeImages();
    await generateResponsiveImages();

    // Update all Pug templates
    const pugDir = path.join(__dirname, '../src/pug');
    const pugFiles = fs.readdirSync(pugDir).filter(file => file.endsWith('.pug'));

    for (const file of pugFiles) {
        const pageKey = file.replace('.pug', '');
        const templatePath = path.join(pugDir, file);
        updatePugTemplate(templatePath, pageKey);
    }

    // Create lazy loading script
    const lazyLoadingScript = createLazyLoadingScript();
    const scriptPath = path.join(__dirname, '../src/js/lazy-loading.js');
    fs.writeFileSync(scriptPath, lazyLoadingScript);

    // Create SEO report
    createSEOReport();

    console.log('✅ SEO optimization complete!');
}

// Generate SEO report
function createSEOReport() {
    const report = {
        timestamp: new Date().toISOString(),
        pagesOptimized: Object.keys(seoConfig.pages).length,
        metaTagsAdded: ['title', 'description', 'keywords', 'Open Graph', 'Twitter Cards', 'geo tags'],
        structuredDataTypes: ['NonProfit', 'MedicalBusiness', 'Service', 'Event', 'WebPage', 'DonationPage'],
        optimizations: [
            'Comprehensive meta tags for all pages',
            'Open Graph and Twitter Card optimization',
            'Structured data (JSON-LD) implementation',
            'Image optimization to WebP format',
            'Responsive image generation',
            'Lazy loading implementation',
            'Critical resource preloading',
            'Geographic targeting for Spokane, WA'
        ],
        recommendations: [
            'Submit sitemap to Google Search Console',
            'Monitor Core Web Vitals in Google PageSpeed Insights',
            'Set up Google Analytics 4 tracking',
            'Create Google My Business listing',
            'Build local backlinks from recovery organizations',
            'Regular content updates to maintain freshness',
            'Monitor and respond to user reviews',
            'Consider adding Spanish language support'
        ]
    };

    const reportPath = path.join(__dirname, '../seo-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log('📊 SEO report generated: seo-report.json');
}

// Export functions for use in build process
module.exports = {
    optimizeAllPages,
    generateMetaTags,
    generateStructuredData,
    optimizeImages,
    createLazyLoadingScript
};

// Run if called directly
if (require.main === module) {
    optimizeAllPages().catch(console.error);
} 