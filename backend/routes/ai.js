/* ===== AI Routes ===== */

const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');

// Initialize OpenAI
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

// ===== AI Chat Assistance =====
router.post('/chat', async (req, res) => {
    try {
        const { message, context } = req.body;

        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: context || 'You are a helpful assistant for Nomad Bihari, a travel blogging platform.'
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            temperature: 0.7,
            max_tokens: 200
        });

        const reply = response.data.choices[0].message.content;
        res.json({ response: reply });
    } catch (error) {
        console.error('AI chat error:', error);
        res.status(500).json({ message: 'Error processing AI request' });
    }
});

// ===== AI Content Generation =====
router.post('/generate-content', async (req, res) => {
    try {
        const { topic, style } = req.body;

        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a travel content writer. Generate engaging travel stories and descriptions.'
                },
                {
                    role: 'user',
                    content: `Write a ${style} travel article about ${topic}`
                }
            ],
            temperature: 0.8,
            max_tokens: 500
        });

        const content = response.data.choices[0].message.content;
        res.json({ content });
    } catch (error) {
        console.error('Content generation error:', error);
        res.status(500).json({ message: 'Error generating content' });
    }
});

// ===== AI Title Suggestion =====
router.post('/suggest-title', async (req, res) => {
    try {
        const { content } = req.body;

        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a content expert. Suggest 3 engaging titles for travel content.'
                },
                {
                    role: 'user',
                    content: `Suggest titles for this content: ${content.substring(0, 200)}`
                }
            ],
            temperature: 0.7,
            max_tokens: 150
        });

        const titles = response.data.choices[0].message.content;
        res.json({ titles });
    } catch (error) {
        console.error('Title suggestion error:', error);
        res.status(500).json({ message: 'Error suggesting titles' });
    }
});

// ===== AI SEO Optimization =====
router.post('/optimize-seo', async (req, res) => {
    try {
        const { title, description } = req.body;

        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are an SEO expert. Optimize content for search engines.'
                },
                {
                    role: 'user',
                    content: `Optimize this for SEO:\nTitle: ${title}\nDescription: ${description}`
                }
            ],
            temperature: 0.7,
            max_tokens: 200
        });

        const optimized = response.data.choices[0].message.content;
        res.json({ optimized });
    } catch (error) {
        console.error('SEO optimization error:', error);
        res.status(500).json({ message: 'Error optimizing SEO' });
    }
});

module.exports = router;
