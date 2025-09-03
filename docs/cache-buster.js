
// Cache Buster - Generated 2025-09-01T01:47:47.220Z
window.CACHE_BUSTER = {
    timestamp: 1756691267218,
    random: 'ha2hew5v4',
    version: '1756691267218'
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
