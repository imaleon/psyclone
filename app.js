const CONFIG = {
    // Update this with your Render URL: https://your-app-name.onrender.com
    RENDER_URL: 'https://psycyclone.onrender.com',
    
    get API_URL() {
        return window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : (this.RENDER_URL || window.location.origin);
    },
    
    get WS_URL() {
        return window.location.hostname === 'localhost'
            ? 'ws://localhost:3000'
            : (this.RENDER_URL ? this.RENDER_URL.replace('https', 'wss') : window.location.origin.replace('https', 'wss'));
    }
};

class ChatApp {
    constructor() {
        this.currentChat = null;
        this.socket = null;
        this.chats = [];
        this.messages = {};
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.connectSocket();
        this.loadChats();
    }

    cacheElements() {
        this.chatList = document.getElementById('chatList');
        this.messagesContainer = document.getElementById('messages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.headerName = document.getElementById('headerName');
        this.headerStatus = document.getElementById('headerStatus');
        this.headerAvatar = document.getElementById('headerAvatar');
        this.searchInput = document.getElementById('searchInput');
    }

    bindEvents() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        this.searchInput.addEventListener('input', (e) => this.filterChats(e.target.value));
    }

    connectSocket() {
        try {
            this.socket = new WebSocket(CONFIG.WS_URL);
            
            this.socket.onopen = () => {
                console.log('Connected to server');
                this.headerStatus.textContent = 'connected';
            };

            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleSocketMessage(data);
            };

            this.socket.onclose = () => {
                console.log('Disconnected, retrying...');
                this.headerStatus.textContent = 'connecting...';
                setTimeout(() => this.connectSocket(), 3000);
            };

            this.socket.onerror = (error) => {
                console.error('Socket error:', error);
            };
        } catch (err) {
            console.log('Socket connection failed, using HTTP fallback');
            this.startHttpFallback();
        }
    }

    startHttpFallback() {
        this.headerStatus.textContent = 'HTTP mode';
        setInterval(() => this.pollMessages(), 3000);
    }

    async pollMessages() {
        if (!this.currentChat) return;
        try {
            const res = await fetch(`${CONFIG.API_URL}/api/messages/${this.currentChat}`);
            const messages = await res.json();
            this.renderMessages(messages);
        } catch (err) {
            console.error('Poll error:', err);
        }
    }

    handleSocketMessage(data) {
        switch (data.type) {
            case 'message':
                if (data.chatId === this.currentChat) {
                    this.appendMessage(data);
                }
                this.updateChatPreview(data.chatId, data.text);
                break;
            case 'chatList':
                this.chats = data.chats;
                this.renderChatList();
                break;
            case 'history':
                this.messages[data.chatId] = data.messages;
                if (data.chatId === this.currentChat) {
                    this.renderMessages(data.messages);
                }
                break;
        }
    }

    async loadChats() {
        try {
            const res = await fetch(`${CONFIG.API_URL}/api/chats`);
            const chats = await res.json();
            this.chats = chats;
            this.renderChatList();
        } catch (err) {
            console.error('Failed to load chats:', err);
            this.renderEmptyState();
        }
    }

    renderChatList() {
        this.chatList.innerHTML = '';
        this.chats.forEach(chat => {
            const item = document.createElement('div');
            item.className = 'chat-item' + (chat.id === this.currentChat ? ' active' : '');
            item.innerHTML = `
                <div class="chat-avatar">${chat.name[0].toUpperCase()}</div>
                <div class="chat-info">
                    <div class="chat-row">
                        <span class="chat-name">${this.escapeHtml(chat.name)}</span>
                        <span class="chat-time">${chat.time || ''}</span>
                    </div>
                    <div class="chat-preview">${this.escapeHtml(chat.lastMessage || '')}</div>
                </div>
            `;
            item.addEventListener('click', () => this.selectChat(chat));
            this.chatList.appendChild(item);
        });
    }

    selectChat(chat) {
        this.currentChat = chat.id;
        this.headerName.textContent = chat.name;
        this.headerAvatar.textContent = chat.name[0].toUpperCase();
        this.messagesContainer.innerHTML = '';
        
        document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
        event.currentTarget.classList.add('active');

        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'join', chatId: chat.id }));
        } else {
            this.loadMessages(chat.id);
        }
    }

    async loadMessages(chatId) {
        try {
            const res = await fetch(`${CONFIG.API_URL}/api/messages/${chatId}`);
            const messages = await res.json();
            this.renderMessages(messages);
        } catch (err) {
            console.error('Failed to load messages:', err);
        }
    }

    renderMessages(messages) {
        this.messagesContainer.innerHTML = '';
        messages.forEach(msg => this.appendMessage(msg));
        this.scrollToBottom();
    }

    appendMessage(msg) {
        const div = document.createElement('div');
        div.className = `message ${msg.outgoing ? 'out' : 'in'}`;
        div.innerHTML = `
            <div class="message-text">${this.escapeHtml(msg.text)}</div>
            <div class="message-time">${msg.time || new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        `;
        this.messagesContainer.appendChild(div);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text || !this.currentChat) return;

        const message = {
            type: 'message',
            chatId: this.currentChat,
            text: text,
            outgoing: true,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };

        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            this.sendHttpMessage(message);
        }

        this.appendMessage(message);
        this.messageInput.value = '';
    }

    async sendHttpMessage(message) {
        try {
            await fetch(`${CONFIG.API_URL}/api/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });
        } catch (err) {
            console.error('Failed to send:', err);
        }
    }

    updateChatPreview(chatId, text) {
        const chat = this.chats.find(c => c.id === chatId);
        if (chat) {
            chat.lastMessage = text;
            chat.time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            this.renderChatList();
        }
    }

    filterChats(query) {
        const items = this.chatList.querySelectorAll('.chat-item');
        items.forEach((item, index) => {
            const chat = this.chats[index];
            const match = chat.name.toLowerCase().includes(query.toLowerCase());
            item.style.display = match ? 'flex' : 'none';
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    renderEmptyState() {
        this.chatList.innerHTML = `
            <div class="empty-state" style="padding: 40px; text-align: center; color: var(--text-secondary);">
                No chats yet
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});
