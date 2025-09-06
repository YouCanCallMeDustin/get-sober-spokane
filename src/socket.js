/**
 * Socket.IO Chat Handler
 * Manages real-time chat functionality including rooms, messages, and user presence
 */

const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');

class ChatSocketHandler {
    constructor(server, supabaseUrl, supabaseAnonKey) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.NODE_ENV === 'production' ? false : "*",
                methods: ["GET", "POST"]
            }
        });
        
        this.supabase = createClient(supabaseUrl, supabaseAnonKey);
        this.roomUsers = new Map(); // Track users in each room
        this.users = new Map(); // Track socket connections
        
        this.setupSocketHandlers();
        this.startCleanupInterval();
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.id}`);
            
            // Initialize user data
            this.users.set(socket.id, {
                id: socket.id,
                username: 'Anonymous',
                room: null,
                online: true,
                connectedAt: new Date().toISOString(),
                userProfile: null,
                isAuthenticated: false
            });

            // Handle user joining a room
            socket.on('joinRoom', async (data) => {
                await this.handleJoinRoom(socket, data);
            });

            // Handle chat messages
            socket.on('chatMessage', async (data) => {
                await this.handleChatMessage(socket, data);
            });

            // Handle typing indicators
            socket.on('typing', (data) => {
                this.handleTyping(socket, data);
            });

            // Handle user leaving
            socket.on('leaveRoom', async (data) => {
                await this.handleLeaveRoom(socket, data);
            });

            // Handle request for online users
            socket.on('getOnlineUsers', async (data) => {
                await this.handleGetOnlineUsers(socket, data);
            });

            // Handle disconnection
            socket.on('disconnect', async () => {
                await this.handleDisconnect(socket);
            });
        });
    }

    async handleJoinRoom(socket, data) {
        try {
            const { room, user } = data;
            const userId = user?.id || null;
            const username = user?.username || user?.display_name || 'Anonymous';
            const isAnonymous = !userId;
            const provider = user?.provider || 'email';

            console.log(`User ${username} (${provider}) joining room: ${room}`);

            // Leave previous room if any
            if (this.users.get(socket.id)?.room) {
                await this.handleLeaveRoom(socket, { room: this.users.get(socket.id).room });
            }

            // Join the new room
            socket.join(room);

            // Update user data
            this.users.set(socket.id, {
                ...this.users.get(socket.id),
                username,
                room,
                userProfile: user,
                isAuthenticated: !!userId,
                provider: provider
            });

            // Get room info from database
            const { data: roomData, error: roomError } = await this.supabase
                .from('chat_rooms')
                .select('*')
                .eq('name', room)
                .single();

            if (roomError && roomError.code !== 'PGRST116') {
                console.error('Error fetching room data:', roomError);
            }

            // Update user presence in database
            await this.updateUserPresence(socket.id, room, username, userId, isAnonymous, 'online', provider);

            // Get recent messages for the room
            const messages = await this.getRoomMessages(room, 50);

            // Get online users for the room (with error handling)
            let onlineUsers = [];
            try {
                onlineUsers = await this.getOnlineUsers(room);
            } catch (error) {
                console.log('Warning: Could not fetch online users:', error.message);
                onlineUsers = [];
            }

            // Add user to room users list
            if (!this.roomUsers.has(room)) {
                this.roomUsers.set(room, new Set());
            }
            this.roomUsers.get(room).add(socket.id);

            // Send room info and recent messages to the user
            socket.emit('roomJoined', {
                room,
                roomInfo: {
                    name: room,
                    users: onlineUsers,
                    messages: messages
                },
                messages,
                user: {
                    id: userId,
                    username,
                    isAnonymous
                }
            });

            // Notify other users in the room
            socket.to(room).emit('userJoined', {
                username,
                userId,
                isAnonymous,
                timestamp: new Date().toISOString()
            });

            // Broadcast updated room info to all users in the room
            await this.broadcastRoomInfo(room);

        } catch (error) {
            console.error('Error in handleJoinRoom:', error);
            socket.emit('error', { message: 'Failed to join room' });
        }
    }

    async handleChatMessage(socket, data) {
        try {
            const { content, room, messageType = 'text' } = data;
            const user = this.users.get(socket.id);
            
            if (!user || !room) {
                socket.emit('error', { message: 'Invalid user or room' });
                return;
            }

            if (!content || content.trim().length === 0) {
                return;
            }

            const messageData = {
                room: room,
                user_id: user.userProfile?.id || null,
                content: content.trim(),
                timestamp: new Date().toISOString()
            };

            // Save message to database
            const { data: savedMessage, error: saveError } = await this.supabase
                .from('messages')
                .insert(messageData)
                .select()
                .single();

            if (saveError) {
                console.error('Error saving message:', saveError);
                socket.emit('chatError', { message: 'Failed to save message' });
                return;
            }

            // Update user's last seen
            await this.updateUserLastSeen(socket.id, room);

            // Broadcast message to all users in the room
            const messagePayload = {
                id: savedMessage.id,
                content: savedMessage.content,
                username: user.username,
                userId: savedMessage.user_id,
                isAnonymous: !user.isAuthenticated,
                messageType: messageType,
                timestamp: savedMessage.timestamp
            };

            this.io.to(room).emit('newMessage', messagePayload);

        } catch (error) {
            console.error('Error in handleChatMessage:', error);
            socket.emit('chatError', { message: 'Failed to send message' });
        }
    }

    handleTyping(socket, data) {
        const { room, isTyping } = data;
        const user = this.users.get(socket.id);
        
        if (user && room) {
            socket.to(room).emit('userTyping', {
                username: user.username,
                isTyping
            });
        }
    }

    async handleLeaveRoom(socket, data) {
        try {
            const { room } = data;
            const user = this.users.get(socket.id);
            
            if (user && room) {
                socket.leave(room);
                
                // Remove user from room users list
                if (this.roomUsers.has(room)) {
                    this.roomUsers.get(room).delete(socket.id);
                }
                
                // Update user presence to offline
                await this.updateUserPresence(socket.id, room, user.username, user.userProfile?.id, !user.isAuthenticated, 'offline', user.provider);
                
                // Notify other users
                socket.to(room).emit('userLeft', {
                    username: user.username,
                    userId: user.userProfile?.id,
                    timestamp: new Date().toISOString()
                });
                
                // Broadcast updated room info
                await this.broadcastRoomInfo(room);
                
                console.log(`User ${user.username} left room: ${room}`);
            }
        } catch (error) {
            console.error('Error in handleLeaveRoom:', error);
        }
    }

    async handleGetOnlineUsers(socket, data) {
        try {
            const { room } = data;
            const onlineUsers = await this.getOnlineUsers(room);
            
            // Send online users to the requesting socket
            socket.emit('onlineUsers', onlineUsers);
            
            console.log(`Sent ${onlineUsers.length} online users to socket ${socket.id} for room ${room}`);
        } catch (error) {
            console.error('Error in handleGetOnlineUsers:', error);
            socket.emit('onlineUsers', []);
        }
    }

    async handleDisconnect(socket) {
        try {
            const user = this.users.get(socket.id);
            
            if (user && user.room) {
                // Update user presence to offline
                await this.updateUserPresence(socket.id, user.room, user.username, user.userProfile?.id, !user.isAuthenticated, 'offline', user.provider);
                
                // Remove user from room users list
                if (this.roomUsers.has(user.room)) {
                    this.roomUsers.get(user.room).delete(socket.id);
                }
                
                // Notify other users
                socket.to(user.room).emit('userLeft', {
                    username: user.username,
                    userId: user.userProfile?.id,
                    timestamp: new Date().toISOString()
                });
                
                // Broadcast updated room info
                await this.broadcastRoomInfo(user.room);
            }
            
            // Remove user from memory
            this.users.delete(socket.id);
            
            console.log(`User disconnected: ${socket.id}`);
        } catch (error) {
            console.error('Error in handleDisconnect:', error);
        }
    }

    async updateUserPresence(socketId, room, username, userId, isAnonymous, status = 'online', provider = 'email') {
        try {
            const presenceData = {
                user_id: userId,
                room: room,
                username,
                status,
                socket_id: socketId,
                is_anonymous: isAnonymous,
                last_seen: new Date().toISOString()
            };

            console.log('Updating user presence:', { socketId, room, username, userId, isAnonymous, status });

            // For anonymous users, we need to handle the upsert differently since user_id is null
            if (isAnonymous || !userId) {
                // First, try to update existing record for this socket_id and room
                const { data: existingRecord, error: updateError } = await this.supabase
                    .from('user_presence')
                    .update(presenceData)
                    .eq('socket_id', socketId)
                    .eq('room', room)
                    .select()
                    .single();

                if (updateError && updateError.code !== 'PGRST116') {
                    console.error('Error updating anonymous user presence:', updateError);
                }

                // If no record was updated, insert a new one
                if (!existingRecord) {
                    const { error: insertError } = await this.supabase
                        .from('user_presence')
                        .insert(presenceData);

                    if (insertError) {
                        console.error('Error inserting anonymous user presence:', insertError);
                    } else {
                        console.log('Successfully inserted anonymous user presence');
                    }
                } else {
                    console.log('Successfully updated anonymous user presence');
                }
            } else {
                // For authenticated users, first try to update by socket_id and room
                const { data: existingRecord, error: updateError } = await this.supabase
                    .from('user_presence')
                    .update(presenceData)
                    .eq('socket_id', socketId)
                    .eq('room', room)
                    .select()
                    .single();

                if (updateError && updateError.code !== 'PGRST116') {
                    console.error('Error updating authenticated user presence:', updateError);
                }

                // If no record was updated, try upsert by user_id and room
                if (!existingRecord) {
                    const { error: upsertError } = await this.supabase
                        .from('user_presence')
                        .upsert(presenceData, { 
                            onConflict: 'user_id,room',
                            ignoreDuplicates: false 
                        });

                    if (upsertError) {
                        console.error('Error upserting authenticated user presence:', upsertError);
                    } else {
                        console.log('Successfully upserted authenticated user presence');
                    }
                } else {
                    console.log('Successfully updated authenticated user presence');
                }
            }
        } catch (error) {
            console.error('Error in updateUserPresence:', error);
        }
    }

    async updateUserLastSeen(socketId, room) {
        try {
            const { error } = await this.supabase
                .from('user_presence')
                .update({ 
                    last_seen: new Date().toISOString(),
                    status: 'online'
                })
                .eq('socket_id', socketId)
                .eq('room', room);

            if (error) {
                console.error('Error updating last seen:', error);
            }
        } catch (error) {
            console.error('Error in updateUserLastSeen:', error);
        }
    }

    async getRoomMessages(room, limit = 50) {
        try {
            // Get messages
            const { data: messages, error: messagesError } = await this.supabase
                .from('messages')
                .select('*')
                .eq('room', room)
                .order('timestamp', { ascending: false })
                .limit(limit);

            if (messagesError) {
                console.error('Error fetching messages:', messagesError);
                return [];
            }

            // Get usernames for each message by looking up user profiles
            const messagesWithUsernames = await Promise.all(
                messages.map(async (msg) => {
                    let username = 'Anonymous';
                    let isAnonymous = true;

                    if (msg.user_id) {
                        // First try to get username from profiles_consolidated table
                        const { data: profile } = await this.supabase
                            .from('profiles_consolidated')
                            .select('display_name, email')
                            .eq('user_id', msg.user_id)
                            .single();

                        if (profile?.display_name) {
                            username = profile.display_name;
                            isAnonymous = false;
                        } else if (profile?.email) {
                            // Fallback to email if no display name
                            username = profile.email.split('@')[0];
                            isAnonymous = false;
                        } else {
                            // Fallback: try to get from user presence table
                            const { data: presence } = await this.supabase
                                .from('user_presence')
                                .select('username, is_anonymous')
                                .eq('user_id', msg.user_id)
                                .eq('room', room)
                                .single();

                            if (presence) {
                                username = presence.username;
                                isAnonymous = presence.is_anonymous;
                            }
                        }
                    }

                    return {
                        id: msg.id,
                        content: msg.content,
                        username,
                        userId: msg.user_id,
                        isAnonymous,
                        messageType: 'text',
                        timestamp: msg.timestamp
                    };
                })
            );

            // Return messages in chronological order
            return messagesWithUsernames.reverse();

        } catch (error) {
            console.error('Error in getRoomMessages:', error);
            return [];
        }
    }

    async getOnlineUsers(room) {
        try {
            console.log(`Fetching online users for room: ${room}`);
            
            // Get online users for the room
            const { data: onlineUsers, error } = await this.supabase
                .from('user_presence')
                .select('username, user_id, status, socket_id, last_seen, is_anonymous')
                .eq('room', room)
                .eq('status', 'online')
                .order('username');

            if (error) {
                console.error('Error fetching online users:', error);
                return [];
            }

            console.log(`Found ${onlineUsers?.length || 0} online users in room ${room}:`, onlineUsers);

            // For authenticated users, try to get better usernames from profiles_consolidated
            const usersWithBetterNames = await Promise.all(
                onlineUsers.map(async (user) => {
                    let username = user.username;
                    
                    // If user is authenticated, try to get display name from profiles
                    if (user.user_id && !user.is_anonymous) {
                        const { data: profile } = await this.supabase
                            .from('profiles_consolidated')
                            .select('display_name, email')
                            .eq('user_id', user.user_id)
                            .single();

                        if (profile?.display_name) {
                            username = profile.display_name;
                        } else if (profile?.email) {
                            username = profile.email.split('@')[0];
                        }
                    }

                    return {
                        id: user.user_id,
                        username: username
                    };
                })
            );

            return usersWithBetterNames;

        } catch (error) {
            console.error('Error in getOnlineUsers:', error);
            return [];
        }
    }

    async broadcastRoomInfo(room) {
        try {
            const messages = await this.getRoomMessages(room, 50);
            let onlineUsers = [];
            try {
                onlineUsers = await this.getOnlineUsers(room);
            } catch (error) {
                console.log('Warning: Could not fetch online users in broadcast:', error.message);
                onlineUsers = [];
            }

            const roomInfo = {
                name: room,
                users: onlineUsers,
                messages: messages
            };

            // Broadcast to all users in the room
            this.io.to(room).emit('roomInfo', roomInfo);
            this.io.to(room).emit('onlineUsers', onlineUsers);

        } catch (error) {
            console.error('Error in broadcastRoomInfo:', error);
        }
    }

    startCleanupInterval() {
        // Clean up old presence records every hour
        setInterval(async () => {
            try {
                const { error } = await this.supabase.rpc('cleanup_old_presence');
                if (error) {
                    console.error('Error cleaning up old presence:', error);
                }
            } catch (error) {
                console.error('Error in cleanup interval:', error);
            }
        }, 60 * 60 * 1000); // 1 hour
    }

    // Public methods for external access
    getIO() {
        return this.io;
    }

    getStats() {
        return {
            totalUsers: this.users.size,
            totalRooms: this.roomUsers.size,
            activeConnections: this.io.engine.clientsCount
        };
    }
}

module.exports = ChatSocketHandler;
