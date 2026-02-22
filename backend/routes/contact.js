/* ===== Contact Routes with MongoDB ===== */

const express = require('express');
const router = express.Router();
const ContactQuery = require('../models/ContactQuery');

// ===== Submit Contact Form =====
router.post('/submit', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'All required fields must be filled' });
        }

        // Create contact query
        const contactQuery = new ContactQuery({
            name,
            email,
            phone: phone || '',
            subject,
            message,
            status: 'new'
        });

        await contactQuery.save();

        console.log(`\n📩 New Contact Query Received:`);
        console.log(`   Name: ${name}`);
        console.log(`   Email: ${email}`);
        console.log(`   Subject: ${subject}\n`);

        res.json({
            message: 'Your message has been sent successfully. We will get back to you soon!',
            success: true
        });
    } catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({ message: 'Error sending message' });
    }
});

// ===== Get All Contact Queries (Admin) =====
router.get('/queries', async (req, res) => {
    try {
        const { status } = req.query;

        let filter = {};
        if (status) {
            filter.status = status;
        }

        const queries = await ContactQuery.find(filter)
            .sort({ createdAt: -1 })
            .limit(100);

        res.json(queries);
    } catch (error) {
        console.error('Error fetching contact queries:', error);
        res.status(500).json({ message: 'Error fetching queries' });
    }
});

// ===== Update Query Status (Admin) =====
router.put('/queries/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, replyMessage } = req.body;

        const updateData = { status };
        
        if (replyMessage) {
            updateData.replyMessage = replyMessage;
            updateData.repliedAt = new Date();
        }

        const query = await ContactQuery.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!query) {
            return res.status(404).json({ message: 'Query not found' });
        }

        res.json({ message: 'Query updated successfully', query });
    } catch (error) {
        console.error('Error updating query:', error);
        res.status(500).json({ message: 'Error updating query' });
    }
});

module.exports = router;
