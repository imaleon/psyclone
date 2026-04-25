# Telegram-Inspired Chat Application

A modern, responsive chat interface inspired by Telegram's design and functionality.

## Features

- **Telegram-like Interface**: Clean, dark theme matching Telegram's aesthetic
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Interactive Chat**: Switch between different chats with real-time message updates
- **Search Functionality**: Filter chats by name or message content
- **Message Input**: Send messages with Enter key, auto-resizing input field
- **Touch Gestures**: Swipe gestures for mobile navigation
- **Keyboard Shortcuts**: Ctrl+K for search, Escape to clear
- **Notification System**: Built-in notification display

## Quick Start

1. **Local Development**:
   ```bash
   # Start local server
   npm start
   # or
   python -m http.server 8000
   ```
   Open `http://localhost:8000` in your browser

2. **Render Deployment**:
   - Connect your GitHub repository to Render
   - Use the provided `render.yaml` configuration
   - Deploy as a static site

## File Structure

```
├── index.html          # Main HTML structure
├── styles.css          # Telegram-inspired styling
├── script.js           # Interactive JavaScript functionality
├── render.yaml         # Render deployment configuration
├── package.json        # Node.js configuration
└── README.md           # This file
```

## Render Deployment Setup

1. **Connect Repository**:
   - Push your code to GitHub
   - Connect your GitHub account to Render

2. **Create New Service**:
   - Choose "Static Site" as service type
   - Set build command: `echo 'No build needed for static site'`
   - Set publish directory: `.`

3. **Environment Variables**:
   - `NODE_ENV`: `production`

4. **Deploy**:
   - Render will automatically deploy your site
   - Your app will be available at `https://your-app-name.onrender.com`

## Customization

### Adding New Chats
Edit the `chatData` object in `script.js`:

```javascript
const chatData = {
    'New Contact': [
        { type: 'sent', content: 'Hello!', time: '3:00 PM' },
        { type: 'received', content: 'Hi there!', time: '3:05 PM' }
    ]
};
```

### Styling Changes
Modify `styles.css` to customize:
- Colors: Update color variables
- Layout: Adjust flexbox and grid properties
- Typography: Change font families and sizes

### Interactive Features
Extend `script.js` to add:
- File uploads
- Emoji picker integration
- Real-time messaging with WebSockets
- User authentication

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Flexbox
- **Vanilla JavaScript**: No framework dependencies
- **Render**: Static site hosting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Deploy to Render for testing
6. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.
