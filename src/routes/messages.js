/**
 * Private Messaging Routes
 * Handles messaging page rendering and API endpoints
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client using Service Role to circumvent RLS where needed, 
// OR we can use Anon Key and rely on passed JWT for RLS if we wanted to enforce it.
// We will use the service role key to perform db operations securely on behalf of the session user, 
// as we enforce the session check in middleware.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware to ensure user is logged in
const requireAuth = async (req, res, next) => {
    let currentUser = null;
    
    // Check Express session
    if (req.session?.user) {
        currentUser = req.session.user;
    } else {
        // Check Bearer token as fallback
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const { data: { user }, error } = await supabase.auth.getUser(token);
            if (user && !error) {
                currentUser = user;
            }
        }
    }

    if (!currentUser) {
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ error: 'Unauthorized. Please log in.' });
        } else {
            return res.redirect('/login');
        }
    }

    req.user = currentUser;
    next();
};

// ==========================================
// VIEW ROUTES
// ==========================================

// Main messages UI
router.get('/', requireAuth, async (req, res) => {
    try {
        const { data: profile } = await supabase
            .from('profiles_consolidated')
            .select('display_name, avatar_url')
            .eq('user_id', req.user.id)
            .single();

        const currentUser = {
            id: req.user.id,
            email: req.user.email,
            username: profile?.display_name || req.user.display_name || req.user.email?.split('@')[0] || 'User',
            display_name: profile?.display_name || req.user.display_name,
            avatar_url: profile?.avatar_url || req.user.avatar_url
        };

        res.render('messages', {
            title: 'Private Messages - Get Sober Spokane',
            description: 'Your private conversations.',
            user: currentUser,
            timestamp: req.cacheBuster ? req.cacheBuster.timestamp : Date.now(),
            random: req.cacheBuster ? req.cacheBuster.random : Math.random().toString(36).substr(2, 9)
        });
    } catch (error) {
        console.error('Error rendering messages page:', error);
        res.status(500).send('An error occurred');
    }
});

// ==========================================
// API ROUTES
// ==========================================

// Get all active conversations for current user
router.get('/api/conversations', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch conversations where user is participant 1 or 2
        const { data: conversations, error } = await supabase
            .from('conversations')
            .select('*')
            .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
            .order('last_message_at', { ascending: false });

        if (error) {
            console.error('Error fetching conversations:', error);
            return res.status(500).json({ error: 'Failed to fetch conversations' });
        }

        // Enrich with participant details
        const enrichedConversations = await Promise.all(conversations.map(async (conv) => {
            const otherUserId = conv.participant_1_id === userId ? conv.participant_2_id : conv.participant_1_id;
            
            const { data: profile } = await supabase
                .from('profiles_consolidated')
                .select('display_name, avatar_url, user_id')
                .eq('user_id', otherUserId)
                .single();

            // Also get the last message preview
            const { data: lastMsg } = await supabase
                .from('private_messages')
                .select('content, is_read, sender_id')
                .eq('conversation_id', conv.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            return {
                id: conv.id,
                created_at: conv.created_at,
                last_message_at: conv.last_message_at,
                other_user: {
                    id: otherUserId,
                    display_name: profile?.display_name || 'Unknown User',
                    avatar_url: profile?.avatar_url || '/assets/images/default-avatar.png'
                },
                last_message: lastMsg ? {
                    content: lastMsg.content,
                    is_read: lastMsg.is_read,
                    is_mine: lastMsg.sender_id === userId
                } : null
            };
        }));

        res.json(enrichedConversations);
    } catch (error) {
        console.error('Error in /api/conversations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get messages for a specific conversation
router.get('/api/conversations/:id/messages', requireAuth, async (req, res) => {
    try {
        const conversationId = req.params.id;
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 50;

        // First verify the user is a participant
        const { data: conv, error: convError } = await supabase
            .from('conversations')
            .select('participant_1_id, participant_2_id')
            .eq('id', conversationId)
            .single();

        if (convError || !conv) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        if (conv.participant_1_id !== userId && conv.participant_2_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized to view this conversation' });
        }

        // Mark unread messages as read
        await supabase
            .from('private_messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .neq('sender_id', userId)
            .eq('is_read', false);

        // Fetch messages
        const { data: messages, error: msgError } = await supabase
            .from('private_messages')
            .select('id, sender_id, content, is_read, created_at')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (msgError) {
            console.error('Error fetching messages:', msgError);
            return res.status(500).json({ error: 'Failed to fetch messages' });
        }

        // Return chronological order
        res.json(messages.reverse());
    } catch (error) {
        console.error('Error in /api/conversations/:id/messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start a new conversation or get existing one
router.post('/api/start', requireAuth, async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const currentUserId = req.user.id;

        if (!targetUserId) {
            return res.status(400).json({ error: 'Missing target user ID' });
        }
        
        if (currentUserId === targetUserId) {
            return res.status(400).json({ error: 'Cannot start conversation with yourself' });
        }

        // Determine participant order
        const p1 = currentUserId < targetUserId ? currentUserId : targetUserId;
        const p2 = currentUserId < targetUserId ? targetUserId : currentUserId;

        // Check if conversation already exists
        const { data: existing, error: searchError } = await supabase
            .from('conversations')
            .select('id')
            .eq('participant_1_id', p1)
            .eq('participant_2_id', p2)
            .single();

        if (existing) {
            return res.json({ id: existing.id, message: 'Conversation exists' });
        }

        // Check if target user actually exists via profile mapping
        const { data: profile } = await supabase
            .from('profiles_consolidated')
            .select('user_id')
            .eq('user_id', targetUserId)
            .single();

        if (!profile) {
            return res.status(404).json({ error: 'Target user does not exist' });
        }

        // Create new conversation
        const { data: newConv, error: createError } = await supabase
            .from('conversations')
            .insert({ participant_1_id: p1, participant_2_id: p2 })
            .select('id')
            .single();

        if (createError) {
            console.error('Error creating conversation:', createError);
            return res.status(500).json({ error: 'Failed to create conversation' });
        }

        res.json({ id: newConv.id, message: 'Conversation created' });
    } catch (error) {
        console.error('Error in /api/start:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
