/* ===== Chatbot Routes ===== */

const express = require('express');
const router = express.Router();

// ===== Chatbot Message Handler =====
router.post('/', async (req, res) => {
    try {
        const { message } = req.body;

        // Basic chatbot responses (can be extended with AI)
        const responses = {
            'hello': 'Hello! Welcome to Nomad Bihari. How can I help you?',
            'help': 'I can help you with account management, posting content, engagement, analytics, and general website questions.',
            'signup': 'To sign up, click the Sign Up button and fill in your details. Verify your email and phone with OTP.',
            'login': 'To login, click Sign In and enter your User ID and password.',
            'post': 'To create a post, go to My Blog/Article in your dashboard and click Create New Post.',
            'analytics': 'View your post analytics including views, likes, comments, and shares in the Analytics section.',
            'default': 'I\'m here to help! Can you please provide more details about your question?'
        };

        // Find matching response
        let response = responses['default'];
        for (const [key, value] of Object.entries(responses)) {
            if (key !== 'default' && message.toLowerCase().includes(key)) {
                response = value;
                break;
            }
        }

        res.json({ response });
    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ message: 'Chatbot error' });
    }
});

module.exports = router;
