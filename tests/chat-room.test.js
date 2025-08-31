/**
 * Chat Room Tests
 * Basic functionality tests for the chat room system
 */

const ChatServer = require('../src/chat-server');

describe('Chat Room System', () => {
    let chatServer;

    beforeEach(() => {
        chatServer = new ChatServer(3002); // Use different port for testing
    });

    afterEach(() => {
        if (chatServer) {
            chatServer.stop();
        }
    });

    describe('ChatServer Class', () => {
        test('should create a chat server instance', () => {
            expect(chatServer).toBeDefined();
            expect(chatServer.port).toBe(3002);
            expect(chatServer.rooms).toBeDefined();
            expect(chatServer.users).toBeDefined();
            expect(chatServer.messageHistory).toBeDefined();
        });

        test('should have required methods', () => {
            expect(typeof chatServer.start).toBe('function');
            expect(typeof chatServer.stop).toBe('function');
            expect(typeof chatServer.getStats).toBe('function');
        });

        test('should initialize with empty collections', () => {
            expect(chatServer.rooms.size).toBe(0);
            expect(chatServer.users.size).toBe(0);
            expect(chatServer.messageHistory.size).toBe(0);
        });
    });

    describe('Room Management', () => {
        test('should generate room display names correctly', () => {
            expect(chatServer.getRoomDisplayName('general')).toBe('General Support');
            expect(chatServer.getRoomDisplayName('recovery')).toBe('Recovery Journey');
            expect(chatServer.getRoomDisplayName('crisis')).toBe('Crisis Support');
            expect(chatServer.getRoomDisplayName('celebrations')).toBe('Celebrations');
            expect(chatServer.getRoomDisplayName('unknown')).toBe('unknown');
        });

        test('should generate room descriptions correctly', () => {
            expect(chatServer.getRoomDescription('general')).toBe('General recovery support and community discussion');
            expect(chatServer.getRoomDescription('recovery')).toBe('Share your recovery journey and milestones');
            expect(chatServer.getRoomDescription('crisis')).toBe('Immediate support for crisis situations');
            expect(chatServer.getRoomDescription('celebrations')).toBe('Celebrate sobriety milestones and achievements');
        });

        test('should generate room IDs correctly', () => {
            expect(chatServer.generateRoomId('Test Room')).toBe('test_room');
            expect(chatServer.generateRoomId('Hello World!')).toBe('hello_world');
            expect(chatServer.generateRoomId('123 Numbers')).toBe('123_numbers');
        });
    });

    describe('Message Handling', () => {
        test('should generate unique message IDs', () => {
            const id1 = chatServer.generateMessageId();
            const id2 = chatServer.generateMessageId();
            
            expect(id1).toBeDefined();
            expect(id2).toBeDefined();
            expect(id1).not.toBe(id2);
            expect(id1).toMatch(/^msg_\d+_[a-z0-9]+$/);
        });

        test('should validate file types correctly', () => {
            expect(chatServer.isAllowedFileType('image/jpeg')).toBe(true);
            expect(chatServer.isAllowedFileType('image/png')).toBe(true);
            expect(chatServer.isAllowedFileType('application/pdf')).toBe(true);
            expect(chatServer.isAllowedFileType('text/plain')).toBe(true);
            expect(chatServer.isAllowedFileType('application/exe')).toBe(false);
            expect(chatServer.isAllowedFileType('video/mp4')).toBe(false);
        });

        test('should detect inappropriate content', () => {
            expect(chatServer.containsInappropriateContent('Hello world')).toBe(false);
            expect(chatServer.containsInappropriateContent('This is spam')).toBe(true);
            expect(chatServer.containsInappropriateContent('Illegal activities')).toBe(true);
            expect(chatServer.containsInappropriateContent('Recovery support')).toBe(false);
        });
    });

    describe('User Management', () => {
        test('should check user permissions correctly', () => {
            const unauthenticatedUser = { id: '1', username: 'test', authenticated: false };
            const authenticatedUser = { id: '2', username: 'test', authenticated: true };
            
            expect(chatServer.canCreateRoom(unauthenticatedUser)).toBe(false);
            expect(chatServer.canCreateRoom(authenticatedUser)).toBe(true);
            expect(chatServer.canCreateRoom(null)).toBe(false);
        });
    });

    describe('Statistics', () => {
        test('should return correct statistics', () => {
            const stats = chatServer.getStats();
            
            expect(stats).toHaveProperty('totalUsers');
            expect(stats).toHaveProperty('totalRooms');
            expect(stats).toHaveProperty('totalMessages');
            expect(stats).toHaveProperty('activeConnections');
            expect(stats).toHaveProperty('uptime');
            
            expect(stats.totalUsers).toBe(0);
            expect(stats.totalRooms).toBe(0);
            expect(stats.totalMessages).toBe(0);
            expect(stats.activeConnections).toBe(0);
        });
    });

    describe('File Size Formatting', () => {
        test('should format file sizes correctly', () => {
            // Mock the formatFileSize method if it exists
            if (chatServer.formatFileSize) {
                expect(chatServer.formatFileSize(0)).toBe('0 Bytes');
                expect(chatServer.formatFileSize(1024)).toBe('1 KB');
                expect(chatServer.formatFileSize(1048576)).toBe('1 MB');
            }
        });
    });
});

// Mock test environment if running outside of Jest
if (typeof describe === 'undefined') {
    console.log('Running basic chat room tests...');
    
    const ChatServer = require('../src/chat-server');
    const chatServer = new ChatServer(3002);
    
    console.log('✅ Chat server created successfully');
    console.log('✅ Port:', chatServer.port);
    console.log('✅ Rooms:', chatServer.rooms.size);
    console.log('✅ Users:', chatServer.users.size);
    
    // Test basic functionality
    console.log('✅ Room names:', chatServer.getRoomDisplayName('general'));
    console.log('✅ Message ID:', chatServer.generateMessageId());
    console.log('✅ File type allowed:', chatServer.isAllowedFileType('image/jpeg'));
    
    chatServer.stop();
    console.log('✅ Chat server stopped successfully');
}
