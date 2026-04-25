# Telegram Clone

A modern, responsive Telegram-inspired chat application built with HTML, CSS, and JavaScript, connected to a Node.js backend deployed on Render.

## Features

- **Modern UI**: Clean, Telegram-inspired interface with dark theme
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Chat**: Send and receive messages with real-time updates
- **Chat Management**: Multiple chats with online/offline status indicators
- **Search Functionality**: Search through chats and messages
- **Backend Integration**: Node.js API with Socket.IO for real-time communication
- **Render Deployment**: Ready to deploy on Render platform

## Project Structure

```
telegram-clone/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # Frontend JavaScript
├── server.js           # Backend Node.js server
├── package.json        # Node.js dependencies
├── render.yaml         # Render deployment configuration
└── README.md          # This file
```

## Local Development

### Prerequisites
- Node.js (version 14 or higher)
- npm

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the backend server:**
   ```bash
   npm start
   ```
   or for development with auto-restart:
   ```bash
   npm run dev
   ```

3. **Open the frontend:**
   Open `index.html` in your browser or use a live server extension.

The backend will run on `http://localhost:3000` and the frontend will automatically connect to it.

## Render Deployment

### Prerequisites
- A Render account
- Git repository with this code

### Deployment Steps

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Render:**
   - Go to your Render dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` configuration
   - Deploy both the frontend and backend services

3. **Update URLs:**
   - The frontend will be available at your Render frontend URL
   - The backend API will be available at your backend Render URL
   - The JavaScript automatically handles the URL switching between local and production

### Manual Render Configuration

If you prefer manual setup:

**Backend Service:**
- Name: `telegram-clone-backend`
- Environment: `Node`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables:
  - `NODE_ENV`: `production`
  - `PORT`: `3000`

**Frontend Service:**
- Name: `telegram-clone-frontend`
- Environment: `Static`
- Build Command: `echo "No build needed"`
- Publish Directory: `.`

## API Endpoints

### Health Check
```
GET /api/health
```

### Chats
```
GET /api/chats          # Get all chats
POST /api/chats         # Create new chat
```

### Messages
```
GET /api/messages/:chatId     # Get messages for a chat
POST /api/messages            # Send a message
```

### User Status
```
POST /api/status        # Update user status
```

## WebSocket Events

### Client to Server
- `join_chat` - Join a chat room
- `typing` - Send typing indicator

### Server to Client
- `new_message` - Receive new message
- `new_chat` - Receive new chat notification
- `user_typing` - Receive typing indicator

## Features in Detail

### Chat Interface
- **Sidebar**: List of chats with avatars, online status, and unread counts
- **Message Area**: Real-time message display with sent/received indicators
- **Input Area**: Message input with attachment and emoji buttons
- **Search**: Filter chats by name or message content

### Responsive Design
- **Desktop**: Full sidebar and chat view
- **Tablet**: Optimized layout for medium screens
- **Mobile**: Collapsible sidebar with hamburger menu

### Real-time Features
- **Message Sync**: Messages sync across all connected clients
- **Typing Indicators**: See when other users are typing
- **Online Status**: Real-time online/offline status updates

## Customization

### Theming
The app uses a dark theme inspired by Telegram. You can customize colors in `styles.css`:

```css
:root {
    --primary-bg: #1c1c1e;
    --secondary-bg: #2b2b2e;
    --accent-color: #007aff;
    --text-primary: #ffffff;
    --text-secondary: #8e8e93;
}
```

### Adding Features
- **File Sharing**: Extend the message API to handle file uploads
- **Voice Messages**: Add audio recording and playback
- **Video Calls**: Integrate WebRTC for video functionality
- **Encryption**: Add end-to-end encryption for messages

## Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Ensure the backend server is running
   - Check if the Render URL is correct in `script.js`
   - Verify CORS settings in the backend

2. **Messages Not Sending**
   - Check network connection
   - Verify backend API is accessible
   - Check browser console for errors

3. **Mobile Menu Not Working**
   - Ensure viewport meta tag is present
   - Check CSS media queries
   - Test on different screen sizes

### Development Tips

- Use browser developer tools to debug WebSocket connections
- Check the Network tab for API requests
- Use console.log statements in JavaScript for debugging
- Test on multiple devices for responsive design

## License

This project is for educational purposes. Feel free to modify and use it as a learning resource.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section
2. Review the code comments
3. Test on different browsers
4. Create an issue with detailed information
