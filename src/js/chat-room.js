/**
 * Chat Room JavaScript - Production Ready Real-time Chat Implementation
 * Handles WebSocket communication, UI interactions, and chat functionality
 */

class ChatRoom {
    constructor() {
        this.socket = null;
        this.currentRoom = 'general';
        this.username = 'Anonymous';
        this.isConnected = false;
        this.typingTimeout = null;
        this.messageHistory = new Map();
        this.onlineUsers = new Set();
        this.currentUser = window.currentUser || null;
        
        // Emoji categories with exactly 20 emojis each
        this.emojiCategories = {
            smileys: ['😊', '😄', '😃', '😀', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙'],
            animals: ['🐾', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🦆', '🦅'],
            food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', '🥬'],
            activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🏹', '🎣'],
            objects: ['💡', '🔦', '🕯️', '🪔', '🧭', '🕰️', '⏰', '⏲️', '⏱️', '🗓️', '📅', '📆', '🗑️', '📪', '📫', '📬', '📭', '📮', '📯', '📡'],
            symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️']
        };
        
        this.currentEmojiCategory = 'smileys';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeWebSocket();
        this.loadUserPreferences();
        this.populateEmojiGrid();
        this.updateConnectionStatus('Connecting...', 'connecting');
    }

    setupEventListeners() {
        // Message input and send
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendMessage');
        
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            messageInput.addEventListener('input', () => {
                this.updateCharacterCount();
                this.handleTyping();
            });
        }
        
        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }

        // Emoji picker
        const emojiPickerBtn = document.getElementById('emojiPicker');
        const emojiPickerModal = document.getElementById('emojiPickerModal');
        const closeEmojiPicker = document.getElementById('closeEmojiPicker');
        
        if (emojiPickerBtn) {
            emojiPickerBtn.addEventListener('click', () => {
                this.toggleEmojiPicker();
            });
        }
        
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
            attachFileBtn.addEventListener('click', () => this.handleFileAttachment());
        }

        // Room switching
        const roomItems = document.querySelectorAll('.room-item');
        roomItems.forEach(room => {
            room.addEventListener('click', (e) => {
                const roomElement = e.target.closest('.room-item');
                if (roomElement) {
                    this.switchRoom(roomElement.dataset.room);
                }
            });
        });

