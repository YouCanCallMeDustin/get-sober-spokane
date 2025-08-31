# Chat Room System Setup Guide

## Overview

The Chat Room System is a professional, real-time communication platform designed specifically for the Get Sober Spokane recovery support community. It provides a safe, moderated environment for users to connect, share experiences, and find immediate support.

## Features

### Core Functionality
- **Real-time Messaging**: Instant message delivery using WebSocket technology
- **Multiple Chat Rooms**: Specialized rooms for different types of support
- **User Presence**: See who's online and active
- **Typing Indicators**: Know when someone is composing a message
- **Message History**: Access to recent conversation history
- **File Sharing**: Support for images, documents, and text files
- **Emoji Reactions**: Express support and reactions to messages

### Chat Rooms
1. **General Support**: General recovery support and community discussion
2. **Recovery Journey**: Share your recovery journey and milestones
3. **Crisis Support**: Immediate support for crisis situations
4. **Celebrations**: Celebrate sobriety milestones and achievements

### User Features
- **Customizable Display Names**: Set your preferred username
- **Theme Support**: Light, dark, and auto themes
- **Notification Settings**: Control sound notifications
- **Mobile Responsive**: Works seamlessly on all devices
- **Accessibility**: Screen reader friendly and keyboard navigable

## Technical Architecture

### Frontend
- **Pug Templates**: Server-side rendered HTML
- **SCSS Styling**: Modular CSS with your website's design system
- **Vanilla JavaScript**: No heavy frameworks, fast and lightweight
- **Bootstrap Integration**: Consistent with your existing UI components

### Backend
- **Node.js/Express**: Robust server framework
- **Socket.io**: Real-time WebSocket communication
- **Moderation System**: Content filtering and user management
- **RESTful APIs**: Standard HTTP endpoints for integration

## Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn package manager
- Git repository access

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Configuration
Create a `.env` file in your project root:
```env
# Chat Server Configuration
CHAT_PORT=3001
CHAT_HOST=localhost
CHAT_LOG_LEVEL=info

# Main Application Configuration
PORT=3000
NODE_ENV=development
```

### Step 3: Build the Application
```bash
# Build all assets
npm run build:full

# Or build individual components
npm run build:pug
npm run build:scss
npm run build:scripts
```

### Step 4: Start the Services

#### Option A: Start Chat Server Only
```bash
npm run start:chat
```

#### Option B: Start Main Server Only
```bash
npm run start:server
```

#### Option C: Start Both Services
```bash
npm run start:all
```

### Step 5: Access the Chat Room
- **Main Website**: Navigate to `/chat` on your main site
- **Chat Server**: Direct access at `http://localhost:3001`
- **Health Check**: `http://localhost:3001/health`
- **Statistics**: `http://localhost:3001/api/chat/stats`

## Configuration

### Chat Server Settings
The chat server can be configured through environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `CHAT_PORT` | 3001 | Port for the chat server |
| `CHAT_HOST` | localhost | Host binding for the server |
| `CHAT_LOG_LEVEL` | info | Logging level (debug, info, warn, error) |

### Content Moderation
Moderation settings are configurable in the chat server:

```javascript
// In src/chat-server.js
const inappropriateWords = [
    'spam', 'scam', 'hack', 'crack', 
    'illegal', 'drugs', 'weapons'
];

const maxMessageLength = 500;
const maxFileSize = 10 * 1024 * 1024; // 10MB
```

### File Upload Restrictions
Supported file types:
- **Images**: JPEG, PNG, GIF, WebP
- **Documents**: PDF, TXT, DOC, DOCX
- **Maximum Size**: 10MB per file

## Usage Guide

### For Users

#### Joining a Chat Room
1. Navigate to the chat room page
2. Choose a room from the sidebar
3. Set your display name in settings
4. Start chatting!

#### Sending Messages
- Type your message in the input field
- Press Enter or click Send
- Use emojis to express emotions
- Attach files when needed

#### Using Features
- **Emoji Picker**: Click the emoji button to add reactions
- **File Sharing**: Use the paperclip icon to attach files
- **Room Switching**: Click different rooms in the sidebar
- **Settings**: Gear icon for customization options

### For Moderators

#### Monitoring Activity
- Access chat statistics at `/api/chat/stats`
- View server logs in `logs/chat-server.log`
- Monitor user activity and message content

#### Content Moderation
- Automatic filtering of inappropriate content
- Manual message removal capabilities
- User warning and suspension features

#### Room Management
- Create new specialized rooms
- Archive inactive rooms
- Set room-specific rules and guidelines

## Development

### Project Structure
```
src/
├── pug/
│   └── chat-room.pug          # Chat room template
├── scss/
│   └── components/
│       └── _chat-room.scss    # Chat room styles
├── js/
│   └── chat-room.js           # Frontend functionality
├── routes/
│   └── chat.js                # HTTP routes
└── chat-server.js             # WebSocket server

scripts/
└── start-chat.js              # Chat server startup script

docs/
└── CHAT-ROOM-SETUP.md         # This documentation
```

