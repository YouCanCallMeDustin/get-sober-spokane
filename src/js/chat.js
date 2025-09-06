/**
 * Client-side Chat Script
 * Handles Socket.IO connection, room management, and real-time messaging
 */

class ChatClient {
    constructor() {
        this.socket = null;
        this.currentRoom = 'general';
        this.isConnected = false;
        this.typingTimeout = null;
        this.currentUser = window.currentUser || null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeSocket();
        this.updateConnectionStatus('Connecting...', 'connecting');
        
        // Wait for auth system to initialize before proceeding
        this.waitForAuthAndInitialize();
    }

    async waitForAuthAndInitialize() {
        // Wait for auth system to be ready
        let attempts = 0;
        const maxAttempts = 50; // Wait up to 5 seconds
        
        console.log('Chat: Waiting for auth system to initialize...');
        
        while (attempts < maxAttempts) {
            if (window.authManager && window.authManager.currentUser !== undefined) {
                console.log('Auth system ready, initializing chat...');
                this.currentUser = window.authManager.currentUser;
                console.log('Chat: Set current user to:', this.currentUser?.email);
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        // If we still don't have a user, try to get it from window.currentUser
        if (!this.currentUser && window.currentUser) {
            this.currentUser = window.currentUser;
            console.log('Chat: Got user from window.currentUser:', this.currentUser?.email);
        }
        
        // Additional check: try to get user from Supabase session directly
        if (!this.currentUser && window.authManager && window.authManager.supabase) {
            try {
                const { data: { session } } = await window.authManager.supabase.auth.getSession();
                if (session && session.user) {
                    this.currentUser = session.user;
                    console.log('Chat: Got user from Supabase session:', this.currentUser?.email);
                }
            } catch (error) {
                console.warn('Chat: Failed to get session from Supabase:', error);
            }
        }
        
        console.log('Chat: Final user state:', this.currentUser ? this.currentUser.email : 'No user');
        
        // Initialize room info for the default room
        this.updateRoomInfo();
        
        // Update room counts with real data
        this.updateRoomCounts();
        
        // Set up periodic room count updates (every 30 seconds)
        setInterval(() => {
            this.updateRoomCounts();
        }, 30000);
        
        // Set up periodic user state check (every 10 seconds)
        setInterval(() => {
            this.checkAndUpdateUser();
        }, 10000);
        
        // Set up periodic online users refresh (every 30 seconds)
        setInterval(() => {
            if (this.isConnected && this.currentRoom) {
                this.updateOnlineUsersList();
            }
        }, 30000);
        
        // Set up auth state change listener
        if (window.authManager) {
            window.authManager.onUserAuthenticated = (user) => {
                this.currentUser = user;
                console.log('Chat: User authenticated via callback:', user?.email);
                this.updateUserWelcome();
                if (this.isConnected && this.currentRoom) {
                    this.joinRoom(this.currentRoom);
                    // Update online users list after authentication
                    setTimeout(() => {
                        this.updateOnlineUsersList();
                    }, 1000);
                }
            };
            
            window.authManager.onUserSignedOut = () => {
                this.currentUser = null;
                console.log('Chat: User signed out via callback');
                this.showLoginPrompt();
                // Update online users list after sign out
                setTimeout(() => {
                    this.updateOnlineUsersList();
                }, 1000);
            };
        }
    }

    setupEventListeners() {
        // Send message button
        const sendButton = document.getElementById('sendMessage');
        if (sendButton) {
            sendButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
        }

        // Message input events (Enter key and typing)
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('input', () => {
                this.handleTyping();
                this.updateCharacterCount();
            });
            
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Room switching
        const roomButtons = document.querySelectorAll('[data-room]');
        roomButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const room = button.dataset.room;
                if (room && room !== this.currentRoom) {
                    this.switchRoom(room);
                }
            });
        });

        // Settings button
        const settingsBtn = document.getElementById('chatSettings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openSettings();
            });
        }

        // Save settings
        const saveSettingsBtn = document.getElementById('saveSettings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        // Emoji picker
        const emojiPickerBtn = document.getElementById('emojiPicker');
        if (emojiPickerBtn) {
            emojiPickerBtn.addEventListener('click', () => {
                this.toggleEmojiPicker();
            });
        }

        // Close emoji picker
        const closeEmojiPicker = document.getElementById('closeEmojiPicker');
        if (closeEmojiPicker) {
            closeEmojiPicker.addEventListener('click', () => {
                this.hideEmojiPicker();
            });
        }

        // Emoji category switching
        const emojiCategories = document.querySelectorAll('.emoji-category');
        emojiCategories.forEach(category => {
            category.addEventListener('click', (e) => {
                this.switchEmojiCategory(e.target.dataset.category);
            });
        });

        // File attachment
        const attachFileBtn = document.getElementById('attachFile');
        if (attachFileBtn) {
            attachFileBtn.addEventListener('click', () => {
                this.handleFileAttachment();
            });
        }

        // Sidebar toggle
        const toggleSidebarBtn = document.getElementById('toggleSidebar');
        if (toggleSidebarBtn) {
            toggleSidebarBtn.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
    }

    initializeSocket() {
        try {
            // Connect to Socket.IO server
            this.socket = io();
            
            this.socket.on('connect', () => {
                console.log('Connected to chat server');
                this.isConnected = true;
                this.updateConnectionStatus('Connected', 'connected');
                
                // Check for authenticated user when connecting
                this.checkAndUpdateUser();
                
                // Join the default room
                this.joinRoom(this.currentRoom);
                
                // Request initial online users list
                setTimeout(() => {
                    this.updateOnlineUsersList();
                }, 1000);
            });
            
            this.socket.on('disconnect', () => {
                console.log('Disconnected from chat server');
                this.isConnected = false;
                this.updateConnectionStatus('Disconnected', 'disconnected');
                this.disableInputs();
            });
            
            this.socket.on('connect_error', (error) => {
                console.error('Connection error:', error);
                this.updateConnectionStatus('Connection Error', 'error');
                this.disableInputs();
            });
            
            // Chat events
            this.socket.on('roomJoined', (data) => {
                this.handleRoomJoined(data);
            });
            
            this.socket.on('newMessage', (message) => {
                this.handleNewMessage(message);
            });
            
            this.socket.on('userJoined', (data) => {
                this.handleUserJoined(data);
            });
            
            this.socket.on('userLeft', (data) => {
                this.handleUserLeft(data);
            });
            
            this.socket.on('userTyping', (data) => {
                this.handleUserTyping(data);
            });
            
            this.socket.on('onlineUsers', (users) => {
                this.updateOnlineUsersList(users);
            });
            
            this.socket.on('error', (error) => {
                this.showError(error.message);
            });
            
        } catch (error) {
            console.error('Error initializing Socket.IO:', error);
            this.updateConnectionStatus('Connection Failed', 'error');
        }
    }

    joinRoom(roomName) {
        if (!this.socket || !this.isConnected) {
            console.error('Socket not connected');
            return;
        }
        
        console.log(`Joining room: ${roomName}`);
        
        // Get user data from multiple sources to ensure we have the authenticated user
        let user = this.currentUser || window.currentUser || window.authManager?.currentUser;
        
        // Prepare user data with proper fallbacks
        const userData = {
            id: user?.id || null,
            username: user?.user_metadata?.full_name || 
                     user?.user_metadata?.display_name || 
                     user?.user_metadata?.name || 
                     user?.email?.split('@')[0] || 
                     'Anonymous',
            display_name: user?.user_metadata?.full_name || 
                         user?.user_metadata?.display_name || 
                         user?.user_metadata?.name || 
                         user?.email?.split('@')[0] || 
                         'Anonymous',
            avatar_url: user?.user_metadata?.avatar_url || 
                       user?.user_metadata?.picture || 
                       null
        };
        
        console.log('Sending user data to server:', userData);
        
        this.socket.emit('joinRoom', {
            room: roomName,
            user: userData
        });
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const content = messageInput?.value?.trim();
        
        if (!content || !this.socket || !this.isConnected) {
            return;
        }
        
        // Clear input
        messageInput.value = '';
        
        // Send message via socket
        this.socket.emit('chatMessage', {
            content: content,
            room: this.currentRoom,
            messageType: 'text'
        });
    }

    handleRoomJoined(data) {
        console.log('Joined room:', data);
        
        this.currentRoom = data.room;
        this.updateRoomInfo(); // Call without parameters to use internal config
        this.loadMessageHistory(data.messages);
        this.updateRoomSelection(data.room);
        
        // Use the online users data from the roomJoined event
        const onlineUsers = data.roomInfo?.users || [];
        this.updateOnlineUsersList(onlineUsers);
    }

    handleNewMessage(message) {
        console.log('New message:', message);
        this.addMessageToUI(message);
        this.scrollToBottom();
        
        // Play notification sound if enabled
        if (this.getUserPreference('notifications', true)) {
            this.playNotificationSound();
        }
    }

    handleUserJoined(data) {
        console.log('User joined:', data);
        this.addSystemMessage(`${data.username} joined the chat`);
        // Request fresh online users data
        this.updateOnlineUsersList();
        this.updateRoomCounts(); // Update room counts when users join
    }

    handleUserLeft(data) {
        console.log('User left:', data);
        this.addSystemMessage(`${data.username} left the chat`);
        // Request fresh online users data
        this.updateOnlineUsersList();
        this.updateRoomCounts(); // Update room counts when users leave
    }

    handleUserTyping(data) {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            if (data.isTyping) {
                typingIndicator.style.display = 'block';
                typingIndicator.querySelector('span').textContent = `${data.username} is typing...`;
            } else {
                typingIndicator.style.display = 'none';
            }
        }
    }

    switchRoom(roomName) {
        if (roomName === this.currentRoom) {
            return;
        }
        
        console.log(`Switching from room ${this.currentRoom} to ${roomName}`);
        
        // Leave current room
        if (this.socket && this.isConnected) {
            this.socket.emit('leaveRoom', { room: this.currentRoom });
        }
        
        // Update UI
        this.updateRoomSelection(roomName);
        this.clearMessages();
        
        // Join new room
        this.currentRoom = roomName;
        
        // Update room header immediately
        this.updateRoomInfo();
        
        // Clear online users list while switching
        this.updateOnlineUsersList([]);
        
        this.joinRoom(roomName);
        
        // Update room counts and online users after switching
        setTimeout(() => {
            this.updateRoomCounts();
            this.updateOnlineUsersList(); // Request fresh online users for new room
        }, 500);
    }

    updateRoomSelection(roomName) {
        // Remove active class from all room buttons
        document.querySelectorAll('[data-room]').forEach(btn => {
            btn.classList.remove('active');
            // Ensure proper styling for non-active rooms
            btn.style.setProperty('background', 'white', 'important');
            btn.style.setProperty('color', '#007bff', 'important');
            btn.style.setProperty('border-color', 'rgba(0, 123, 255, 0.1)', 'important');
            btn.style.setProperty('box-shadow', 'none', 'important');
        });
        
        // Add active class to selected room
        const selectedRoom = document.querySelector(`[data-room="${roomName}"]`);
        if (selectedRoom) {
            selectedRoom.classList.add('active');
            // Force the correct active styling
            selectedRoom.style.setProperty('background', 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)', 'important');
            selectedRoom.style.setProperty('color', 'white', 'important');
            selectedRoom.style.setProperty('border-color', '#007bff', 'important');
            selectedRoom.style.setProperty('box-shadow', '0 6px 20px rgba(0, 123, 255, 0.4)', 'important');
            selectedRoom.style.setProperty('transform', 'translateX(3px)', 'important');
        }
    }

    updateRoomInfo(roomInfo) {
        const roomNameElement = document.getElementById('currentRoomName');
        const roomDescriptionElement = document.getElementById('roomDescription');
        
        // Define room names and descriptions
        const roomConfig = {
            'general': {
                name: 'General Support',
                description: 'General recovery support and community discussion'
            },
            'recovery': {
                name: 'Recovery Journey',
                description: 'Share your recovery journey and milestones'
            },
            'crisis': {
                name: 'Crisis Support',
                description: 'Immediate crisis support and emergency resources'
            },
            'celebrations': {
                name: 'Celebrations',
                description: 'Celebrate milestones and achievements together'
            }
        };
        
        const currentRoomConfig = roomConfig[this.currentRoom] || {
            name: this.currentRoom.charAt(0).toUpperCase() + this.currentRoom.slice(1) + ' Support',
            description: 'Community support and discussion'
        };
        
        if (roomNameElement) {
            roomNameElement.textContent = currentRoomConfig.name;
        }
        
        if (roomDescriptionElement) {
            roomDescriptionElement.textContent = currentRoomConfig.description;
        }
    }

    loadMessageHistory(messages) {
        this.clearMessages();
        
        if (messages && messages.length > 0) {
            messages.forEach(message => {
                this.addMessageToUI(message);
            });
        }
        
        this.scrollToBottom();
    }

    addMessageToUI(message) {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message-bubble';
        
        if (message.isAnonymous) {
            messageElement.classList.add('anonymous');
        }
        
        if (message.userId === this.currentUser?.id) {
            messageElement.classList.add('own-message');
        }
        
        const timestamp = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="message-username">${this.escapeHtml(message.username)}</span>
                <span class="message-time">${timestamp}</span>
            </div>
            <div class="message-content">
                ${this.escapeHtml(message.content)}
            </div>
        `;
        
        messagesContainer.appendChild(messageElement);
    }

    addSystemMessage(content) {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message-bubble system';
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageElement.innerHTML = `
            <div class="message-content">
                <em>${this.escapeHtml(content)}</em>
            </div>
            <div class="message-time">${timestamp}</div>
        `;
        
        messagesContainer.appendChild(messageElement);
    }

    updateOnlineUsersList(users) {
        const onlineUsersContainer = document.getElementById('onlineUsers');
        if (!onlineUsersContainer) {
            console.warn('Online users container not found');
            return;
        }
        
        // Remove loading state
        const loadingElement = onlineUsersContainer.querySelector('.loading-users');
        if (loadingElement) {
            loadingElement.remove();
        }
        
        // If no users parameter provided, show loading state and request fresh data
        if (users === undefined) {
            onlineUsersContainer.innerHTML = '<div class="loading-users"><i class="bi bi-arrow-clockwise spin"></i> Loading users...</div>';
            
            // Request fresh online users data from server
            if (this.socket && this.isConnected && this.currentRoom) {
                console.log('Requesting online users for room:', this.currentRoom);
                this.socket.emit('getOnlineUsers', { room: this.currentRoom });
                
                // Set a timeout to retry if no response
                setTimeout(() => {
                    const stillLoading = onlineUsersContainer.querySelector('.loading-users');
                    if (stillLoading) {
                        console.warn('Online users request timed out, retrying...');
                        this.socket.emit('getOnlineUsers', { room: this.currentRoom });
                    }
                }, 5000);
            } else {
                console.warn('Cannot request online users - socket not connected or no current room');
                onlineUsersContainer.innerHTML = '<div class="no-users">Connection issue</div>';
            }
            return;
        }
        
        console.log('Updating online users list with:', users);
        
        if (!users || users.length === 0) {
            onlineUsersContainer.innerHTML = '<div class="no-users">No users online</div>';
            return;
        }
        
        onlineUsersContainer.innerHTML = users.map(user => `
            <div class="user-item">
                <div class="user-avatar">
                    <i class="bi bi-person-circle"></i>
                </div>
                <div class="user-info">
                    <div class="user-name">${this.escapeHtml(user.username)}</div>
                    <div class="user-status">Online</div>
                </div>
            </div>
        `).join('');
    }

    updateConnectionStatus(status, type) {
        const statusElement = document.getElementById('connectionStatus');
        if (!statusElement) return;
        
        statusElement.textContent = status;
        statusElement.className = `status-indicator ${type}`;
    }

    enableInputs() {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendMessage');
        const attachFileBtn = document.getElementById('attachFile');
        const emojiPickerBtn = document.getElementById('emojiPicker');
        
        if (messageInput) messageInput.disabled = false;
        if (sendButton) sendButton.disabled = false;
        if (attachFileBtn) attachFileBtn.disabled = false;
        if (emojiPickerBtn) emojiPickerBtn.disabled = false;
    }

    disableInputs() {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendMessage');
        const attachFileBtn = document.getElementById('attachFile');
        const emojiPickerBtn = document.getElementById('emojiPicker');
        
        if (messageInput) messageInput.disabled = true;
        if (sendButton) sendButton.disabled = true;
        if (attachFileBtn) attachFileBtn.disabled = true;
        if (emojiPickerBtn) emojiPickerBtn.disabled = true;
    }

    updateUserWelcome() {
        if (this.currentUser) {
            const userWelcome = document.querySelector('.user-welcome');
            if (userWelcome) {
                const displayName = this.currentUser.user_metadata?.full_name || 
                                 this.currentUser.user_metadata?.display_name || 
                                 this.currentUser.user_metadata?.name || 
                                 this.currentUser.email?.split('@')[0] || 
                                 'User';
                userWelcome.innerHTML = `
                    <p>Welcome back, ${displayName}!</p>
                `;
            }
            this.enableInputs();
        } else {
            this.showLoginPrompt();
        }
    }

    showLoginPrompt() {
        // Update the user welcome message to show login prompt
        const userWelcome = document.querySelector('.user-welcome');
        if (userWelcome) {
            userWelcome.innerHTML = `
                <p>
                    You're chatting as Anonymous.
                    <a class="sign-in-link" href="/auth/login.html">Sign in</a>
                    to use your username.
                </p>
            `;
        }
        
        // Disable inputs for unauthenticated users
        this.disableInputs();
    }

    async checkAndUpdateUser() {
        // Check multiple sources for authenticated user
        const authUser = window.authManager?.currentUser;
        const windowUser = window.currentUser;
        
        console.log('Chat: Checking user sources:', {
            authManager: !!window.authManager,
            authUser: !!authUser,
            windowUser: !!windowUser,
            authUserEmail: authUser?.email,
            windowUserEmail: windowUser?.email
        });
        
        if (authUser) {
            this.currentUser = authUser;
            console.log('Chat: Updated user from authManager:', authUser.email);
            this.updateUserWelcome();
        } else if (windowUser) {
            this.currentUser = windowUser;
            console.log('Chat: Updated user from window.currentUser:', windowUser.email);
            this.updateUserWelcome();
        } else {
            // Try to get user from Supabase session directly
            if (window.authManager && window.authManager.supabase) {
                try {
                    const { data: { session } } = await window.authManager.supabase.auth.getSession();
                    if (session && session.user) {
                        this.currentUser = session.user;
                        console.log('Chat: Updated user from Supabase session:', session.user.email);
                        this.updateUserWelcome();
                        return;
                    }
                } catch (error) {
                    console.warn('Chat: Failed to get session from Supabase:', error);
                }
            }
            
            console.log('Chat: No authenticated user found');
            this.showLoginPrompt();
        }
    }

    clearMessages() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            // Keep the welcome message, remove only dynamic messages
            const welcomeMessage = messagesContainer.querySelector('.welcome-message');
            messagesContainer.innerHTML = '';
            if (welcomeMessage) {
                messagesContainer.appendChild(welcomeMessage);
            }
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    handleTyping() {
        if (!this.socket || !this.isConnected) return;
        
        // Clear existing timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        
        // Emit typing event
        this.socket.emit('typing', {
            room: this.currentRoom,
            isTyping: true
        });
        
        // Set timeout to stop typing indicator
        this.typingTimeout = setTimeout(() => {
            if (this.socket && this.isConnected) {
                this.socket.emit('typing', {
                    room: this.currentRoom,
                    isTyping: false
                });
            }
        }, 1000);
    }

    // Emoji picker functionality
    toggleEmojiPicker() {
        const emojiPicker = document.getElementById('emojiPickerModal');
        if (emojiPicker) {
            emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
        }
    }

    hideEmojiPicker() {
        const emojiPicker = document.getElementById('emojiPickerModal');
        if (emojiPicker) {
            emojiPicker.style.display = 'none';
        }
    }

    switchEmojiCategory(category) {
        // Update active category button
        document.querySelectorAll('.emoji-category').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-category="${category}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Populate emoji grid (simplified version)
        this.populateEmojiGrid(category);
    }

    populateEmojiGrid(category) {
        const emojiGrid = document.getElementById('emojiGrid');
        if (!emojiGrid) return;
        
        // Simple emoji sets for each category
        const emojiSets = {
            smileys: ['😊', '😄', '😃', '😀', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙'],
            animals: ['🐾', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🦆', '🦅'],
            food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', '🥬'],
            activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🏹', '🎣'],
            objects: ['💡', '🔦', '🕯️', '🪔', '🧭', '🕰️', '⏰', '⏲️', '⏱️', '🗓️', '📅', '📆', '🗑️', '📪', '📫', '📬', '📭', '📮', '📯', '📡'],
            symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️']
        };
        
        const emojis = emojiSets[category] || emojiSets.smileys;
        emojiGrid.innerHTML = emojis.map(emoji => 
            `<button class="emoji-btn" onclick="chatClient.insertEmoji('${emoji}')">${emoji}</button>`
        ).join('');
    }

    insertEmoji(emoji) {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            const cursorPos = messageInput.selectionStart;
            const textBefore = messageInput.value.substring(0, cursorPos);
            const textAfter = messageInput.value.substring(cursorPos);
            
            messageInput.value = textBefore + emoji + textAfter;
            messageInput.selectionStart = messageInput.selectionEnd = cursorPos + emoji.length;
            
            messageInput.focus();
        }
        
        this.hideEmojiPicker();
    }

    // Settings functionality
    openSettings() {
        const settingsModalElement = document.getElementById('chatSettingsModal');
        if (settingsModalElement) {
            // Check if Bootstrap is available
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                const settingsModal = new bootstrap.Modal(settingsModalElement);
                settingsModal.show();
            } else {
                // Fallback: just show the modal
                settingsModalElement.style.display = 'block';
                settingsModalElement.classList.add('show');
            }
        }
    }

    saveSettings() {
        const usernameInput = document.getElementById('usernameInput');
        const notificationToggle = document.getElementById('notificationToggle');
        const themeToggle = document.getElementById('themeToggle');
        
        const settings = {
            username: usernameInput?.value || 'Anonymous',
            notifications: notificationToggle?.checked || false,
            theme: themeToggle?.value || 'light'
        };
        
        // Save to localStorage
        localStorage.setItem('chatSettings', JSON.stringify(settings));
        
        // Apply theme
        this.applyTheme(settings.theme);
        
        // Close modal
        const settingsModalElement = document.getElementById('chatSettingsModal');
        if (settingsModalElement) {
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                const settingsModal = bootstrap.Modal.getInstance(settingsModalElement);
                if (settingsModal) {
                    settingsModal.hide();
                }
            } else {
                // Fallback: just hide the modal
                settingsModalElement.style.display = 'none';
                settingsModalElement.classList.remove('show');
            }
        }
        
        this.showSuccess('Settings saved successfully');
    }

    getUserPreference(key, defaultValue = null) {
        try {
            const settings = JSON.parse(localStorage.getItem('chatSettings') || '{}');
            return settings[key] !== undefined ? settings[key] : defaultValue;
        } catch (error) {
            return defaultValue;
        }
    }

    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
    }

    // File attachment (placeholder)
    handleFileAttachment() {
        this.addSystemMessage('File attachment feature coming soon!');
    }

    // Sidebar toggle
    toggleSidebar() {
        const sidebar = document.querySelector('.chat-sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
    }

    // Utility functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        console.error('Chat Error:', message);
        this.addSystemMessage(`Error: ${message}`);
    }

    showSuccess(message) {
        console.log('Success:', message);
    }

    updateCharacterCount() {
        const messageInput = document.getElementById('messageInput');
        const charCountElement = document.getElementById('charCount');
        
        if (messageInput && charCountElement) {
            const count = messageInput.value.length;
            charCountElement.textContent = count;
            
            // Add visual feedback for approaching limit
            if (count > 450) {
                charCountElement.style.color = '#dc3545';
            } else if (count > 400) {
                charCountElement.style.color = '#ffc107';
            } else {
                charCountElement.style.color = '';
            }
        }
    }

    playNotificationSound() {
        // Simple notification sound - you can enhance this with actual audio
        console.log('Playing notification sound');
    }

    // Update room counts with real data
    async updateRoomCounts() {
        try {
            // Fetch room statistics from the API
            const response = await fetch('/chat/stats');
            if (!response.ok) {
                throw new Error('Failed to fetch room stats');
            }
            
            const data = await response.json();
            
            if (data.rooms && Array.isArray(data.rooms)) {
                data.rooms.forEach(room => {
                    // Map the room name from the API to the data-room attribute
                    let roomKey = room.id;
                    
                    // Handle the case where room names might be different
                    if (roomKey === 'general') {
                        roomKey = 'general';
                    } else if (roomKey === 'recovery') {
                        roomKey = 'recovery';
                    } else if (roomKey === 'crisis') {
                        roomKey = 'crisis';
                    } else if (roomKey === 'celebrations') {
                        roomKey = 'celebrations';
                    }
                    
                    const roomElement = document.querySelector(`[data-room="${roomKey}"]`);
                    if (roomElement) {
                        const countElement = roomElement.querySelector('.room-count');
                        if (countElement) {
                            // Show the actual number of users in the room
                            countElement.textContent = room.userCount || 0;
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error updating room counts:', error);
            // Set all counts to 0 if there's an error
            document.querySelectorAll('.room-count').forEach(countElement => {
                countElement.textContent = '0';
            });
        }
    }
}

// Initialize chat client when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatClient = new ChatClient();
});