        // Settings
        const settingsBtn = document.getElementById('chatSettings');
        const saveSettingsBtn = document.getElementById('saveSettings');
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openSettings();
            });
        }
        
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        // Quick action buttons
        const shareResourceBtn = document.getElementById('shareResourceBtn');
        const requestSupportBtn = document.getElementById('requestSupportBtn');
        const reportIssueBtn = document.getElementById('reportIssueBtn');
        
        if (shareResourceBtn) {
            shareResourceBtn.addEventListener('click', () => this.shareResource());
        }
        
        if (requestSupportBtn) {
            requestSupportBtn.addEventListener('click', () => this.requestSupport());
        }
        
        if (reportIssueBtn) {
            reportIssueBtn.addEventListener('click', () => this.reportIssue());
        }

        // Sidebar toggle
        const toggleSidebarBtn = document.getElementById('toggleSidebar');
        if (toggleSidebarBtn) {
            toggleSidebarBtn.addEventListener('click', () => this.toggleSidebar());
        }
    }

    initializeWebSocket() {
        try {
            // Connect to Socket.IO server
            this.socket = io();

        this.socket.on('connect', () => {
                console.log('Connected to chat server');
            this.isConnected = true;
            this.updateConnectionStatus('Connected', 'connected');
                this.enableInputs();
                
                // Join the default room
            this.joinRoom(this.currentRoom);
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
            console.error('Error initializing WebSocket:', error);
            this.updateConnectionStatus('Connection Failed', 'error');
        }
    }

    joinRoom(roomName) {
        if (!this.socket || !this.isConnected) {
            console.error('Socket not connected');
            return;
        }
        
        console.log(`Joining room: ${roomName}`);
        
        // Prepare user data
        const userData = {
            id: this.currentUser?.id || null,
            username: this.currentUser?.display_name || this.currentUser?.username || 'Anonymous',
            display_name: this.currentUser?.display_name,
            avatar_url: this.currentUser?.avatar_url
        };
        
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
        this.updateCharacterCount();
        
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
        this.updateRoomInfo(data.roomInfo);
        this.loadMessageHistory(data.messages);
        this.updateRoomUI();
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
        this.updateOnlineUsersList();
    }

    handleUserLeft(data) {
        console.log('User left:', data);
        this.addSystemMessage(`${data.username} left the chat`);
        this.updateOnlineUsersList();
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
        
        // Leave current room
        if (this.socket && this.isConnected) {
            this.socket.emit('leaveRoom', { room: this.currentRoom });
        }

        // Update UI
        this.updateRoomSelection(roomName);
        this.clearMessages();
        
        // Join new room
        this.currentRoom = roomName;
        this.joinRoom(roomName);
    }

    updateRoomSelection(roomName) {
        // Remove active class from all rooms
        document.querySelectorAll('.room-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to selected room
        const selectedRoom = document.querySelector(`[data-room="${roomName}"]`);
        if (selectedRoom) {
            selectedRoom.classList.add('active');
        }
    }

    updateRoomInfo(roomInfo) {
        const roomNameElement = document.getElementById('currentRoomName');
        const roomDescriptionElement = document.getElementById('roomDescription');
        
        if (roomNameElement && roomInfo) {
            roomNameElement.textContent = roomInfo.name || this.currentRoom.charAt(0).toUpperCase() + this.currentRoom.slice(1) + ' Support';
        }
        
        if (roomDescriptionElement && roomInfo) {
            roomDescriptionElement.textContent = roomInfo.description || '';
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
                <span class="message-username">${message.username}</span>
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
        if (!onlineUsersContainer) return;
        
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

    clearMessages() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            // Keep the welcome message
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

    updateCharacterCount() {
        const messageInput = document.getElementById('messageInput');
        const charCount = document.getElementById('charCount');
        
        if (messageInput && charCount) {
            const count = messageInput.value.length;
            charCount.textContent = count;
            
            if (count > 450) {
                charCount.style.color = '#dc3545';
            } else if (count > 400) {
                charCount.style.color = '#ffc107';
            } else {
                charCount.style.color = '#6c757d';
            }
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
        this.currentEmojiCategory = category;
        this.populateEmojiGrid();
        
        // Update active category button
        document.querySelectorAll('.emoji-category').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-category="${category}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    populateEmojiGrid() {
        const emojiGrid = document.getElementById('emojiGrid');
        if (!emojiGrid) return;

        const emojis = this.emojiCategories[this.currentEmojiCategory] || [];
        emojiGrid.innerHTML = emojis.map(emoji => 
            `<button class="emoji-btn" onclick="chatRoom.insertEmoji('${emoji}')">${emoji}</button>`
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
            
            this.updateCharacterCount();
            messageInput.focus();
        }
        
        this.hideEmojiPicker();
    }

    // Settings functionality
    openSettings() {
        const settingsModal = new bootstrap.Modal(document.getElementById('chatSettingsModal'));
        settingsModal.show();
    }

    saveSettings() {
        const usernameInput = document.getElementById('usernameInput');
        const notificationToggle = document.getElementById('notificationToggle');
        const themeToggle = document.getElementById('themeToggle');
        
        const settings = {
            username: usernameInput?.value || this.username,
            notifications: notificationToggle?.checked || false,
            theme: themeToggle?.value || 'light'
        };
        
        // Save to localStorage
        localStorage.setItem('chatSettings', JSON.stringify(settings));
        
        // Update current username if changed
        if (settings.username !== this.username) {
            this.username = settings.username;
        }
        
        // Apply theme
        this.applyTheme(settings.theme);
        
        // Close modal
        const settingsModal = bootstrap.Modal.getInstance(document.getElementById('chatSettingsModal'));
        if (settingsModal) {
            settingsModal.hide();
        }
        
        this.showSuccess('Settings saved successfully');
    }

    loadUserPreferences() {
        try {
            const settings = JSON.parse(localStorage.getItem('chatSettings') || '{}');
            
            // Apply settings
            if (settings.theme) {
                this.applyTheme(settings.theme);
            }
            
            if (settings.username) {
                this.username = settings.username;
            }
            
            // Update UI elements
            const usernameInput = document.getElementById('usernameInput');
            const notificationToggle = document.getElementById('notificationToggle');
            const themeToggle = document.getElementById('themeToggle');
            
            if (usernameInput) usernameInput.value = this.username;
            if (notificationToggle) notificationToggle.checked = settings.notifications !== false;
            if (themeToggle) themeToggle.value = settings.theme || 'light';
            
        } catch (error) {
            console.error('Error loading user preferences:', error);
        }
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

    // Quick action handlers
    shareResource() {
        this.addSystemMessage('Resource sharing feature coming soon!');
    }

    requestSupport() {
        this.addSystemMessage('Support request feature coming soon!');
    }

    reportIssue() {
        this.addSystemMessage('Issue reporting feature coming soon!');
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.chat-sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
    }

    // File attachment (placeholder)
    handleFileAttachment() {
        this.addSystemMessage('File attachment feature coming soon!');
    }

    // Utility functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        // Simple error display - you can enhance this with a proper notification system
        console.error('Chat Error:', message);
        this.addSystemMessage(`Error: ${message}`);
    }

    showSuccess(message) {
        // Simple success display - you can enhance this with a proper notification system
        console.log('Success:', message);
    }

    playNotificationSound() {
        // Simple notification sound - you can enhance this with actual audio
        console.log('Playing notification sound');
    }
}

// Initialize chat room when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatRoom = new ChatRoom();
});
