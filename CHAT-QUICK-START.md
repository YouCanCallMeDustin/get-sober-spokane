# 🚀 Chat Room Quick Start Guide

Get your professional chat room up and running in 5 minutes!

## ⚡ Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
Create a `.env` file in your project root:
```env
CHAT_PORT=3001
CHAT_HOST=localhost
CHAT_LOG_LEVEL=info
PORT=3000
NODE_ENV=development
```

### 3. Build the Application
```bash
npm run build:full
```

### 4. Start the Chat Server
```bash
npm run start:chat
```

### 5. Start Your Main Server
In a new terminal:
```bash
npm run start:server
```

### 6. Access Your Chat Room
Visit: `http://localhost:3000/chat`

## 🎯 What You Get

✅ **Professional Design** - Matches your website's style perfectly  
✅ **Real-time Chat** - WebSocket-powered instant messaging  
✅ **Multiple Rooms** - Specialized support chat rooms  
✅ **File Sharing** - Images, documents, and more  
✅ **Emoji Reactions** - Express support and emotions  
✅ **Mobile Responsive** - Works on all devices  
✅ **Moderation Tools** - Keep conversations safe and supportive  
✅ **User Settings** - Customizable experience  

## 🔧 Configuration Options

### Chat Server Settings
- **Port**: Change `CHAT_PORT` in `.env`
- **Host**: Change `CHAT_HOST` in `.env`
- **Log Level**: Set `CHAT_LOG_LEVEL` (debug, info, warn, error)

### Content Moderation
Edit `src/chat-server.js` to customize:
- Inappropriate word filtering
- Message length limits
- File upload restrictions

## 🚨 Troubleshooting

### Chat Server Won't Start?
```bash
# Check if port is in use
lsof -i :3001

# Check Node.js version (needs 16+)
node --version

# Verify dependencies
npm list socket.io
```

### WebSocket Connection Fails?
- Ensure chat server is running on port 3001
- Check browser console for errors
- Verify firewall settings

### Messages Not Sending?
- Check WebSocket connection status
- Verify message length (max 500 characters)
- Check browser console for JavaScript errors

## 📱 Testing Features

1. **Send Messages** - Type and press Enter
2. **Use Emojis** - Click the emoji button
3. **Share Files** - Use the paperclip icon
4. **Switch Rooms** - Click different rooms in sidebar
5. **Customize Settings** - Click the gear icon

## 🌐 Production Deployment

### Environment Variables
```env
NODE_ENV=production
CHAT_PORT=3001
CHAT_HOST=0.0.0.0
CHAT_LOG_LEVEL=warn
```

### Start Both Services
```bash
npm run start:all
```

## 📚 Next Steps

- Read the full documentation: `docs/CHAT-ROOM-SETUP.md`
- Customize chat room themes and styling
- Add database integration for message persistence
- Implement user authentication
- Set up monitoring and analytics

## 🆘 Need Help?

- Check the browser console for errors
- Review server logs in `logs/chat-server.log`
- Read the comprehensive setup guide
- Contact the development team

---

**🎉 Congratulations!** Your professional chat room is now running and ready to support your recovery community!
