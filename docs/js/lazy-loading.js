
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
