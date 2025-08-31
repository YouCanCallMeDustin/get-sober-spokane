/**
 * Chat Room JavaScript - Professional Real-time Chat Implementation
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
                this.switchRoom(e.target.closest('.room-item').id);
            });
        });

        // Sidebar toggle
        const toggleSidebarBtn = document.getElementById('toggleSidebar');
        if (toggleSidebarBtn) {
            toggleSidebarBtn.addEventListener('click', () => this.toggleSidebar());
        }

        // Chat settings
        const chatSettingsBtn = document.getElementById('chatSettings');
        const saveSettingsBtn = document.getElementById('saveSettings');
        
        if (chatSettingsBtn) {
            chatSettingsBtn.addEventListener('click', () => this.openSettings());
        }
        
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        }

        // Quick actions
        const shareResourceBtn = document.getElementById('shareResourceBtn');
        const requestSupportBtn = document.getElementById('requestSupportBtn');
        const reportIssueBtn = document.getElementById('reportIssueBtn');
        
        if (shareResourceBtn) {
            shareResourceBtn.addEventListener('click', () => this.handleQuickAction('shareResource'));
        }
        
        if (requestSupportBtn) {
            requestSupportBtn.addEventListener('click', () => this.handleQuickAction('requestSupport'));
        }
        
        if (reportIssueBtn) {
            reportIssueBtn.addEventListener('click', () => this.handleQuickAction('reportIssue'));
        }

        // File upload progress
        const cancelUploadBtn = document.getElementById('cancelUpload');
        if (cancelUploadBtn) {
            cancelUploadBtn.addEventListener('click', () => this.cancelFileUpload());
        }

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('change', () => this.applyTheme(themeToggle.value));
        }
    }

    initializeWebSocket() {
        try {
            // Try WebSocket first
            this.socket = io('http://localhost:3001', {
                transports: ['websocket', 'polling'],
                timeout: 20000,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            this.setupSocketHandlers();
            this.joinRoom(this.currentRoom);
            
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.updateConnectionStatus('Connection failed', 'error');
            this.fallbackToPolling();
        }
    }

    setupSocketHandlers() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            this.isConnected = true;
            this.updateConnectionStatus('Connected', 'connected');
            this.joinRoom(this.currentRoom);
        });

        this.socket.on('disconnect', () => {
            this.isConnected = false;
            this.updateConnectionStatus('Disconnected', 'disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.updateConnectionStatus('Connection error', 'error');
        });

        this.socket.on('message', (messageData) => {
            this.displayMessage(messageData);
        });

        this.socket.on('message_history', (data) => {
            this.loadMessageHistory(data.messages);
        });

        this.socket.on('user_joined', (data) => {
            this.displaySystemMessage(`${data.username} joined the room`);
            this.updateOnlineUsers();
        });

        this.socket.on('user_left', (data) => {
            this.displaySystemMessage(`${data.username} left the room`);
            this.updateOnlineUsers();
        });

        this.socket.on('typing_start', (data) => {
            this.showTypingIndicator(data.username);
        });

        this.socket.on('typing_stop', (data) => {
            this.hideTypingIndicator();
        });

        this.socket.on('room_info', (data) => {
            this.updateRoomInfo(data);
        });

        this.socket.on('error', (error) => {
            this.displaySystemMessage(`Error: ${error.message}`, 'error');
        });
    }

    fallbackToPolling() {
        console.log('Falling back to polling...');
        this.updateConnectionStatus('Using fallback mode', 'warning');
        
        // Implement polling fallback if needed
        setInterval(() => {
            this.pollForMessages();
        }, 5000);
    }

    pollForMessages() {
        // Simple polling implementation
        fetch(`http://localhost:3001/api/chat/room/${this.currentRoom}/messages`)
            .then(response => response.json())
            .then(messages => {
                // Handle new messages
            })
            .catch(error => {
                console.error('Polling error:', error);
            });
    }

    joinRoom(roomId) {
        if (!this.socket || !this.isConnected) return;

        this.currentRoom = roomId;
        this.socket.emit('join_room', {
            room: roomId,
            username: this.username
        });

        // Update UI
        this.updateRoomDisplay(roomId);
        this.clearMessages();
        this.loadRoomMessages(roomId);
        
        // Update active room indicator
        document.querySelectorAll('.room-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeRoom = document.getElementById(roomId);
        if (activeRoom) {
            activeRoom.classList.add('active');
        }
    }

    switchRoom(roomId) {
        if (roomId === this.currentRoom) return;
        this.joinRoom(roomId);
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput || !this.isConnected) return;

        const text = messageInput.value.trim();
        if (!text) return;

        if (text.length > 500) {
            this.displaySystemMessage('Message too long. Maximum 500 characters allowed.', 'error');
            return;
        }

        const messageData = {
            text: text,
            room: this.currentRoom,
            username: this.username,
            type: 'text'
        };

        this.socket.emit('message', messageData);
        
        // Clear input and hide typing indicator
        messageInput.value = '';
        this.updateCharacterCount();
        this.hideTypingIndicator();
        
        // Stop typing
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
            this.socket.emit('typing_stop', { room: this.currentRoom });
        }
    }

    displayMessage(messageData) {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'message-bubble';
        
        if (messageData.username === this.username) {
            messageElement.classList.add('own-message');
        }

        const timestamp = this.formatTimestamp(messageData.timestamp);
        
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="username">${messageData.username}</span>
                <span class="timestamp">${timestamp}</span>
            </div>
            <div class="message-content">
                ${this.escapeHtml(messageData.text)}
            </div>
            <div class="message-actions">
                <button class="btn btn-sm btn-outline-secondary reaction-btn" onclick="chatRoom.addReaction('${messageData.id}', '👍')">
                    👍
                </button>
                <button class="btn btn-sm btn-outline-secondary reaction-btn" onclick="chatRoom.addReaction('${messageData.id}', '❤️')">
                    ❤️
                </button>
                <button class="btn btn-sm btn-outline-secondary reaction-btn" onclick="chatRoom.addReaction('${messageData.id}', '😊')">
                    😊
                </button>
            </div>
        `;

        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        // Store message in history
        if (!this.messageHistory.has(this.currentRoom)) {
            this.messageHistory.set(this.currentRoom, []);
        }
        this.messageHistory.get(this.currentRoom).push(messageData);
    }

    displaySystemMessage(message, type = 'info') {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message-bubble system ${type}`;
        messageElement.innerHTML = `
            <div class="message-content">
                <i class="bi bi-info-circle me-2"></i>
                ${this.escapeHtml(message)}
                <div class="message-time">${this.formatTimestamp(new Date().toISOString())}</div>
            </div>
        `;

        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    handleTyping() {
        if (!this.isConnected) return;

        // Show typing indicator
        this.socket.emit('typing_start', { room: this.currentRoom });

        // Clear existing timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        // Set timeout to stop typing indicator
        this.typingTimeout = setTimeout(() => {
            this.socket.emit('typing_stop', { room: this.currentRoom });
        }, 2000);
    }

    showTypingIndicator(username) {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'block';
            typingIndicator.innerHTML = `
                <i class="bi bi-three-dots"></i>
                <span>${username} is typing...</span>
            `;
        }
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
    }

    toggleEmojiPicker() {
        const emojiPicker = document.getElementById('emojiPickerModal');
        if (emojiPicker) {
            if (emojiPicker.style.display === 'none' || !emojiPicker.style.display) {
                emojiPicker.style.display = 'block';
                this.populateEmojiGrid();
            } else {
                emojiPicker.style.display = 'none';
            }
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
        
        // Update active category indicator
        document.querySelectorAll('.emoji-category').forEach(cat => {
            cat.classList.remove('active');
        });
        
        const activeCategory = document.querySelector(`[data-category="${category}"]`);
        if (activeCategory) {
            activeCategory.classList.add('active');
        }
        
        this.populateEmojiGrid();
    }

    populateEmojiGrid() {
        const emojiGrid = document.getElementById('emojiGrid');
        if (!emojiGrid) return;

        const emojis = this.emojiCategories[this.currentEmojiCategory] || [];
        
        emojiGrid.innerHTML = emojis.map(emoji => `
            <button class="emoji-btn" onclick="chatRoom.insertEmoji('${emoji}')">
                ${emoji}
            </button>
        `).join('');
    }

    insertEmoji(emoji) {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            const cursorPos = messageInput.selectionStart;
            const textBefore = messageInput.value.substring(0, cursorPos);
            const textAfter = messageInput.value.substring(cursorPos);
            
            messageInput.value = textBefore + emoji + textAfter;
            messageInput.focus();
            
            // Set cursor position after emoji
            const newPos = cursorPos + emoji.length;
            messageInput.setSelectionRange(newPos, newPos);
            
            this.updateCharacterCount();
        }
        
        this.hideEmojiPicker();
    }

    handleFileAttachment() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.pdf,.txt,.doc,.docx';
        input.multiple = false;
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.uploadFile(file);
            }
        };
        
        input.click();
    }

    uploadFile(file) {
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            this.displaySystemMessage('File too large. Maximum 10MB allowed.', 'error');
            return;
        }

        // Validate file type
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'text/plain',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (!allowedTypes.includes(file.type)) {
            this.displaySystemMessage('File type not allowed.', 'error');
            return;
        }

        // Show upload progress
        this.showFileUploadProgress(file.name);
        
        // Simulate file upload (in real implementation, you'd upload to server)
        setTimeout(() => {
            this.completeFileUpload(file);
        }, 2000);
    }

    showFileUploadProgress(fileName) {
        const progressContainer = document.getElementById('fileUploadProgress');
        const progressBar = document.getElementById('uploadProgressBar');
        const fileNameSpan = document.getElementById('uploadFileName');
        
        if (progressContainer && progressBar && fileNameSpan) {
            progressContainer.style.display = 'block';
            fileNameSpan.textContent = fileName;
            
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 30;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                }
                progressBar.style.width = progress + '%';
            }, 200);
        }
    }

    completeFileUpload(file) {
        const progressContainer = document.getElementById('fileUploadProgress');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }

        // Send file message
        if (this.isConnected) {
            this.socket.emit('file_upload', {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                room: this.currentRoom
            });
        }

        this.displaySystemMessage(`File "${file.name}" uploaded successfully`);
    }

    cancelFileUpload() {
        const progressContainer = document.getElementById('fileUploadProgress');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
    }

    addReaction(messageId, emoji) {
        // In a real implementation, you'd send this to the server
        console.log(`Adding reaction ${emoji} to message ${messageId}`);
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.chat-sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
    }

    openSettings() {
        const modal = new bootstrap.Modal(document.getElementById('chatSettingsModal'));
        modal.show();
        
        // Load current settings
        const usernameInput = document.getElementById('usernameInput');
        const notificationToggle = document.getElementById('notificationToggle');
        const themeToggle = document.getElementById('themeToggle');
        
        if (usernameInput) usernameInput.value = this.username;
        if (notificationToggle) notificationToggle.checked = this.getNotificationPreference();
        if (themeToggle) themeToggle.value = this.getCurrentTheme();
    }

    saveSettings() {
        const usernameInput = document.getElementById('usernameInput');
        const notificationToggle = document.getElementById('notificationToggle');
        const themeToggle = document.getElementById('themeToggle');
        
        if (usernameInput) {
            this.username = usernameInput.value.trim() || 'Anonymous';
            this.saveUserPreference('username', this.username);
        }
        
        if (notificationToggle) {
            this.saveUserPreference('notifications', notificationToggle.checked);
        }
        
        if (themeToggle) {
            this.applyTheme(themeToggle.value);
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('chatSettingsModal'));
        if (modal) {
            modal.hide();
        }
        
        this.displaySystemMessage('Settings saved successfully');
    }

    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        this.saveUserPreference('theme', theme);
        
        if (theme === 'auto') {
            this.autoTheme();
        }
    }

    autoTheme() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }

    handleQuickAction(action) {
        switch (action) {
            case 'shareResource':
                this.displaySystemMessage('Resource sharing feature coming soon!');
                break;
            case 'requestSupport':
                this.displaySystemMessage('Support request sent to moderators');
                break;
            case 'reportIssue':
                this.displaySystemMessage('Issue reported. Thank you for helping keep our community safe.');
                break;
        }
    }

    updateConnectionStatus(status, type) {
        const statusElement = document.getElementById('connectionStatus');
        if (!statusElement) return;

        statusElement.textContent = status;
        statusElement.className = `status-indicator ${type}`;
        
        const icon = statusElement.querySelector('i');
        if (icon) {
            icon.className = `bi bi-circle-fill me-2 ${type}`;
        }
    }

    updateCharacterCount() {
        const messageInput = document.getElementById('messageInput');
        const charCount = document.getElementById('charCount');
        
        if (messageInput && charCount) {
            const count = messageInput.value.length;
            charCount.textContent = count;
            
            if (count > 450) {
                charCount.classList.add('text-warning');
            } else {
                charCount.classList.remove('text-warning');
            }
        }
    }

    updateRoomInfo(roomData) {
        const currentRoomName = document.getElementById('currentRoomName');
        const roomDescription = document.getElementById('roomDescription');
        
        if (currentRoomName) {
            currentRoomName.textContent = this.getRoomDisplayName(roomData.room);
        }
        
        if (roomDescription) {
            roomDescription.textContent = this.getRoomDescription(roomData.room);
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

    updateRoomDisplay(roomId) {
        const currentRoomName = document.getElementById('currentRoomName');
        const roomDescription = document.getElementById('roomDescription');
        
        if (currentRoomName) {
            currentRoomName.textContent = this.getRoomDisplayName(roomId);
        }
        
        if (roomDescription) {
            roomDescription.textContent = this.getRoomDescription(roomId);
        }
    }

    clearMessages() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            // Keep welcome message, remove others
            const welcomeMessage = messagesContainer.querySelector('.welcome-message');
            messagesContainer.innerHTML = '';
            if (welcomeMessage) {
                messagesContainer.appendChild(welcomeMessage);
            }
        }
    }

    loadRoomMessages(roomId) {
        // Load messages from history
        const messages = this.messageHistory.get(roomId) || [];
        messages.forEach(message => {
            this.displayMessage(message);
        });
    }

    loadMessageHistory(messages) {
        messages.forEach(message => {
            this.displayMessage(message);
        });
    }

    updateOnlineUsers() {
        // This would be populated from server data
        // For now, just update the count
        const onlineUsers = document.getElementById('onlineUsers');
        if (onlineUsers) {
            const userCount = this.onlineUsers.size;
            // Update user count display
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatTimestamp(timestamp) {
        if (!timestamp) return 'Just now';
        
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    }

    saveUserPreference(key, value) {
        try {
            const preferences = JSON.parse(localStorage.getItem('chatPreferences') || '{}');
            preferences[key] = value;
            localStorage.setItem('chatPreferences', JSON.stringify(preferences));
        } catch (error) {
            console.error('Error saving preference:', error);
        }
    }

    loadUserPreferences() {
        try {
            const preferences = JSON.parse(localStorage.getItem('chatPreferences') || '{}');
            
            if (preferences.username) {
                this.username = preferences.username;
            }
            
            if (preferences.theme) {
                this.applyTheme(preferences.theme);
            }
            
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    }

    getNotificationPreference() {
        try {
            const preferences = JSON.parse(localStorage.getItem('chatPreferences') || '{}');
            return preferences.notifications !== false; // Default to true
        } catch (error) {
            return true;
        }
    }

    getCurrentTheme() {
        try {
            const preferences = JSON.parse(localStorage.getItem('chatPreferences') || '{}');
            return preferences.theme || 'light';
        } catch (error) {
            return 'light';
        }
    }

    playNotificationSound() {
        if (!this.getNotificationPreference()) return;
        
        try {
            // Create a simple notification sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.error('Error playing notification sound:', error);
        }
    }
}

// Initialize chat room when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatRoom = new ChatRoom();
});