### Adding New Features

#### Custom Chat Rooms
1. Add room configuration in `chat-server.js`
2. Update the Pug template sidebar
3. Add room-specific styling if needed

#### New Message Types
1. Extend the message handling in `chat-server.js`
2. Update the frontend message rendering
3. Add appropriate validation and moderation

#### Custom Emojis
1. Add emoji categories in `chat-room.js`
2. Update the emoji picker UI
3. Ensure accessibility for screen readers

### Testing

#### Manual Testing
```bash
# Start the chat server
npm run start:chat

# In another terminal, start the main server
npm run start:server

# Test WebSocket connection
curl http://localhost:3001/health
```

#### Automated Testing
```bash
# Run tests (when implemented)
npm test

# Run specific test suites
npm run test:chat
npm run test:websocket
```

## Security Considerations

### Content Safety
- **Message Filtering**: Automatic detection of inappropriate content
- **File Validation**: Type and size restrictions on uploads
- **Rate Limiting**: Prevention of spam and abuse
- **User Authentication**: Optional user verification system

### Privacy Protection
- **Anonymous Usage**: Users can participate without accounts
- **Data Retention**: Limited message history storage
- **No Personal Data**: Minimal collection of user information
- **Secure Connections**: HTTPS and WSS protocol support

### Moderation Tools
- **Content Filtering**: Automated inappropriate content detection
- **User Reporting**: Community-driven content moderation
- **Admin Controls**: Administrative oversight capabilities
- **Audit Logging**: Complete activity tracking for compliance

## Troubleshooting

### Common Issues

#### Chat Server Won't Start
```bash
# Check if port is already in use
lsof -i :3001

# Check Node.js version
node --version

# Verify dependencies
npm list socket.io
```

#### WebSocket Connection Fails
- Ensure chat server is running on correct port
- Check firewall settings
- Verify CORS configuration
- Check browser console for errors

#### Messages Not Sending
- Check network connectivity
- Verify WebSocket connection status
- Check browser console for JavaScript errors
- Ensure message length is within limits

#### File Upload Issues
- Verify file size is under 10MB
- Check file type is supported
- Ensure sufficient disk space
- Check server logs for errors

### Log Files
- **Chat Server Logs**: `logs/chat-server.log`
- **Application Logs**: Check your main application logging
- **Browser Console**: Developer tools for frontend issues

### Performance Monitoring
```bash
# Check server statistics
curl http://localhost:3001/api/chat/stats

# Monitor system resources
htop
iotop
```

## Deployment

### Production Considerations
- **Load Balancing**: Multiple chat server instances
- **Database Integration**: Persistent message storage
- **SSL/TLS**: Secure WebSocket connections
- **Monitoring**: Application performance monitoring
- **Backup**: Regular data backup procedures

### Environment Variables
```env
# Production Configuration
NODE_ENV=production
CHAT_PORT=3001
CHAT_HOST=0.0.0.0
CHAT_LOG_LEVEL=warn
CHAT_MAX_CONNECTIONS=1000
CHAT_MESSAGE_RETENTION_DAYS=30
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "run", "start:chat"]
```

## Support & Maintenance

### Regular Maintenance
- **Log Rotation**: Manage log file sizes
- **Performance Monitoring**: Track server metrics
- **Security Updates**: Keep dependencies current
- **Backup Verification**: Ensure data integrity

### Community Guidelines
- **Respectful Communication**: Maintain supportive environment
- **Content Standards**: Follow community guidelines
- **Reporting Issues**: Use built-in reporting tools
- **Moderation Cooperation**: Work with moderators

### Getting Help
- **Documentation**: This guide and inline code comments
- **Issue Tracking**: GitHub issues for bugs and features
- **Community Support**: Forum and community channels
- **Technical Support**: Contact development team

## Future Enhancements

### Planned Features
- **Video Chat**: Face-to-face support sessions
- **Group Therapy**: Structured support group sessions
- **Resource Library**: Integrated recovery resources
- **Progress Tracking**: Sobriety milestone tracking
- **Mobile App**: Native mobile application

### Integration Opportunities
- **Calendar Integration**: Schedule support sessions
- **Notification System**: Push notifications for support
- **Analytics Dashboard**: Community engagement metrics
- **AI Moderation**: Enhanced content filtering
- **Multi-language Support**: International community support

---

## Quick Start Checklist

- [ ] Install dependencies: `npm install`
- [ ] Create `.env` file with configuration
- [ ] Build the application: `npm run build:full`
- [ ] Start chat server: `npm run start:chat`
- [ ] Start main server: `npm run start:server`
- [ ] Test connection: Visit `/chat` on your site
- [ ] Verify WebSocket: Check browser console
- [ ] Test features: Send messages, use emojis, share files

For additional support or questions, please refer to the project documentation or contact the development team.
