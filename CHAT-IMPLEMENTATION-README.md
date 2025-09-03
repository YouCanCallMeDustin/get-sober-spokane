# Chat Room Implementation - Production Ready

This document describes the production-ready chat room implementation for the Sober Spokane project.

## 🚀 Quick Start

1. **Set up the database:**
   ```bash
   npm run setup:chat
   ```

2. **Start the server:**
   ```bash
   npm run start:server
   ```

3. **Visit the chat room:**
   ```
   http://localhost:3000/chat
   ```

## 📁 Project Structure

```
src/
├── socket.js                 # Socket.IO chat handler
├── routes/
│   └── chat.js              # Chat routes and API endpoints
├── pug/
│   └── chat-room.pug        # Chat room template
└── js/
    └── chat-room.js         # Client-side chat functionality

database/
└── schemas/
    └── chat-schema.sql      # Database schema for chat tables

scripts/
└── setup-chat-db.js         # Database setup script
```

## 🗄️ Database Schema

The chat system uses three main tables:

### `chat_rooms`
- `id` (UUID, Primary Key)
- `name` (TEXT, Unique)
- `description` (TEXT)
- `is_active` (BOOLEAN)
- `max_users` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `messages`
- `id` (UUID, Primary Key)
- `room_id` (UUID, Foreign Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `username` (TEXT)
- `content` (TEXT)
- `message_type` (TEXT: 'text', 'system', 'file', 'emoji')
- `file_url` (TEXT, optional)
- `file_name` (TEXT, optional)
- `file_size` (INTEGER, optional)
- `is_anonymous` (BOOLEAN)
- `created_at` (TIMESTAMP)

### `user_presence`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `room_id` (UUID, Foreign Key)
- `username` (TEXT)
- `status` (TEXT: 'online', 'away', 'offline')
- `last_seen` (TIMESTAMP)
- `socket_id` (TEXT)
- `is_anonymous` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🔧 Backend Implementation

### Socket.IO Handler (`src/socket.js`)

The `ChatSocketHandler` class manages all real-time chat functionality:

- **Connection Management**: Handles user connections and disconnections
- **Room Management**: Users can join/leave rooms
- **Message Handling**: Sends and receives messages in real-time
- **User Presence**: Tracks online users and their status
- **Database Integration**: Persists messages and user presence

#### Key Methods:
- `handleJoinRoom()`: User joins a chat room
- `handleChatMessage()`: Processes and broadcasts messages
- `handleTyping()`: Manages typing indicators
- `updateUserPresence()`: Updates user online status
- `getRoomMessages()`: Retrieves message history

### Chat Routes (`src/routes/chat.js`)

Provides HTTP endpoints for chat functionality:

- `GET /chat`: Renders the chat room page
- `GET /chat/stats`: Returns chat statistics
- `GET /chat/room/:roomName/messages`: Gets room messages
- `GET /chat/room/:roomName/users`: Gets online users

## 🎨 Frontend Implementation

### Pug Template (`src/pug/chat-room.pug`)

The chat room template includes:

- **Hero Section**: Welcome message and connection status
- **Sidebar**: Online users, room selection, quick actions
- **Main Chat Area**: Message display and input
- **Modals**: Settings, emoji picker, file preview

### Client JavaScript (`src/js/chat-room.js`)

The `ChatRoom` class handles all client-side functionality:

#### Key Features:
- **WebSocket Connection**: Connects to Socket.IO server
- **Real-time Messaging**: Sends and receives messages instantly
- **Room Switching**: Users can switch between chat rooms
- **User Interface**: Manages UI updates and interactions
- **Settings Management**: User preferences and theme
- **Emoji Support**: Built-in emoji picker
- **Typing Indicators**: Shows when users are typing

#### Key Methods:
- `initializeWebSocket()`: Establishes Socket.IO connection
- `joinRoom()`: Joins a chat room
- `sendMessage()`: Sends a message
- `handleNewMessage()`: Processes incoming messages
- `updateOnlineUsersList()`: Updates online users display

## 🔐 Authentication & User Management

### User Detection
The system detects users through multiple methods:

1. **Supabase Auth**: Primary authentication method
2. **Express Sessions**: Fallback for session-based auth
3. **Anonymous Users**: Fallback for unauthenticated users

### User Data Flow
1. User visits `/chat`
2. Server checks for authenticated user
3. User data is passed to the template
4. Client-side JavaScript receives user data
5. Socket.IO connection includes user information

## 🎯 Chat Rooms

### Default Rooms
- **General Support**: General recovery support and community discussion
- **Recovery Journey**: Share your recovery journey and milestones
- **Crisis Support**: Immediate support for crisis situations
- **Celebrations**: Celebrate sobriety milestones and achievements

### Room Features
- **Message History**: Each room maintains its own message history
- **User Separation**: Users in different rooms don't see each other's messages
- **Room-specific Presence**: Online users are tracked per room
- **Room Information**: Each room has a name and description

## 🔄 Real-time Features

### Message Broadcasting
1. User types and sends a message
2. Client emits `chatMessage` event
3. Server processes and saves to database
4. Server broadcasts `newMessage` to all users in the room
5. All clients receive and display the message

### User Presence
1. User joins a room
2. Server updates user presence in database
3. Server broadcasts `userJoined` to room
4. Server updates online users list
5. All clients receive updated user list

### Typing Indicators
1. User starts typing
2. Client emits `typing` event
3. Server broadcasts `userTyping` to room
4. Other users see typing indicator
5. Indicator disappears after timeout

## 🛠️ Error Handling

### Connection Errors
- Automatic reconnection attempts
- Graceful fallback to offline mode
- User-friendly error messages

### Database Errors
- Messages are queued if database is unavailable
- User presence is handled gracefully
- Error logging for debugging

### UI Errors
- Input validation
- Character limits
- Disabled states when disconnected

## 🎨 UI/UX Features

### Responsive Design
- Works on desktop, tablet, and mobile
- Collapsible sidebar for mobile
- Touch-friendly interface

### Accessibility
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support

### User Experience
- Real-time connection status
- Message timestamps
- Character count for messages
- Loading states and indicators

## 🔧 Configuration

### Environment Variables
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
SESSION_SECRET=your_session_secret
```

### User Preferences
- Display name
- Notification settings
- Theme preference (light/dark/auto)
- Stored in localStorage

## 🚀 Deployment

### Production Setup
1. Set environment variables
2. Run database setup: `npm run setup:chat`
3. Build the project: `npm run build:full`
4. Start production server: `npm run start:prod`

### Scaling Considerations
- Socket.IO supports horizontal scaling with Redis adapter
- Database connection pooling
- Message rate limiting
- File upload size limits

## 🧪 Testing

### Manual Testing
1. Open multiple browser tabs
2. Join different rooms
3. Send messages between tabs
4. Test user presence
5. Test room switching

### Automated Testing
- Unit tests for socket handlers
- Integration tests for API endpoints
- E2E tests for user workflows

## 🔍 Monitoring

### Health Checks
- `/chat/health`: Chat service health
- `/chat/stats`: Chat statistics
- Connection monitoring
- Error logging

### Metrics
- Active connections
- Messages per minute
- User engagement
- Room activity

## 🛡️ Security

### Message Validation
- Content filtering
- Rate limiting
- Size limits
- XSS prevention

### User Privacy
- Anonymous user support
- Optional user identification
- Data retention policies
- GDPR compliance

## 📈 Future Enhancements

### Planned Features
- File uploads
- Message reactions
- User profiles
- Moderation tools
- Push notifications
- Message search
- Voice messages
- Video calls

### Performance Optimizations
- Message pagination
- Lazy loading
- Caching strategies
- CDN integration

## 🐛 Troubleshooting

### Common Issues

**Connection Failed**
- Check Socket.IO server is running
- Verify environment variables
- Check browser console for errors

**Messages Not Sending**
- Verify database connection
- Check user authentication
- Review server logs

**Users Not Showing Online**
- Check user presence table
- Verify room joining logic
- Review socket connection

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` and checking browser console and server logs.

## 📞 Support

For issues or questions about the chat implementation:

1. Check the server logs
2. Review browser console errors
3. Verify database connectivity
4. Test with different browsers
5. Check network connectivity

---

**Note**: This implementation is production-ready and includes comprehensive error handling, security measures, and scalability considerations.
