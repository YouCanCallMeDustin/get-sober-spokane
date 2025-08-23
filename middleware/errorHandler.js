// Production error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log error for debugging (in production, this would go to a logging service)
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Don't expose internal errors to users in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // In production, show generic error messages
    if (err.status === 404) {
      return res.status(404).render('error', {
        title: 'Page Not Found',
        error: 'The page you are looking for does not exist.',
        currentUser: req.session?.user || null
      });
    }
    
    if (err.status === 403) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        error: 'You do not have permission to access this resource.',
        currentUser: req.session?.user || null
      });
    }
    
    // Generic server error
    return res.status(500).render('error', {
      title: 'Server Error',
      error: 'Something went wrong. Please try again later.',
      currentUser: req.session?.user || null
    });
  } else {
    // In development, show detailed errors
    res.status(err.status || 500).json({
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method
    });
  }
};

module.exports = errorHandler;
