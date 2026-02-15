/* ===== Chatbot JavaScript ===== */

document.addEventListener('DOMContentLoaded', function() {
    initializeChatbot();
});

function initializeChatbot() {
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWidget = document.getElementById('chatbotWidget');
    const closeChatbotBtn = document.getElementById('closeChatbot');
    const sendChatbotBtn = document.getElementById('sendChatbot');
    const chatbotInput = document.getElementById('chatbotInput');

    // Toggle chatbot widget
    if (chatbotToggle) {
        chatbotToggle.addEventListener('click', toggleChatbot);
    }

    // Close chatbot
    if (closeChatbotBtn) {
        closeChatbotBtn.addEventListener('click', closeChatbot);
    }

    // Send message
    if (sendChatbotBtn) {
        sendChatbotBtn.addEventListener('click', sendChatbotMessage);
    }

    // Send on Enter key
    if (chatbotInput) {
        chatbotInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatbotMessage();
            }
        });
    }

    // Add initial greeting
    addChatbotMessage("Hello! 👋 I'm Nomad Bihari's AI Assistant. How can I help you today?", 'bot');
}

function toggleChatbot() {
    const chatbotWidget = document.getElementById('chatbotWidget');
    if (chatbotWidget) {
        chatbotWidget.classList.toggle('active');
    }
}

function closeChatbot() {
    const chatbotWidget = document.getElementById('chatbotWidget');
    if (chatbotWidget) {
        chatbotWidget.classList.remove('active');
    }
}

