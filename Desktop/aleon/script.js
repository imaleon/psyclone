// DOM Elements
const chatItems = document.querySelectorAll('.chat-item');
const messageInput = document.querySelector('.message-input');
const sendBtn = document.querySelector('.send-btn');
const messagesContainer = document.querySelector('.messages-container');
const searchInput = document.querySelector('.search-input');
const attachmentBtn = document.querySelector('.attachment-btn');
const emojiBtn = document.querySelector('.emoji-btn');

// Chat data
const chatData = {
    'Alice Johnson': [
        { type: 'sent', content: 'Hi Alice! How are you?', time: '2:25 PM' },
        { type: 'received', content: 'Hey! I\'m doing great, thanks for asking!', time: '2:28 PM' },
        { type: 'received', content: 'How about you? What have you been up to?', time: '2:29 PM' },
        { type: 'sent', content: 'I\'ve been working on a new project. Pretty excited about it!', time: '2:30 PM' },
        { type: 'received', content: 'Hey! How are you doing?', time: '2:30 PM' }
    ],
    'Bob Smith': [
        { type: 'sent', content: 'Hey Bob, are we still on for tomorrow?', time: '1:00 PM' },
        { type: 'received', content: 'Yes! Absolutely. Looking forward to it.', time: '1:05 PM' },
        { type: 'sent', content: 'Great! Should I bring anything?', time: '1:10 PM' },
        { type: 'received', content: 'See you tomorrow!', time: '1:15 PM' }
    ],
    'Group Chat': [
        { type: 'received', content: 'John: Hey everyone!', time: '12:30 PM' },
        { type: 'received', content: 'Sarah: Hi John!', time: '12:32 PM' },
        { type: 'sent', content: 'Hey guys! What\'s up?', time: '12:35 PM' },
        { type: 'received', content: 'Mike: Anyone up for coffee later?', time: '12:40 PM' },
        { type: 'received', content: 'John: Great idea!', time: '12:45 PM' }
    ],
    'Emma Wilson': [
        { type: 'received', content: 'Hi! I need some help with the project', time: '11:00 AM' },
        { type: 'sent', content: 'Sure! What do you need help with?', time: '11:05 AM' },
        { type: 'received', content: 'I\'m stuck on the CSS styling', time: '11:10 AM' },
        { type: 'sent', content: 'I can help you with that. Let me take a look.', time: '11:15 AM' },
        { type: 'received', content: 'Thanks for the help!', time: '11:30 AM' }
    ]
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    scrollToBottom();
});

// Event Listeners
function setupEventListeners() {
    // Chat item clicks
    chatItems.forEach(item => {
        item.addEventListener('click', () => switchChat(item));
    });

    // Send message
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Search functionality
    searchInput.addEventListener('input', filterChats);

    // Attachment button
    attachmentBtn.addEventListener('click', () => {
        alert('File attachment feature would open file picker here');
    });

    // Emoji button
    emojiBtn.addEventListener('click', () => {
        alert('Emoji picker would open here');
    });

    // Auto-resize message input
    messageInput.addEventListener('input', autoResizeInput);
}

// Switch chat
function switchChat(clickedItem) {
    // Remove active class from all items
    chatItems.forEach(item => item.classList.remove('active'));
    
    // Add active class to clicked item
    clickedItem.classList.add('active');
    
    // Get chat name
    const chatName = clickedItem.querySelector('.chat-name').textContent;
    
    // Update chat header
    updateChatHeader(clickedItem);
    
    // Load messages for this chat
    loadMessages(chatName);
    
    // Remove unread badge
    const unreadBadge = clickedItem.querySelector('.unread-badge');
    if (unreadBadge) {
        unreadBadge.remove();
    }
}

// Update chat header
function updateChatHeader(chatItem) {
    const avatar = chatItem.querySelector('.chat-avatar img').src;
    const name = chatItem.querySelector('.chat-name').textContent;
    const status = chatItem.querySelector('.chat-message').textContent;
    
    document.querySelector('.chat-header-avatar img').src = avatar;
    document.querySelector('.chat-header-name').textContent = name;
    document.querySelector('.chat-header-status').textContent = `last seen ${status.includes(':') ? status.split(' ').pop() : 'recently'}`;
}

// Load messages
function loadMessages(chatName) {
    const messages = chatData[chatName] || [];
    
    messagesContainer.innerHTML = '';
    
    messages.forEach(msg => {
        const messageElement = createMessageElement(msg);
        messagesContainer.appendChild(messageElement);
    });
    
    scrollToBottom();
}

// Create message element
function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.type}`;
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = message.content;
    
    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = message.time;
    
    messageDiv.appendChild(content);
    messageDiv.appendChild(time);
    
    return messageDiv;
}

// Send message
function sendMessage() {
    const messageText = messageInput.value.trim();
    
    if (messageText === '') return;
    
    const message = {
        type: 'sent',
        content: messageText,
        time: getCurrentTime()
    };
    
    // Add message to current chat
    const messageElement = createMessageElement(message);
    messagesContainer.appendChild(messageElement);
    
    // Clear input and scroll to bottom
    messageInput.value = '';
    scrollToBottom();
    
    // Simulate response after 1 second
    setTimeout(() => {
        simulateResponse();
    }, 1000);
}

// Simulate response
function simulateResponse() {
    const responses = [
        'That sounds great!',
        'I totally agree with you.',
        'Let me think about that...',
        'Interesting! Tell me more.',
        'Sure, I can help with that.',
        'Thanks for sharing!',
        'How does that work?',
        'That\'s a good point.'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const message = {
        type: 'received',
        content: randomResponse,
        time: getCurrentTime()
    };
    
    const messageElement = createMessageElement(message);
    messagesContainer.appendChild(messageElement);
    scrollToBottom();
}

// Get current time
function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${displayHours}:${minutes} ${ampm}`;
}

// Scroll to bottom
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Filter chats
function filterChats() {
    const searchTerm = searchInput.value.toLowerCase();
    
    chatItems.forEach(item => {
        const name = item.querySelector('.chat-name').textContent.toLowerCase();
        const message = item.querySelector('.chat-message').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || message.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Auto-resize input
function autoResizeInput() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
}

// Mobile sidebar toggle
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
}

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('open');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }
    
    // Escape to clear search
    if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        filterChats();
        searchInput.blur();
    }
});

// Touch gestures for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - close sidebar
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.remove('open');
        } else {
            // Swipe right - open sidebar
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.add('open');
        }
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add notification styles dynamically
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    }
    
    .notification.info {
        background-color: #007aff;
    }
    
    .notification.success {
        background-color: #34c759;
    }
    
    .notification.error {
        background-color: #ff3b30;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
