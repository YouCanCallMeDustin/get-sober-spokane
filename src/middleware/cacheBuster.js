/**
 * Cache Busting Middleware
 * Forces browser to reload static assets by adding dynamic timestamps
 */

function cacheBuster(req, res, next) {
    // Add cache-busting headers for all static assets
    if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|webp|ico|svg)$/)) {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.set('Last-Modified', new Date().toUTCString());
        res.set('ETag', `"${Date.now()}-${Math.random().toString(36).substr(2, 9)}"`);
    }
    
    // Add dynamic timestamp to template rendering
    req.cacheBuster = {
        timestamp: Date.now(),
        random: Math.random().toString(36).substr(2, 9)
    };
    
    next();
}

module.exports = cacheBuster;
