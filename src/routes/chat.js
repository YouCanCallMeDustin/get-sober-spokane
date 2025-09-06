/**
 * Chat Room Routes
 * Handles chat room page rendering and API endpoints
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Chat room main page
router.get('/', async (req, res) => {
    // Add cache control headers for development
    if (process.env.NODE_ENV !== 'production') {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.set('Last-Modified', new Date().toUTCString());
        res.set('ETag', `"${Date.now()}-${Math.random().toString(36).substr(2, 9)}"`);
    }
    
    try {
        // Get current user from session or Supabase auth
        let currentUser = null;
        
        // First check Express session (this is where your login is stored)
        if (req.session.user) {
            // Get the user's profile from forum_user_profiles table (this has the actual user data)
            const { data: profile } = await supabase
                .from('profiles_consolidated')
                .select('display_name, avatar_url, bio, location')
                .eq('user_id', req.session.user.id)
                .single();
            
            currentUser = {
                id: req.session.user.id,
                email: req.session.user.email,
                username: profile?.display_name || req.session.user.display_name || req.session.user.username || req.session.user.email?.split('@')[0] || 'Anonymous',
                display_name: profile?.display_name || req.session.user.display_name || req.session.user.username,
                avatar_url: profile?.avatar_url || req.session.user.avatar_url,
                isAnonymous: false
            };
            console.log('✅ User found in session:', currentUser.username);
        }
        
        // If no session user, check Supabase auth (fallback)
        if (!currentUser) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                const { data: { user }, error } = await supabase.auth.getUser(token);
                if (user && !error) {
                    // Get user profile
                    const { data: profile } = await supabase
                        .from('profiles_consolidated')
                        .select('*')
                        .eq('user_id', user.id)
                        .single();
                    
                    currentUser = {
                        id: user.id,
                        email: user.email,
                        username: profile?.display_name || user.email?.split('@')[0] || 'Anonymous',
                        display_name: profile?.display_name,
                        avatar_url: profile?.avatar_url,
                        isAnonymous: false
                    };
                    console.log('✅ User found via Supabase auth:', currentUser.username);
                }
            }
        }
        
        // Fallback to anonymous user
        if (!currentUser) {
            currentUser = {
                id: null,
                username: 'Anonymous',
                display_name: 'Anonymous User',
                isAnonymous: true
            };
            console.log('⚠️  No user found, using Anonymous');
        }

        res.render('chat', {
            title: 'Live Chat Room - Get Sober Spokane',
            description: 'Join our live recovery support chat room. Connect with the community in real-time, share your journey, and find immediate support.',
            keywords: 'recovery chat, sobriety support chat, live recovery support, Spokane recovery chat, sober community chat',
            user: currentUser,
            timestamp: req.cacheBuster ? req.cacheBuster.timestamp : Date.now(),
            random: req.cacheBuster ? req.cacheBuster.random : Math.random().toString(36).substr(2, 9)
        });
    } catch (error) {
        console.error('Error in chat room route:', error);
        res.render('chat', {
            title: 'Live Chat Room - Get Sober Spokane',
            description: 'Join our live recovery support chat room. Connect with the community in real-time, share your journey, and find immediate support.',
            keywords: 'recovery chat, sobriety support chat, live recovery support, Spokane recovery chat, sober community chat',
            user: {
                id: null,
                username: 'Anonymous',
                display_name: 'Anonymous User',
                isAnonymous: true
            },
            timestamp: req.cacheBuster ? req.cacheBuster.timestamp : Date.now(),
            random: req.cacheBuster ? req.cacheBuster.random : Math.random().toString(36).substr(2, 9)
        });
    }
});

// Chat room statistics API
router.get('/stats', async (req, res) => {
    try {
        const chatSocket = req.app.get('chatSocket');
        const stats = chatSocket ? chatSocket.getStats() : {
            totalUsers: 0,
            totalRooms: 0,
            totalMessages: 0,
            activeConnections: 0
        };

        // Get rooms from database
        const { data: rooms, error: roomsError } = await supabase
            .from('chat_rooms')
            .select('*')
            .eq('is_active', true)
            .order('name');

        if (roomsError) {
            console.error('Error fetching rooms:', roomsError);
            return res.status(500).json({ error: 'Failed to fetch room statistics' });
        }

        // Get message counts for each room
        const roomsWithStats = await Promise.all(rooms.map(async (room) => {
            const { count: messageCount } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('room_id', room.id);

            const { count: userCount } = await supabase
                .from('user_presence')
                .select('*', { count: 'exact', head: true })
                .eq('room_id', room.id)
                .eq('status', 'online');

            return {
                id: room.name,
                name: room.name.charAt(0).toUpperCase() + room.name.slice(1) + ' Support',
                description: room.description,
                userCount: userCount || 0,
                messageCount: messageCount || 0
            };
        }));

        res.json({
            ...stats,
            rooms: roomsWithStats
        });
    } catch (error) {
        console.error('Error fetching chat statistics:', error);
        res.status(500).json({ error: 'Failed to fetch chat statistics' });
    }
});

// Chat room health check
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'chat',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Chat room settings
router.get('/settings', (req, res) => {
    res.json({
        maxMessageLength: 500,
        maxFileSize: '10MB',
        allowedFileTypes: [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'text/plain',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        moderation: {
            enabled: true,
            inappropriateWords: ['spam', 'scam', 'hack', 'crack', 'illegal', 'drugs', 'weapons'],
            maxMessagesPerMinute: 10
        }
    });
});

// Get room messages API
router.get('/room/:roomName/messages', async (req, res) => {
    try {
        const { roomName } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        // Get room ID
        const { data: room, error: roomError } = await supabase
            .from('chat_rooms')
            .select('id')
            .eq('name', roomName)
            .single();

        if (roomError || !room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Get messages
        const { data: messages, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('room_id', room.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (messagesError) {
            console.error('Error fetching messages:', messagesError);
            return res.status(500).json({ error: 'Failed to fetch messages' });
        }

        res.json(messages.reverse());
    } catch (error) {
        console.error('Error in get room messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Get online users for a room
router.get('/room/:roomName/users', async (req, res) => {
    try {
        const { roomName } = req.params;

        // Get room ID
        const { data: room, error: roomError } = await supabase
            .from('chat_rooms')
            .select('id')
            .eq('name', roomName)
            .single();

        if (roomError || !room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Get online users
        const { data: users, error: usersError } = await supabase
            .from('user_presence')
            .select('username, user_id, is_anonymous, status, last_seen')
            .eq('room_id', room.id)
            .eq('status', 'online')
            .order('username');

        if (usersError) {
            console.error('Error fetching online users:', usersError);
            return res.status(500).json({ error: 'Failed to fetch online users' });
        }

        res.json(users);
    } catch (error) {
        console.error('Error in get online users:', error);
        res.status(500).json({ error: 'Failed to fetch online users' });
    }
});

module.exports = router;
