require('dotenv').config();
console.log('Starting server...');

const express = require('express');
const session = require('express-session');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const morgan = require('morgan');
const { createServer } = require('http');
const cacheBuster = require('./middleware/cacheBuster');

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('combined'));

// Cache busting middleware
app.use(cacheBuster);

// Custom static file handler that excludes dynamic routes
app.use((req, res, next) => {
  // List of routes that should be handled by dynamic routes, not static files
  const dynamicRoutes = ['/chat', '/login', '/signup', '/reset', '/dashboard', '/user-profile'];
  
  if (dynamicRoutes.includes(req.path) || req.path.startsWith('/chat/')) {
    return next(); // Skip static file serving for dynamic routes
  }
  
  // For other requests, try to serve static files
  express.static(path.join(__dirname, '..', 'docs'), {
    etag: false,
    lastModified: false,
    setHeaders: (res, path) => {
      if (process.env.NODE_ENV !== 'production') {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
      }
    }
  })(req, res, next);
});

// Serve CSS files with correct MIME type and cache busting
app.use('/css', (req, res, next) => {
  res.type('text/css');
  // Add cache control headers for development
  if (process.env.NODE_ENV !== 'production') {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
}, express.static(path.join(__dirname, '..', 'docs/css')), express.static(path.join(__dirname, 'scss/components')));

// Serve JavaScript files with correct MIME type
app.use('/js', (req, res, next) => {
  res.type('application/javascript');
  // Add cache control headers for development
  if (process.env.NODE_ENV !== 'production') {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
}, express.static(path.join(__dirname, '..', 'src/js')));

// Serve assets with correct MIME types
app.use('/assets', (req, res, next) => {
  // Set MIME type based on file extension
  const ext = path.extname(req.path).toLowerCase();
  if (ext === '.css') res.type('text/css');
  else if (ext === '.js') res.type('application/javascript');
  else if (ext === '.png') res.type('image/png');
  else if (ext === '.jpg' || ext === '.jpeg') res.type('image/jpeg');
  else if (ext === '.webp') res.type('image/webp');
  next();
}, express.static(path.join(__dirname, '..', 'src/assets')));

// Additional static file serving for better compatibility
app.use('/docs', express.static(path.join(__dirname, '..', 'docs')));
app.use('/src', express.static(path.join(__dirname, '..', 'src')));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Set Pug as templating engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '..', 'src/pug'));

// Expose client-safe environment variables for frontend initialization
app.get('/env.js', (req, res) => {
  const clientEnv = {
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || ''
  };
  res.type('application/javascript');
  res.send(`window.__ENV = Object.assign({}, window.__ENV || {}, ${JSON.stringify(clientEnv)});`);
});

// Handle /get-sober-spokane/env.js for GitHub Pages compatibility
app.get('/get-sober-spokane/env.js', (req, res) => {
  const clientEnv = {
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || ''
  };
  res.type('application/javascript');
  res.send(`window.__ENV = Object.assign({}, window.__ENV || {}, ${JSON.stringify(clientEnv)});`);
});

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Routes
app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

// Handle /get-sober-spokane/ root path
app.get('/get-sober-spokane/', (req, res) => {
  if (req.session.user) {
    res.redirect('/get-sober-spokane/dashboard.html');
  } else {
    res.redirect('/get-sober-spokane/auth/login.html');
  }
});

// Authentication routes
app.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.render('auth/login', { 
      title: 'Login - Sober Spokane',
      error: req.query.error || null,
      success: req.query.success || null
    });
  }
});

app.get('/signup', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.render('auth/signup', { 
      title: 'Sign Up - Sober Spokane',
      error: req.query.error || null
    });
  }
});

app.get('/reset', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.render('auth/reset', { 
      title: 'Reset Password - Sober Spokane',
      error: req.query.error || null,
      success: req.query.success || null
    });
  }
});

// Handle /get-sober-spokane/ auth routes
app.get('/get-sober-spokane/auth/login.html', (req, res) => {
  if (req.session.user) {
    res.redirect('/get-sober-spokane/dashboard.html');
  } else {
    res.sendFile(path.join(__dirname, 'docs/auth/login.html'));
  }
});

