const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (for demo purposes)
const chats = new Map();
const messages = new Map();
const users = new Map();

// Initialize with some demo data
function initializeDemoData() {
    const demoChats = [
        { id: '1', name: 'Alice Johnson', avatar: 'https://picsum.photos/seed/chat1/50/50.jpg', lastMessage: 'Hey! How are you doing?', time: '2:30 PM', unread: 2, online: true },
        { id: '2', name: 'Bob Smith', avatar: 'https://picsum.photos/seed/chat2/50/50.jpg', lastMessage: 'See you tomorrow!', time: '1:15 PM', unread: 0, online: false },
        { id: '3', name: 'Group Chat', avatar: 'https://picsum.photos/seed/chat3/50/50.jpg', lastMessage: 'John: Meeting at 3pm', time: '12:45 PM', unread: 5, online: true },
        { id: '4', name: 'Emma Wilson', avatar: 'https://picsum.photos/seed/chat4/50/50.jpg', lastMessage: 'Thanks for the help!', time: 'Yesterday', unread: 0, online: false }
    ];

    demoChats.forEach(chat => {
        chats.set(chat.id, chat);
        messages.set(chat.id, [
            { id: uuidv4(), text: chat.lastMessage, sent: false, time: chat.time, sender: chat.name }
        ]);
    });
}

initializeDemoData();

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all chats
app.get('/api/chats', (req, res) => {
    const chatList = Array.from(chats.values()).map(chat => ({
        id: chat.id,
        name: chat.name,
        avatar: chat.avatar,
        lastMessage: chat.lastMessage,
        time: chat.time,
        unread: chat.unread,
        online: chat.online
    }));
    res.json(chatList);
});

// Get messages for a specific chat
app.get('/api/messages/:chatId', (req, res) => {
    const { chatId } = req.params;
    const chatMessages = messages.get(chatId) || [];
    res.json(chatMessages);
});

// Send a message
app.post('/api/messages', (req, res) => {
    const { chatId, message } = req.body;
    
    if (!chatId || !message || !message.text) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    const newMessage = {
        id: uuidv4(),
        text: message.text,
        sent: message.sent || true,
        time: new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        }),
        sender: message.sender || 'You'
    };

    // Add message to storage
    if (!messages.has(chatId)) {
        messages.set(chatId, []);
    }
    messages.get(chatId).push(newMessage);

    // Update chat's last message
    const chat = chats.get(chatId);
    if (chat) {
        chat.lastMessage = newMessage.text;
        chat.time = newMessage.time;
        if (!newMessage.sent) {
            chat.unread = (chat.unread || 0) + 1;
        }
    }

    // Broadcast message to all connected clients
    io.emit('new_message', {
        chatId,
        message: newMessage
    });

    res.json(newMessage);
});

// Create a new chat
app.post('/api/chats', (req, res) => {
    const { name, avatar } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    const newChat = {
        id: uuidv4(),
        name,
        avatar: avatar || `https://picsum.photos/seed/${Date.now()}/50/50.jpg`,
        lastMessage: '',
        time: 'Now',
        unread: 0,
        online: Math.random() > 0.5
    };

    chats.set(newChat.id, newChat);
    messages.set(newChat.id, []);

    // Broadcast new chat to all connected clients
    io.emit('new_chat', newChat);

    res.json(newChat);
});

// Update user online status
app.post('/api/status', (req, res) => {
    const { userId, status } = req.body;
    
    if (users.has(userId)) {
        users.set(userId, { ...users.get(userId), status, lastSeen: new Date() });
    }
    
    res.json({ success: true });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user to a room for private messages
    socket.on('join_chat', (chatId) => {
        socket.join(chatId);
        console.log(`User ${socket.id} joined chat ${chatId}`);
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
        socket.to(data.chatId).emit('user_typing', {
            userId: socket.id,
            chatId: data.chatId,
            typing: data.typing
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = { app, server, io };
