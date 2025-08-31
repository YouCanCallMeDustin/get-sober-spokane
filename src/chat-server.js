/**
 * Chat Server - WebSocket Server for Real-time Chat
 * Handles WebSocket connections and chat room management
 */

const { createServer } = require('http');
const { Server } = require('socket.io');
const express = require('express');
const path = require('path');

class ChatServer {
    constructor(port = 3001) {
        this.port = port;
        this.app = express();
        this.server = createServer(this.app);
        this.io = new Server(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        
        this.rooms = new Map();
        this.users = new Map();
        this.messageHistory = new Map();
        
        this.setupMiddleware();
        this.setupSocketHandlers();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, '..')));
        
        // CORS middleware
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            next();
        });
    }

    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'healthy', 
                timestamp: new Date().toISOString(),
                connections: this.io.engine.clientsCount,
                rooms: this.rooms.size,
                users: this.users.size
            });
        });

        // Chat statistics endpoint
        this.app.get('/api/chat/stats', (req, res) => {
            res.json({
                totalUsers: this.users.size,
                totalRooms: this.rooms.size,
                totalMessages: Array.from(this.messageHistory.values()).reduce((sum, messages) => sum + messages.length, 0),
                activeConnections: this.io.engine.clientsCount
            });
        });

        // Get room messages
        this.app.get('/api/chat/room/:roomId/messages', (req, res) => {
            const { roomId } = req.params;
            const messages = this.messageHistory.get(roomId) || [];
            res.json(messages);
        });

        // Get online users
        this.app.get('/api/chat/users/online', (req, res) => {
            const onlineUsers = Array.from(this.users.values()).filter(user => user.online);
            res.json(onlineUsers);
        });
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.id}`);
            
            // Store socket reference
            this.users.set(socket.id, {
                id: socket.id,
                username: 'Anonymous',
                room: null,
                online: true,
                connectedAt: new Date().toISOString(),
                userProfile: null, // Store user profile information
                isAuthenticated: false
            });

            // Handle user joining a room
            socket.on('join_room', (data) => {
                this.handleJoinRoom(socket, data);
            });

            // Handle messages
            socket.on('message', (data) => {
                this.handleMessage(socket, data);
            });

            // Handle typing indicators
            socket.on('typing_start', (data) => {
                this.handleTypingStart(socket, data);
            });

            socket.on('typing_stop', (data) => {
                this.handleTypingStop(socket, data);
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });

            // Handle user authentication
            socket.on('authenticate', (data) => {
                this.handleAuthentication(socket, data);
            });

            // Handle room creation
            socket.on('create_room', (data) => {
                this.handleCreateRoom(socket, data);
            });

            // Handle private messages
            socket.on('private_message', (data) => {
                this.handlePrivateMessage(socket, data);
            });

            // Handle file uploads
            socket.on('file_upload', (data) => {
                this.handleFileUpload(socket, data);
            });

            // Handle user status updates
            socket.on('update_status', (data) => {
                this.handleStatusUpdate(socket, data);
            });

            // Handle user profile updates
            socket.on('update_profile', (data) => {
                this.handleProfileUpdate(socket, data);
            });
        });
    }

    handleJoinRoom(socket, data) {
        const { room, username, userProfile } = data;
        const userId = socket.id;
        const user = this.users.get(userId);

        if (!user) return;

        // Leave previous room if any
        if (user.room && user.room !== room) {
            socket.leave(user.room);
            this.removeUserFromRoom(user.room, userId);
        }

        // Join new room
        socket.join(room);
        user.room = room;
        user.username = username || user.username;
        user.lastActivity = new Date().toISOString();
        
        // Update user profile information if provided
        if (userProfile) {
            user.userProfile = userProfile;
            user.isAuthenticated = userProfile.isAuthenticated || false;
            console.log(`User ${username} joined with profile:`, userProfile);
        }

        // Initialize room if it doesn't exist
        if (!this.rooms.has(room)) {
            this.rooms.set(room, {
                id: room,
                name: this.getRoomDisplayName(room),
                description: this.getRoomDescription(room),
                users: new Set(),
                createdAt: new Date().toISOString(),
                messageCount: 0
            });
        }

        // Add user to room
        const roomData = this.rooms.get(room);
        roomData.users.add(userId);

        // Notify other users in the room
        socket.to(room).emit('user_joined', {
            username: user.username,
            room: room,
            timestamp: new Date().toISOString()
        });

        // Send room info to the user
        socket.emit('room_info', {
            room: room,
            users: Array.from(roomData.users).map(id => this.users.get(id)).filter(Boolean),
            messageCount: roomData.messageCount
        });

        // Send recent message history
        const messages = this.messageHistory.get(room) || [];
        if (messages.length > 0) {
            socket.emit('message_history', {
                room: room,
                messages: messages.slice(-50) // Last 50 messages
            });
        }

        console.log(`User ${user.username} joined room: ${room}`);
    }

    handleMessage(socket, data) {
        const { text, room, username, type = 'text', userProfile } = data;
        const userId = socket.id;
        const user = this.users.get(userId);

        if (!user || !room || !text) return;

        // Update user profile if provided in message
        if (userProfile && !user.userProfile) {
            user.userProfile = userProfile;
            user.isAuthenticated = userProfile.isAuthenticated || false;
        }

        // Validate message
        if (text.length > 500) {
            socket.emit('error', { message: 'Message too long. Maximum 500 characters allowed.' });
            return;
        }

        // Check for inappropriate content (basic filtering)
        if (this.containsInappropriateContent(text)) {
            socket.emit('error', { message: 'Message contains inappropriate content.' });
            return;
        }

        const messageData = {
            id: this.generateMessageId(),
            text: text.trim(),
            room: room,
            username: username || user.username,
            userId: userId,
            type: type,
            timestamp: new Date().toISOString(),
            reactions: [],
            userProfile: user.userProfile || null // Include user profile in message
        };

        // Store message in history
        if (!this.messageHistory.has(room)) {
            this.messageHistory.set(room, []);
        }
        this.messageHistory.get(room).push(messageData);

        // Keep only last 1000 messages per room
        const roomMessages = this.messageHistory.get(room);
        if (roomMessages.length > 1000) {
            roomMessages.splice(0, roomMessages.length - 1000);
        }

        // Update room message count
        if (this.rooms.has(room)) {
            this.rooms.get(room).messageCount++;
        }

        // Broadcast message to all users in the room
        this.io.to(room).emit('message', messageData);

        // Log message for moderation
        this.logMessage(messageData);

        console.log(`Message in ${room} from ${messageData.username}: ${text.substring(0, 50)}...`);
    }

    handleTypingStart(socket, data) {
        const { room, username } = data;
        const userId = socket.id;
        const user = this.users.get(userId);

        if (!user || !room) return;

        // Broadcast typing indicator to other users in the room
        socket.to(room).emit('typing_start', {
            username: username || user.username,
            room: room
        });
    }

    handleTypingStop(socket, data) {
        const { room, username } = data;
        const userId = socket.id;
        const user = this.users.get(userId);

        if (!user || !room) return;

        // Broadcast typing stop to other users in the room
        socket.to(room).emit('typing_stop', {
            username: username || user.username,
            room: room
        });
    }

    handleDisconnect(socket) {
        const userId = socket.id;
        const user = this.users.get(userId);

        if (user) {
            // Notify other users in the room
            if (user.room) {
                socket.to(user.room).emit('user_left', {
                    username: user.username,
                    room: user.room,
                    timestamp: new Date().toISOString()
                });

                // Remove user from room
                this.removeUserFromRoom(user.room, userId);
            }

            // Remove user from users map
            this.users.delete(userId);
        }

        console.log(`User disconnected: ${socket.id}`);
    }

    handleAuthentication(socket, data) {
        const { token, username } = data;
        const userId = socket.id;
        const user = this.users.get(userId);

        if (user) {
            // In a real application, you would validate the token here
            user.username = username || 'Anonymous';
            user.authenticated = true;
            user.lastActivity = new Date().toISOString();

            socket.emit('authenticated', {
                success: true,
                username: user.username
            });
        }
    }

    handleCreateRoom(socket, data) {
        const { roomName, description, isPrivate = false } = data;
        const userId = socket.id;
        const user = this.users.get(userId);

        if (!user || !roomName) return;

        // Check if user has permission to create rooms
        if (!this.canCreateRoom(user)) {
            socket.emit('error', { message: 'You do not have permission to create rooms.' });
            return;
        }

        const roomId = this.generateRoomId(roomName);
        
        if (this.rooms.has(roomId)) {
            socket.emit('error', { message: 'Room already exists.' });
            return;
        }

        // Create new room
        const newRoom = {
            id: roomId,
            name: roomName,
            description: description || '',
            users: new Set([userId]),
            createdAt: new Date().toISOString(),
            createdBy: userId,
            isPrivate: isPrivate,
            messageCount: 0
        };

        this.rooms.set(roomId, newRoom);
        this.messageHistory.set(roomId, []);

        // Join the user to the new room
        socket.join(roomId);
        user.room = roomId;

        // Notify all users about new room
        this.io.emit('room_created', {
            room: newRoom,
            createdBy: user.username
        });

        console.log(`New room created: ${roomName} by ${user.username}`);
    }

    handlePrivateMessage(socket, data) {
        const { toUserId, message } = data;
        const fromUserId = socket.id;
        const fromUser = this.users.get(fromUserId);
        const toUser = this.users.get(toUserId);

        if (!fromUser || !toUser || !message) return;

        // Check if users are online
        if (!toUser.online) {
            socket.emit('error', { message: 'User is not online.' });
            return;
        }

        const privateMessage = {
            id: this.generateMessageId(),
            from: fromUserId,
            to: toUserId,
            text: message,
            timestamp: new Date().toISOString(),
            type: 'private'
        };

        // Send to recipient
        this.io.to(toUserId).emit('private_message', {
            ...privateMessage,
            fromUsername: fromUser.username
        });

        // Send confirmation to sender
        socket.emit('private_message_sent', {
            ...privateMessage,
            toUsername: toUser.username
        });
    }

    handleFileUpload(socket, data) {
        const { fileName, fileSize, fileType, room } = data;
        const userId = socket.id;
        const user = this.users.get(userId);

        if (!user || !room || !fileName) return;

        // Validate file size (max 10MB)
        if (fileSize > 10 * 1024 * 1024) {
            socket.emit('error', { message: 'File too large. Maximum 10MB allowed.' });
            return;
        }

        // Validate file type
        if (!this.isAllowedFileType(fileType)) {
            socket.emit('error', { message: 'File type not allowed.' });
            return;
        }

        const fileMessage = {
            id: this.generateMessageId(),
            text: `📎 Shared file: ${fileName}`,
            room: room,
            username: user.username,
            userId: userId,
            type: 'file',
            fileName: fileName,
            fileSize: fileSize,
            fileType: fileType,
            timestamp: new Date().toISOString(),
            reactions: []
        };

        // Store message in history
        if (!this.messageHistory.has(room)) {
            this.messageHistory.set(room, []);
        }
        this.messageHistory.get(room).push(fileMessage);

        // Broadcast file message to all users in the room
        this.io.to(room).emit('message', fileMessage);

        console.log(`File shared in ${room}: ${fileName} by ${user.username}`);
    }

    handleStatusUpdate(socket, data) {
        const { status, customStatus } = data;
        const userId = socket.id;
        const user = this.users.get(userId);

        if (!user) return;

        user.status = status || 'online';
        user.customStatus = customStatus;
        user.lastActivity = new Date().toISOString();

        // Notify other users in the same room
        if (user.room) {
            socket.to(user.room).emit('user_status_updated', {
                userId: userId,
                username: user.username,
                status: user.status,
                customStatus: user.customStatus
            });
        }
    }

    handleProfileUpdate(socket, data) {
        const { userProfile } = data;
        const userId = socket.id;
        const user = this.users.get(userId);

        if (!user || !userProfile) return;

        // Update user profile information
        user.userProfile = userProfile;
        user.isAuthenticated = userProfile.isAuthenticated || false;
        user.username = userProfile.displayName || user.username;
        user.lastActivity = new Date().toISOString();

        console.log(`User profile updated for ${user.username}:`, userProfile);

        // Notify other users in the room about the profile update
        if (user.room) {
            socket.to(user.room).emit('user_profile_updated', {
                username: user.username,
                userProfile: userProfile,
                timestamp: new Date().toISOString()
            });
        }
    }

    removeUserFromRoom(roomId, userId) {
        if (this.rooms.has(roomId)) {
            const room = this.rooms.get(roomId);
            room.users.delete(userId);

            // Remove room if empty
            if (room.users.size === 0) {
                this.rooms.delete(roomId);
                this.messageHistory.delete(roomId);
                console.log(`Room ${roomId} removed (empty)`);
            }
        }
    }

    getRoomDisplayName(roomId) {
        const roomNames = {
            general: 'General Support',
            recovery: 'Recovery Journey',
            crisis: 'Crisis Support',
            celebrations: 'Celebrations'
        };
        return roomNames[roomId] || roomId;
    }

    getRoomDescription(roomId) {
        const descriptions = {
            general: 'General recovery support and community discussion',
            recovery: 'Share your recovery journey and milestones',
            crisis: 'Immediate support for crisis situations',
            celebrations: 'Celebrate sobriety milestones and achievements'
        };
        return descriptions[roomId] || 'Community discussion';
    }

    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateRoomId(roomName) {
        return roomName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    canCreateRoom(user) {
        // Basic permission check - in a real app, you'd check user roles
        return user && user.authenticated;
    }

    isAllowedFileType(fileType) {
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'text/plain',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        return allowedTypes.includes(fileType);
    }

    containsInappropriateContent(text) {
        // Basic content filtering - in a real app, you'd use more sophisticated filtering
        const inappropriateWords = [
            'spam', 'scam', 'hack', 'crack', 'illegal', 'drugs', 'weapons'
        ];
        
        const lowerText = text.toLowerCase();
        return inappropriateWords.some(word => lowerText.includes(word));
    }

    logMessage(messageData) {
        // Log message for moderation purposes
        // In a real app, you'd store this in a database
        console.log(`[${messageData.timestamp}] ${messageData.username} in ${messageData.room}: ${messageData.text}`);
    }

    getStats() {
        return {
            totalUsers: this.users.size,
            totalRooms: this.rooms.size,
            totalMessages: Array.from(this.messageHistory.values()).reduce((sum, messages) => sum + messages.length, 0),
            activeConnections: this.io.engine.clientsCount,
            uptime: process.uptime()
        };
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`Chat server running on port ${this.port}`);
            console.log(`Health check: http://localhost:${this.port}/health`);
            console.log(`Chat stats: http://localhost:${this.port}/api/chat/stats`);
        });
    }

    stop() {
        this.io.close();
        this.server.close();
        console.log('Chat server stopped');
    }
}

// Export the ChatServer class
module.exports = ChatServer;

// If running directly, start the server
if (require.main === module) {
    const chatServer = new ChatServer(process.env.CHAT_PORT || 3001);
    chatServer.start();

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\nReceived SIGINT. Shutting down gracefully...');
        chatServer.stop();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\nReceived SIGTERM. Shutting down gracefully...');
        chatServer.stop();
        process.exit(0);
    });
}
