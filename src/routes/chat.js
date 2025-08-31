/**
 * Chat Room Routes
 * Handles chat room page rendering and API endpoints
 */

const express = require('express');
const router = express.Router();
const path = require('path');

// Chat room main page
router.get('/', (req, res) => {
    res.render('chat-room', {
        title: 'Live Chat Room - Get Sober Spokane',
        description: 'Join our live recovery support chat room. Connect with the community in real-time, share your journey, and find immediate support.',
        keywords: 'recovery chat, sobriety support chat, live recovery support, Spokane recovery chat, sober community chat'
    });
});

// Chat room statistics API
router.get('/stats', (req, res) => {
    // This would typically fetch from the chat server
    // For now, return mock data
    res.json({
        totalUsers: 0,
        totalRooms: 4,
        totalMessages: 0,
        activeConnections: 0,
        rooms: [
            {
                id: 'general',
                name: 'General Support',
                description: 'General recovery support and community discussion',
                userCount: 0
            },
            {
                id: 'recovery',
                name: 'Recovery Journey',
                description: 'Share your recovery journey and milestones',
                userCount: 0
            },
            {
                id: 'crisis',
                name: 'Crisis Support',
                description: 'Immediate support for crisis situations',
                userCount: 0
            },
            {
                id: 'celebrations',
                name: 'Celebrations',
                description: 'Celebrate sobriety milestones and achievements',
                userCount: 0
            }
        ]
    });
});

// Chat room health check
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'chat-room',
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

module.exports = router;