function addChatbotMessage(message, sender) {
    const chatbotMessages = document.getElementById('chatbotMessages');
    if (!chatbotMessages) return;

    const messageEl = document.createElement('div');
    messageEl.className = `chatbot-message ${sender}`;
    messageEl.textContent = message;

    chatbotMessages.appendChild(messageEl);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

async function sendChatbotMessage() {
    const chatbotInput = document.getElementById('chatbotInput');
    if (!chatbotInput) return;

    const message = chatbotInput.value.trim();
    if (!message) return;

    // Add user message
    addChatbotMessage(message, 'user');
    chatbotInput.value = '';

    try {
        // Get bot response
        const response = await getChatbotResponse(message);
        addChatbotMessage(response, 'bot');
    } catch (error) {
        console.error('Chatbot error:', error);
        addChatbotMessage('Sorry, I encountered an error. Please try again.', 'bot');
    }
}

// Chatbot responses based on keywords
async function getChatbotResponse(userMessage) {
    const messageLower = userMessage.toLowerCase();

    // FAQ responses
    const responses = {
        // Account and signup
        signup: 'To sign up, click the "Sign Up" button in the navigation menu. Fill in your details, verify your email/phone with OTP, and create your account. You can then access your personal dashboard!',
        signin: 'To sign in, click the "Sign In" button and enter your User ID and password. If you\'re an admin, select the "Login as Admin" option.',
        account: 'You can manage your account from the Settings section in your dashboard. There you can change your password, privacy settings, and delete your account if needed.',
        password: 'To reset your password, use the "Forgot Password" option on the Sign In page. You\'ll receive an OTP via email to reset your password.',
        
        // Posting and content
        post: 'To create a post, go to "My Blog/Article" in your dashboard and click "Create New Post". You can add photos, videos, and write articles. Choose whether to make it public or private.',
        photo: 'You can upload photos when creating a post or article. We support JPEG, PNG, and WebP formats. Maximum file size is 10MB per image.',
        'video': 'To upload videos, create a new post and select the video upload option. Supported formats: MP4, WebM. Maximum file size is 100MB.',
        visibility: 'Posts can be set as "Public" (visible to everyone) or "Private" (visible only to you). You can change this anytime from your post settings.',
        
        // Engagement
        like: 'To like a post, click the heart icon on the post card. You can see the total likes count below the icon.',
        comment: 'Click the comment icon to open comments on a post. You can read existing comments and add your own.',
        share: 'Click the share icon to share a post. You can share it via social media or copy the link to send directly to friends.',
        
        // Analytics
        analytics: 'Your Analytics dashboard shows various metrics including views, likes, comments, and shares on your posts. These update in real-time.',
        earnings: 'Admin users can view earnings data from ads on the website in their Analytics section.',
        
        // Features
        feature: 'Nomad Bihari offers photo/video uploads, article writing, real-time engagement (likes, comments, shares), analytics tracking, and push notifications.',
        notification: 'Subscribe to push notifications to get real-time updates on likes, comments, and shares on your posts. Manage this in Settings.',
        search: 'Use the search feature to find posts, users, and destinations. Content is ranked by views and engagement.',
        seo: 'Popular content ranks higher in search results. The more engaged your posts are, the better visibility they get.',
        
        // Admin
        admin: 'Admin users have access to a special dashboard where they can view all user data, manage content, track earnings, and system analytics.',
        
        // Help
        help: 'I can help with account management, posting content, engagement features, analytics, and general website questions. What would you like to know?',
        
        // General
        about: 'Nomad Bihari is a travel and blogging platform where explorers share their experiences, photos, and stories with a global community.',
        contact: 'You can contact us through the Contact Us page. Fill out the form with your query and we\'ll get back to you soon.',
        'social': 'Follow us on Facebook, Twitter, Instagram, YouTube, and LinkedIn. Links are in the footer of the website.',
        privacy: 'We respect your privacy. Read our full Privacy Policy in the footer for details on how we handle your data.',
    };

    // Check for keyword matches
    for (const [key, response] of Object.entries(responses)) {
        if (messageLower.includes(key)) {
            return response;
        }
    }

    // Try to get response from backend AI service
    try {
        const response = await fetch(`${API_BASE_URL}/chatbot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userMessage })
        });

        if (response.ok) {
            const data = await response.json();
            return data.response;
        }
    } catch (error) {
        console.log('Backend chatbot unavailable, using local responses');
    }

    // Default response
    return `I'm not sure about that. Can you try asking about signing up, creating posts, engagement features, or analytics? Type "help" for available options.`;
}

// Quick response buttons
function createQuickResponseButton(text) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 8px 12px;
        margin: 5px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 12px;
    `;
    button.addEventListener('click', function() {
        const chatbotInput = document.getElementById('chatbotInput');
        if (chatbotInput) {
            chatbotInput.value = text;
            sendChatbotMessage();
        }
    });
    return button;
}

// Add quick responses suggestion
function suggestQuickResponses() {
    const suggestions = ['How to sign up?', 'How to create a post?', 'View analytics', 'Reset password'];
    const messagesDiv = document.getElementById('chatbotMessages');
    
    if (messagesDiv) {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.style.cssText = 'padding: 10px; text-align: center;';
        suggestions.forEach(text => {
            suggestionsDiv.appendChild(createQuickResponseButton(text));
        });
        messagesDiv.appendChild(suggestionsDiv);
    }
}

// Alternative: Use OpenAI API if available
async function getChatbotResponseAI(userMessage) {
    try {
        const response = await fetch(`${API_BASE_URL}/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                message: userMessage,
                context: 'You are a helpful assistant for Nomad Bihari, a travel and blogging platform.'
            })
        });

        if (response.ok) {
            const data = await response.json();
            return data.response;
        }
    } catch (error) {
        console.error('AI service error:', error);
    }

    return null;
}

// Typing indicator
function showTypingIndicator() {
    const chatbotMessages = document.getElementById('chatbotMessages');
    if (!chatbotMessages) return;

    const typingEl = document.createElement('div');
    typingEl.className = 'chatbot-message bot';
    typingEl.id = 'typing-indicator';
    typingEl.innerHTML = '<span>•</span><span>•</span><span>•</span>';
    typingEl.style.cssText = 'animation: typing 1.4s infinite;';
    chatbotMessages.appendChild(typingEl);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typingEl = document.getElementById('typing-indicator');
    if (typingEl) {
        typingEl.remove();
    }
}

// Add CSS animation for typing
const style = document.createElement('style');
style.textContent = `
    @keyframes typing {
        0%, 60%, 100% { opacity: 1; }
        30% { opacity: 0.3; }
    }
`;
document.head.appendChild(style);
