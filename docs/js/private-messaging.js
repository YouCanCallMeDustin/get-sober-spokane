/**
 * Private Messaging Client-side Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    if (!window.currentUser || !window.currentUser.id || window.currentUser.isAnonymous) {
        window.location.href = '/login';
        return;
    }

    // elements
    const conversationListEl = document.getElementById('conversationList');
    const emptyStateEl = document.getElementById('emptyState');
    const activeChatAreaEl = document.getElementById('activeChatArea');
    const chatUserNameEl = document.getElementById('chatUserName');
    const chatAvatarEl = document.getElementById('chatAvatar');
    const messagesContainerEl = document.getElementById('messagesContainer');
    const messageInputEl = document.getElementById('messageInput');
    const sendMessageBtnEl = document.getElementById('sendMessage');
    const typingIndicatorEl = document.getElementById('typingIndicator');

    let currentConversationId = null;
    let currentOtherUserId = null;
    let conversations = [];
    let socket = null;
    let typingTimeout = null;

    // Initialize Socket.io
    function initSocket() {
        socket = io({
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socket.on('connect', () => {
            console.log('Connected to chat server');
            if (currentConversationId) {
                joinRoom(currentConversationId);
            }
        });

        socket.on('newPrivateMessage', (message) => {
            if (message.conversationId === currentConversationId) {
                appendMessage(message);
                scrollToBottom();
                updateConversationPreview(message.conversationId, message);
            } else {
                updateConversationPreview(message.conversationId, message, true);
            }
        });

        socket.on('privateMessageNotification', (message) => {
            if (message.conversationId !== currentConversationId) {
                updateConversationPreview(message.conversationId, message, true);
            }
        });

        socket.on('privateUserTyping', (data) => {
            if (data.conversationId === currentConversationId) {
                if (data.isTyping) {
                    typingIndicatorEl.style.display = 'block';
                } else {
                    typingIndicatorEl.style.display = 'none';
                }
            }
        });
    }

    async function fetchConversations() {
        try {
            const res = await fetch('/api/conversations');
            if (res.ok) {
                conversations = await res.json();
                renderConversations();
            }
        } catch (e) {
            console.error('Failed to load conversations', e);
        }
    }

    function renderConversations() {
        conversationListEl.innerHTML = '';
        if (conversations.length === 0) {
            conversationListEl.innerHTML = '<div class="p-4 text-center text-muted">No conversations yet.</div>';
            return;
        }

        conversations.forEach(conv => {
            const item = document.createElement('div');
            item.className = 'conversation-item p-3 border-bottom ' + (conv.id === currentConversationId ? 'active bg-light' : '');
            item.style.cursor = 'pointer';
            
            const lastMsg = conv.last_message;
            let previewText = 'No messages yet';
            let unreadDot = '';
            
            if (lastMsg) {
                previewText = lastMsg.is_mine ? `You: ${lastMsg.content}` : lastMsg.content;
                if (!lastMsg.is_read && !lastMsg.is_mine) {
                    unreadDot = '<span class="badge bg-primary rounded-pill ms-auto" style="font-size: 0.6rem;">New</span>';
                    item.classList.add('fw-bold');
                }
            }

            item.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="${conv.other_user.avatar_url || '/assets/images/default-avatar.png'}" width="40" height="40" class="rounded-circle me-3" style="object-fit: cover;">
                    <div class="flex-grow-1 overflow-hidden">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <h6 class="mb-0 text-truncate" style="font-size: 0.95rem;">${conv.other_user.display_name}</h6>
                            ${unreadDot}
                        </div>
                        <small class="text-muted text-truncate d-block" style="font-size: 0.85rem;">${previewText}</small>
                    </div>
                </div>
            `;
            
            item.addEventListener('click', () => selectConversation(conv.id, conv.other_user));
            conversationListEl.appendChild(item);
        });
    }

    function updateConversationPreview(id, message, isUnread = false) {
        const conv = conversations.find(c => c.id === id);
        if (conv) {
            conv.last_message = {
                content: message.content,
                is_read: !isUnread,
                is_mine: message.sender_id === window.currentUser.id
            };
            conv.last_message_at = message.created_at;
            // Sort by latest message
            conversations.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
            renderConversations();
        } else {
            // Need to fetch full conversation update since we don't have it locally
            fetchConversations();
        }
    }

    async function selectConversation(id, otherUser) {
        if (currentConversationId && socket) {
            socket.emit('leavePrivateRoom', { conversationId: currentConversationId });
        }
        
        currentConversationId = id;
        currentOtherUserId = otherUser.id;
        
        // Update UI
        emptyStateEl.classList.add('d-none');
        activeChatAreaEl.classList.remove('d-none');
        chatUserNameEl.textContent = otherUser.display_name;
        chatAvatarEl.src = otherUser.avatar_url || '/assets/images/default-avatar.png';
        
        messageInputEl.disabled = false;
        sendMessageBtnEl.disabled = false;
        messageInputEl.focus();

        // Remove unread bold styling locally so we dont have to immediately re-fetch just for aesthetics
        const conv = conversations.find(c => c.id === id);
        if(conv && conv.last_message) conv.last_message.is_read = true;
        renderConversations(); 

        messagesContainerEl.innerHTML = '<div class="text-center p-4"><span class="spinner-border text-primary"></span></div>';
        try {
            const res = await fetch(`/api/conversations/${id}/messages`);
            if (res.ok) {
                const msgs = await res.json();
                messagesContainerEl.innerHTML = '';
                if(msgs.length === 0) {
                     messagesContainerEl.innerHTML = '<div class="text-center p-4 text-muted">No messages yet. Say hello!</div>';
                } else {
                     msgs.forEach(appendMessage);
                     scrollToBottom();
                }
            }
        } catch (e) {
            console.error(e);
            messagesContainerEl.innerHTML = '<div class="alert alert-danger m-3">Failed to load messages.</div>';
        }

        joinRoom(id);
    }

    function joinRoom(id) {
        if (socket && socket.connected) {
            socket.emit('joinPrivateRoom', {
                conversationId: id,
                user: window.currentUser
            });
        }
    }

    function appendMessage(message) {
        // remove empty state text if present
        if(messagesContainerEl.querySelector('.text-muted.text-center')) {
             messagesContainerEl.innerHTML = '';
        }

        const isMine = message.sender_id === window.currentUser.id;
        const div = document.createElement('div');
        div.className = `d-flex mb-3 ${isMine ? 'justify-content-end' : 'justify-content-start'}`;
        
        const bubble = document.createElement('div');
        bubble.className = `p-3 rounded-4 shadow-sm ${isMine ? 'bg-primary text-white' : 'bg-white text-dark border'}`;
        bubble.style.maxWidth = '75%';
        bubble.style.wordBreak = 'break-word';
        bubble.textContent = message.content;
        
        div.appendChild(bubble);
        messagesContainerEl.appendChild(div);
    }

    function scrollToBottom() {
        messagesContainerEl.scrollTop = messagesContainerEl.scrollHeight;
    }

    function sendMessage() {
        const content = messageInputEl.value.trim();
        if (!content || !currentConversationId) return;

        socket.emit('privateMessage', {
            conversationId: currentConversationId,
            content: content,
            targetUserId: currentOtherUserId
        });

        messageInputEl.value = '';
        messageInputEl.focus();
        socket.emit('privateTyping', { conversationId: currentConversationId, isTyping: false });
    }

    // Events
    messageInputEl.addEventListener('input', () => {
        if (!currentConversationId) return;
        socket.emit('privateTyping', { conversationId: currentConversationId, isTyping: true });
        
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit('privateTyping', { conversationId: currentConversationId, isTyping: false });
        }, 2000);
    });

    messageInputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    sendMessageBtnEl.addEventListener('click', sendMessage);

    // Bootstrap
    initSocket();
    fetchConversations();
});

window.startPrivateChat = async (targetUserId) => {
    try {
        const res = await fetch('/api/start', {
            method: 'POST',
            body: JSON.stringify({targetUserId}),
            headers: {'Content-Type': 'application/json'}
        });
        if (res.ok) {
             window.location.href = '/messages';
        }
    } catch(e) {
        console.error('Error starting chat', e);
    }
}
