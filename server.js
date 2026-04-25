const express = require('express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const chats = [
    { id: '1', name: 'General', lastMessage: '', time: '' },
    { id: '2', name: 'Work', lastMessage: '', time: '' },
    { id: '3', name: 'Family', lastMessage: '', time: '' }
];

const messages = {
    '1': [],
    '2': [],
    '3': []
};

const clients = new Map();

wss.on('connection', (ws) => {
    console.log('Client connected');
    let currentChat = null;

    ws.send(JSON.stringify({ type: 'chatList', chats }));

    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data);
            
            switch (msg.type) {
                case 'join':
                    currentChat = msg.chatId;
                    clients.set(ws, currentChat);
                    ws.send(JSON.stringify({
                        type: 'history',
                        chatId: currentChat,
                        messages: messages[currentChat] || []
                    }));
                    break;

                case 'message':
                    const messageData = {
                        text: msg.text,
                        outgoing: msg.outgoing,
                        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                    };
                    
                    if (!messages[msg.chatId]) messages[msg.chatId] = [];
                    messages[msg.chatId].push(messageData);

                    const chat = chats.find(c => c.id === msg.chatId);
                    if (chat) {
                        chat.lastMessage = msg.text;
                        chat.time = messageData.time;
                    }

                    wss.clients.forEach(client => {
                        if (client.readyState === 1) {
                            client.send(JSON.stringify({
                                type: 'message',
                                chatId: msg.chatId,
                                ...messageData
                            }));
                        }
                    });
                    break;
            }
        } catch (err) {
            console.error('Message error:', err);
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
    });
});

app.get('/api/chats', (req, res) => {
    res.json(chats);
});

app.get('/api/messages/:chatId', (req, res) => {
    const chatMessages = messages[req.params.chatId] || [];
    res.json(chatMessages);
});

app.post('/api/messages', (req, res) => {
    const { chatId, text, outgoing } = req.body;
    
    if (!messages[chatId]) messages[chatId] = [];
    
    const message = {
        text,
        outgoing,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    messages[chatId].push(message);
    res.json({ success: true });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
