require('dotenv').config();
console.log('Starting server...');

const express = require('express');
const session = require('express-session');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const morgan = require('morgan');

const app = express();
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

app.use(express.static(path.join(__dirname, 'docs')));

// Serve CSS files
app.use('/css', express.static(path.join(__dirname, 'src/scss')));
app.use('/assets', express.static(path.join(__dirname, 'src/assets')));
app.use('/js', express.static(path.join(__dirname, 'src/js')));

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
app.set('views', path.join(__dirname, 'src/pug'));

// Expose client-safe environment variables for frontend initialization
app.get('/env.js', (req, res) => {
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

// Support both /dashboard (SSR) and /dashboard.html (static) paths
app.get(['/dashboard', '/dashboard.html'], requireAuth, (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard - Sober Spokane',
    user: req.session.user
  });
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

    // Set session
    req.session.user = {
      id: data.user.id,
      email: data.user.email,
      displayName: data.user.user_metadata?.full_name || 'User'
    };

    res.redirect('/dashboard');
  } catch (error) {
    res.redirect('/login?error=' + encodeURIComponent('Authentication failed'));
  }
});

// User routes
const userRoutes = require('./routes/user');
app.use('/user', userRoutes);

// Error handling middleware (must be last)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Existing routes
app.post('/api/contact', (req, res) => {
  console.log('Received contact form submission:', req.body);
  res.json({ success: true, received: req.body });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Supabase URL: ${supabaseUrl}`);
}); 