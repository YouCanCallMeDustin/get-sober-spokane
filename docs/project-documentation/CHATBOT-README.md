# Sober Chat - Chatbot Assistant

A persistent chatbot assistant powered by Groq's Llama-3 API that provides compassionate sobriety support on every page of the Get Sober Spokane website.

## Features

- **Site-wide Widget**: Floating chat button in bottom-right corner of all pages
- **Persistent Chat**: Chat history persists while navigating between pages using sessionStorage
- **Mobile-Friendly**: Responsive design that works on all devices
- **Professional UI**: Matches the site's brand theme (#2c5aa0)
- **Error Handling**: Graceful fallback with helpful resources when API is unavailable
- **Rate Limiting**: Prevents spam with built-in rate limiting
- **Security**: Input validation and XSS protection

## Files Added/Modified

### New Files Created:
1. **`routes/chat.js`** - Backend API route for chatbot functionality
2. **`src/scss/components/_chatbot.scss`** - Chatbot styling
3. **`src/js/chatbot.js`** - Frontend chatbot logic
4. **`test-chatbot.js`** - Test script for API verification
5. **`CHATBOT-README.md`** - This documentation

### Modified Files:
1. **`server.js`** - Added chat route import and usage
2. **`src/scss/styles.scss`** - Added chatbot component import
3. **`src/pug/layout.pug`** - Added chatbot script include
4. **`env.example`** - Added GROQ_API_KEY configuration

## Setup Instructions

### 1. Environment Configuration
Add your Groq API key to your `.env` file:
```bash
GROQ_API_KEY=your_groq_api_key_here
```

### 2. Get Groq API Key
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

### 3. Test the Implementation
Run the test script to verify everything works:
```bash
node test-chatbot.js
```

## API Endpoint

**POST** `/chat`
- **Body**: `{ "message": "string" }`
- **Response**: `{ "response": "string", "timestamp": "ISO string" }`
- **Rate Limit**: 10 requests per minute per IP

## System Prompt

The chatbot uses this system prompt to provide appropriate responses:
```
"You are a supportive sobriety assistant for Get Sober Spokane. Provide compassionate, practical, and non-judgmental answers. If unsure, provide these resources: Spokane AA Hotline (509-624-1442), Washington Recovery Help Line (1-866-789-1511), National SAMHSA Helpline (1-800-662-4357). If someone is in crisis, encourage calling 911 or these hotlines immediately."
```

## Frontend Features

### Chat Interface
- Floating action button with chat icon
- Expandable chat window (350px width, 500px height)
- Message bubbles (user on right, bot on left)
- Typing indicators
- Auto-scroll to latest messages
- Mobile-responsive design

### User Experience
- **Keyboard Shortcuts**: Enter to send, Escape to close
- **Auto-resize**: Textarea grows with content
- **Persistent History**: Chat history saved in sessionStorage
- **Error Handling**: Friendly fallback messages
- **Loading States**: Visual feedback during API calls

### Styling
- Matches brand colors (#2c5aa0)
- Smooth animations and transitions
- Professional gradient backgrounds
- Custom scrollbars
- Dark mode support

## Security Features

- **Input Validation**: Rejects empty or overly long messages
- **Rate Limiting**: Prevents API abuse
- **XSS Protection**: HTML escaping for user messages
- **Error Boundaries**: Graceful error handling
- **API Key Security**: Stored in environment variables

## Mobile Optimization

- Responsive design for all screen sizes
- Touch-friendly interface
- Optimized for mobile keyboards
- Outside click to close on mobile
- Proper viewport handling

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript features
- CSS Grid and Flexbox
- Local Storage API

## Troubleshooting

### Common Issues:

1. **Chat not appearing**: Check browser console for JavaScript errors
2. **API errors**: Verify GROQ_API_KEY is set correctly
3. **Styling issues**: Ensure SCSS is compiled properly
4. **Mobile issues**: Test on actual mobile devices

### Debug Commands:
```javascript
// Open browser console and run:
window.SoberChat.open() // Manually open chat
window.SoberChat.close() // Manually close chat
```

## Performance Considerations

- Minimal footprint (~15KB gzipped)
- Lazy loading of chat interface
- Efficient DOM manipulation
- Memory management for message history
- Optimized API calls

## Future Enhancements

- Message persistence across sessions
- File/image sharing
- Voice messages
- Integration with user profiles
- Analytics and insights
- Multi-language support

## Support

For technical issues or questions about the chatbot implementation, refer to the main project documentation or contact the development team.
