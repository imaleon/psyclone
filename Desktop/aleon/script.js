// Telegram Clone JavaScript
class TelegramClone {
    constructor() {
        this.currentChat = null;
        this.messages = {};
        this.renderUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : `https://telegram-clone-backend.onrender.com`; // Render backend URL
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeMessages();
        this.setupChatSwitching();
        this.setupMessageSending();
        this.connectToBackend();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.querySelector('.search-box input');
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));

        // Chat item clicks
        document.querySelectorAll('.chat-item').forEach(item => {
            item.addEventListener('click', () => this.selectChat(item));
        });

        // Message input
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        sendBtn.addEventListener('click', () => this.sendMessage());

        // Sidebar toggle for mobile
        this.setupMobileMenu();
    }

    setupMobileMenu() {
        if (window.innerWidth <= 480) {
            const sidebar = document.querySelector('.sidebar');
            const mainChat = document.querySelector('.main-chat');
            
            // Add menu toggle button for mobile
            const menuBtn = document.createElement('button');
            menuBtn.className = 'mobile-menu-btn';
            menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            menuBtn.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                z-index: 100;
                background: #007aff;
                border: none;
                color: white;
                padding: 10px;
                border-radius: 50%;
                cursor: pointer;
                display: none;
            `;
            
            document.body.appendChild(menuBtn);
            
            menuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('mobile-open');
            });
            
            // Show menu button only on mobile
            const checkMobile = () => {
                menuBtn.style.display = window.innerWidth <= 480 ? 'block' : 'none';
            };
            
            window.addEventListener('resize', checkMobile);
            checkMobile();
        }
    }

    initializeMessages() {
        // Initialize with some default messages
        this.messages = {
            '1': [
                { id: 1, text: 'Hey! How are you doing?', sent: false, time: '2:30 PM' },
                { id: 2, text: "I'm doing great! Just working on some projects. How about you?", sent: true, time: '2:32 PM' },
                { id: 3, text: "That's awesome! I'm just catching up on some reading.", sent: false, time: '2:35 PM' },
                { id: 4, text: 'Sounds relaxing! Anything interesting?', sent: true, time: '2:36 PM' }
            ],
            '2': [
                { id: 1, text: 'See you tomorrow!', sent: false, time: '1:15 PM' }
            ],
            '3': [
                { id: 1, text: 'Meeting at 3pm', sent: false, time: '12:45 PM', sender: 'John' }
            ],
            '4': [
                { id: 1, text: 'Thanks for the help!', sent: false, time: 'Yesterday' }
            ]
        };
    }

    setupChatSwitching() {
        // Select first chat by default
        const firstChat = document.querySelector('.chat-item');
        if (firstChat) {
            this.selectChat(firstChat);
        }
    }

    selectChat(chatItem) {
        // Remove active class from all chats
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to selected chat
        chatItem.classList.add('active');

        // Update current chat
        this.currentChat = chatItem.dataset.chatId;
        const chatName = chatItem.querySelector('h4').textContent;
        const chatAvatar = chatItem.querySelector('img').src;
        const status = chatItem.querySelector('.status').className;

        // Update chat header
        this.updateChatHeader(chatName, chatAvatar, status);

        // Load messages for this chat
        this.loadMessages(this.currentChat);

        // Close mobile menu if open
        const sidebar = document.querySelector('.sidebar');
        if (window.innerWidth <= 480) {
            sidebar.classList.remove('mobile-open');
        }
    }

    updateChatHeader(name, avatarSrc, statusClass) {
        const headerAvatar = document.querySelector('.header-avatar img');
        const headerStatus = document.querySelector('.header-avatar .status');
        const headerName = document.querySelector('.header-details h3');

        if (headerAvatar) headerAvatar.src = avatarSrc;
        if (headerStatus) headerStatus.className = statusClass;
        if (headerName) headerName.textContent = name;
    }

    loadMessages(chatId) {
        const messagesContainer = document.querySelector('.messages-container');
        messagesContainer.innerHTML = '';

        const messages = this.messages[chatId] || [];
        messages.forEach(message => {
            this.displayMessage(message, false);
        });

        // Scroll to bottom
        this.scrollToBottom();
    }

    displayMessage(message, isNew = false) {
        const messagesContainer = document.querySelector('.messages-container');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sent ? 'sent' : 'received'}`;
        if (isNew) messageDiv.classList.add('new');

        if (!message.sent) {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <img src="https://picsum.photos/seed/chat${this.currentChat}/30/30.jpg" alt="Avatar">
                </div>
                <div class="message-content">
                    <p>${message.text}</p>
                    <span class="message-time">${message.time}</span>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <p>${message.text}</p>
                    <span class="message-time">${message.time}</span>
                </div>
            `;
        }

        messagesContainer.appendChild(messageDiv);

        if (isNew) {
            this.scrollToBottom();
        }
    }

    setupMessageSending() {
        // Message sending is handled in the init method
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const messageText = messageInput.value.trim();

        if (!messageText || !this.currentChat) return;

        const message = {
            id: Date.now(),
            text: messageText,
            sent: true,
            time: this.getCurrentTime()
        };

        // Add to messages array
        if (!this.messages[this.currentChat]) {
            this.messages[this.currentChat] = [];
        }
        this.messages[this.currentChat].push(message);

        // Display message
        this.displayMessage(message, true);

        // Clear input
        messageInput.value = '';

        // Send to backend
        this.sendToBackend(message);

        // Update last message in chat list
        this.updateChatListItem(this.currentChat, messageText);
    }

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    }

    updateChatListItem(chatId, lastMessage) {
        const chatItem = document.querySelector(`[data-chat-id="${chatId}"]`);
        if (chatItem) {
            const preview = chatItem.querySelector('.chat-preview p');
            const time = chatItem.querySelector('.time');
            
            if (preview) preview.textContent = lastMessage;
            if (time) time.textContent = this.getCurrentTime();
        }
    }

    handleSearch(query) {
        const chatItems = document.querySelectorAll('.chat-item');
        const searchTerm = query.toLowerCase();

        chatItems.forEach(item => {
            const name = item.querySelector('h4').textContent.toLowerCase();
            const message = item.querySelector('.chat-preview p').textContent.toLowerCase();
            
            if (name.includes(searchTerm) || message.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    scrollToBottom() {
        const messagesContainer = document.querySelector('.messages-container');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async connectToBackend() {
        try {
            // Test connection to Render backend
            const response = await fetch(`${this.renderUrl}/api/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                console.log('Connected to backend successfully');
                this.loadChatsFromBackend();
            } else {
                console.log('Backend not available, using local data');
            }
        } catch (error) {
            console.log('Backend connection failed, using local data:', error.message);
        }
    }

    async loadChatsFromBackend() {
        try {
            const response = await fetch(`${this.renderUrl}/api/chats`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });

            if (response.ok) {
                const chats = await response.json();
                this.updateChatList(chats);
            }
        } catch (error) {
            console.error('Failed to load chats:', error);
        }
    }

    async sendToBackend(message) {
        try {
            const response = await fetch(`${this.renderUrl}/api/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    chatId: this.currentChat,
                    message: message
                })
            });

            if (response.ok) {
                console.log('Message sent to backend');
            } else {
                console.log('Failed to send message to backend');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    getAuthToken() {
        // In a real app, this would come from localStorage or a cookie
        return localStorage.getItem('authToken') || 'demo-token';
    }

    updateChatList(chats) {
        // Update chat list with data from backend
        // This is a placeholder for real implementation
        console.log('Updating chat list with:', chats);
    }

    // Simulate receiving messages
    simulateIncomingMessage() {
        if (Math.random() > 0.7 && this.currentChat) {
            const responses = [
                "That's interesting!",
                "I agree with you.",
                "Let me think about that.",
                "Sure, no problem!",
                "Thanks for letting me know."
            ];

            const message = {
                id: Date.now(),
                text: responses[Math.floor(Math.random() * responses.length)],
                sent: false,
                time: this.getCurrentTime()
            };

            setTimeout(() => {
                this.messages[this.currentChat].push(message);
                this.displayMessage(message, true);
                this.updateChatListItem(this.currentChat, message.text);
            }, 2000);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new TelegramClone();
    
    // Simulate incoming messages every 10 seconds
    setInterval(() => {
        app.simulateIncomingMessage();
    }, 10000);
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 480) {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('mobile-open');
    }
});
