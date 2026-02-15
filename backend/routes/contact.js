/* ===== Contact Routes ===== */

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-password'
    }
});

// ===== Submit Contact Form =====
router.post('/submit', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        const pool = req.pool;
        const connection = await pool.getConnection();

        // Save to database
        await connection.execute(
            `INSERT INTO contact_queries (name, email, phone, subject, message, status)
             VALUES (?, ?, ?, ?, ?, 'new')`,
            [name, email, phone, subject, message]
        );

        await connection.release();

        // Send notification email to admin
        await emailTransporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL || 'admin@nomadbihari.com',
            subject: `New Contact Query: ${subject}`,
            html: `
                <h2>New Contact Query</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        });

        res.json({ message: 'Your message has been sent successfully' });
    } catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({ message: 'Error submitting message' });
    }
});

module.exports = router;