app.get('/get-sober-spokane/auth/signup.html', (req, res) => {
  if (req.session.user) {
    res.redirect('/get-sober-spokane/dashboard.html');
  } else {
    res.sendFile(path.join(__dirname, 'docs/auth/signup.html'));
  }
});

app.get('/get-sober-spokane/auth/reset.html', (req, res) => {
  if (req.session.user) {
    res.redirect('/get-sober-spokane/dashboard.html');
  } else {
    res.sendFile(path.join(__dirname, 'docs/auth/reset.html'));
  }
});

// Support both /dashboard (SSR) and /dashboard.html (static) paths
app.get(['/dashboard', '/dashboard.html'], (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'docs/dashboard.html'));
});

// Handle /get-sober-spokane/ prefix for local development (GitHub Pages compatibility)
app.get('/get-sober-spokane/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'docs/dashboard.html'));
});

// Handle /get-sober-spokane/js/:filepath routes
app.get('/get-sober-spokane/js/:filepath', (req, res) => {
  const filePath = req.params.filepath;
  res.sendFile(path.join(__dirname, '..', 'docs/js', filePath));
});

// Handle /get-sober-spokane/assets/:filepath routes
app.get('/get-sober-spokane/assets/:filepath', (req, res) => {
  const filePath = req.params.filepath;
  res.sendFile(path.join(__dirname, '..', 'docs/assets', filePath));
});

// Handle /get-sober-spokane/css/:filepath routes
app.get('/get-sober-spokane/css/:filepath', (req, res) => {
  const filePath = req.params.filepath;
  res.sendFile(path.join(__dirname, '..', 'docs/css', filePath));
});

// Handle other /get-sober-spokane/:filepath routes for static files
app.get('/get-sober-spokane/:filepath', (req, res) => {
  const filePath = req.params.filepath;
  res.sendFile(path.join(__dirname, '..', 'docs', filePath));
});

// API routes for authentication
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      success: true, 
      message: 'Please check your email to verify your account.',
      user: data.user 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Set session
    req.session.user = {
      id: data.user.id,
      email: data.user.email,
      displayName: data.user.user_metadata?.display_name || 'User'
    };

    // Set session expiry based on remember me
    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    res.json({ success: true, user: req.session.user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sync server session with client-side Supabase user (used after Google OAuth)
app.post('/api/auth/sync-session', (req, res) => {
  try {
    const { id, email, displayName } = req.body || {};

    if (!id || !email) {
      return res.status(400).json({ error: 'Missing user information' });
    }

    req.session.user = {
      id,
      email,
      displayName: displayName || 'User'
    };

    return res.json({ success: true, user: req.session.user });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${req.protocol}://${req.get('host')}/reset?token=`
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      success: true, 
      message: 'Password reset email sent. Please check your inbox.' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error logging out' });
    }
    res.json({ success: true });
  });
});

// Google OAuth callback
app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.redirect('/login?error=Google authentication failed');
    }

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      return res.redirect('/login?error=' + encodeURIComponent(error.message));
    }

    // Check if user has a custom display_name in the database
    let displayName = data.user.user_metadata?.full_name || 'User';
    try {
      const { data: profile } = await supabase
        .from('forum_user_profiles')
        .select('display_name')
        .eq('user_id', data.user.id)
        .single();
      
      if (profile?.display_name) {
        displayName = profile.display_name;
      }
    } catch (error) {
      console.log('No custom display name found, using Google Auth name');
    }

    // Set session
    req.session.user = {
      id: data.user.id,
      email: data.user.email,
      displayName: displayName
    };

    res.redirect('/dashboard');
  } catch (error) {
    res.redirect('/login?error=' + encodeURIComponent('Authentication failed'));
  }
});

// User routes
const userRoutes = require('../routes/user');
app.use('/user', userRoutes);

// Chat routes
const chatRoutes = require('./routes/chat');
app.use('/chat', chatRoutes);

// Sponsor routes
const sponsorRoutes = require('../routes/sponsor');
app.use('/api/sponsor', sponsorRoutes);

// Error handling middleware (must be last)
const errorHandler = require('../middleware/errorHandler');
app.use(errorHandler);

// Existing routes
app.post('/api/contact', (req, res) => {
  console.log('Received contact form submission:', req.body);
  res.json({ success: true, received: req.body });
});

// API endpoint to check and initialize forum tables
app.get('/api/forum/init', async (req, res) => {
  try {
    // Check if forum_posts table exists
    const { data: postsCheck, error: postsError } = await supabase
      .from('forum_posts')
      .select('count')
      .limit(1);
    
    if (postsError && postsError.code === '42P01') {
      // Table doesn't exist, create it
      console.log('Creating forum tables...');
      
      // Create forum_posts table
      const { error: createPostsError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS forum_posts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'General Discussion',
            tags TEXT[] DEFAULT '{}',
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            is_anonymous BOOLEAN DEFAULT false,
            upvotes INTEGER DEFAULT 0,
            downvotes INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (createPostsError) {
        console.error('Error creating forum_posts table:', createPostsError);
        return res.status(500).json({ error: 'Failed to create forum tables' });
      }
      
      // Create forum_comments table
      const { error: createCommentsError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS forum_comments (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (createCommentsError) {
        console.error('Error creating forum_comments table:', createCommentsError);
        return res.status(500).json({ error: 'Failed to create forum tables' });
      }
      
      // Create forum_user_profiles table
      const { error: createProfilesError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS forum_user_profiles (
            user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            display_name TEXT,
            avatar_url TEXT,
            sobriety_date DATE,
            bio TEXT,
            location TEXT DEFAULT 'Spokane, WA',
            privacy_level TEXT DEFAULT 'public',
            join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (createProfilesError) {
        console.error('Error creating forum_user_profiles table:', createProfilesError);
        return res.status(500).json({ error: 'Failed to create forum tables' });
      }
      
      console.log('Forum tables created successfully');
    }
    
    res.json({ success: true, message: 'Forum tables ready' });
  } catch (error) {
    console.error('Error initializing forum:', error);
    res.status(500).json({ error: 'Failed to initialize forum' });
  }
});

// API endpoint to get recent posts for dashboard
app.get('/api/dashboard/recent-activity', async (req, res) => {
  try {
    // Get recent posts
    const { data: posts, error: postsError } = await supabase
      .from('forum_posts')
      .select(`
        id,
        title,
        content,
        category,
        created_at,
        user_id,
        is_anonymous,
        upvotes,
        downvotes
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (postsError) {
      console.error('Error fetching posts:', postsError);
      return res.status(500).json({ error: 'Failed to fetch recent posts' });
    }
    
    // Get recent comments
    const { data: comments, error: commentsError } = await supabase
      .from('forum_comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        post_id
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      return res.status(500).json({ error: 'Failed to fetch recent comments' });
    }
    
    // Get user profiles for the posts and comments
    const userIds = new Set();
    posts.forEach(post => userIds.add(post.user_id));
    comments.forEach(comment => userIds.add(comment.user_id));
    
    const { data: profiles, error: profilesError } = await supabase
      .from('forum_user_profiles')
      .select('user_id, display_name, avatar_url')
      .in('user_id', Array.from(userIds));
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      // Continue without profiles
    }
    
    const profilesMap = {};
    if (profiles) {
      profiles.forEach(profile => {
        profilesMap[profile.user_id] = profile;
      });
    }
    
    // Enrich posts and comments with user info
    const enrichedPosts = posts.map(post => ({
      ...post,
      user_name: post.is_anonymous ? 'Anonymous User' : 
        (profilesMap[post.user_id]?.display_name || 'Unknown User'),
      content_preview: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '')
    }));
    
    const enrichedComments = comments.map(comment => ({
      ...comment,
      user_name: profilesMap[comment.user_id]?.display_name || 'Unknown User',
      content_preview: comment.content.substring(0, 100) + (comment.content.length > 100 ? '...' : '')
    }));
    
    res.json({
      success: true,
      recent_posts: enrichedPosts,
      recent_comments: enrichedComments
    });
    
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

// Initialize Socket.IO chat handler
const ChatSocketHandler = require('./socket');
const chatSocket = new ChatSocketHandler(server, supabaseUrl, supabaseAnonKey);

// Make chat socket available to routes
app.set('chatSocket', chatSocket);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log('Socket.IO chat server initialized');
}); 