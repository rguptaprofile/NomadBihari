/* ===== Authentication Routes ===== */

const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jwt-simple');
const nodemailer = require('nodemailer');

// ===== Configuration =====
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = 7 * 24 * 60 * 60; // 7 days

// Email Configuration
const emailTransporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-password'
    }
});

// OTP Storage (In production, use Redis or database)
const otpStorage = {};

// ===== Send Email OTP =====
router.post('/send-email-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP with 5-minute expiry
        otpStorage[email] = {
            otp,
            type: 'email',
            expiresAt: Date.now() + 5 * 60 * 1000
        };

        // Send email
        await emailTransporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Nomad Bihari - Email Verification OTP',
            html: `
                <h2>Email Verification</h2>
                <p>Your OTP is: <strong>${otp}</strong></p>
                <p>This OTP is valid for 5 minutes only.</p>
            `
        });

        res.json({ message: 'OTP sent to email' });
    } catch (error) {
        console.error('Error sending email OTP:', error);
        res.status(500).json({ message: 'Error sending OTP' });
    }
});

// ===== Send Phone OTP =====
router.post('/send-phone-otp', async (req, res) => {
    try {
        const { phone } = req.body;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP with 5-minute expiry
        otpStorage[phone] = {
            otp,
            type: 'phone',
            expiresAt: Date.now() + 5 * 60 * 1000
        };

        // In production, use Twilio or similar SMS service
        // For now, just log it
        console.log(`SMS OTP for ${phone}: ${otp}`);

        res.json({ message: 'OTP sent to phone' });
    } catch (error) {
        console.error('Error sending phone OTP:', error);
        res.status(500).json({ message: 'Error sending OTP' });
    }
});

// ===== Verify Email OTP =====
router.post('/verify-email-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const storedOtp = otpStorage[email];
        if (!storedOtp || storedOtp.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (storedOtp.expiresAt < Date.now()) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        // Mark as verified
        storedOtp.emailVerified = true;
        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Error verifying email OTP:', error);
        res.status(500).json({ message: 'Error verifying OTP' });
    }
});

// ===== Verify Phone OTP =====
router.post('/verify-phone-otp', async (req, res) => {
    try {
        const { phone, otp } = req.body;

        const storedOtp = otpStorage[phone];
        if (!storedOtp || storedOtp.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (storedOtp.expiresAt < Date.now()) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        // Mark as verified
        storedOtp.phoneVerified = true;
        res.json({ message: 'Phone verified successfully' });
    } catch (error) {
        console.error('Error verifying phone OTP:', error);
        res.status(500).json({ message: 'Error verifying OTP' });
    }
});

// ===== Resend Email OTP =====
router.post('/resend-email-otp', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Resend the same OTP or generate new one
        const otp = otpStorage[email]?.otp || Math.floor(100000 + Math.random() * 900000).toString();

        otpStorage[email] = {
            otp,
            type: 'email',
            expiresAt: Date.now() + 5 * 60 * 1000
        };

        await emailTransporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Nomad Bihari - Email Verification OTP (Resent)',
            html: `
                <h2>Email Verification</h2>
                <p>Your OTP is: <strong>${otp}</strong></p>
                <p>This OTP is valid for 5 minutes only.</p>
            `
        });

        res.json({ message: 'OTP resent to email' });
    } catch (error) {
        console.error('Error resending email OTP:', error);
        res.status(500).json({ message: 'Error resending OTP' });
    }
});

// ===== Resend Phone OTP =====
router.post('/resend-phone-otp', async (req, res) => {
    try {
        const { phone } = req.body;

        const otp = otpStorage[phone]?.otp || Math.floor(100000 + Math.random() * 900000).toString();

        otpStorage[phone] = {
            otp,
            type: 'phone',
            expiresAt: Date.now() + 5 * 60 * 1000
        };

        console.log(`SMS OTP for ${phone}: ${otp}`);
        res.json({ message: 'OTP resent to phone' });
    } catch (error) {
        console.error('Error resending phone OTP:', error);
        res.status(500).json({ message: 'Error resending OTP' });
    }
});

// ===== User Sign Up =====
router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, dob, userId, password, emailVerified, phoneVerified } = req.body;
        const pool = req.pool;
        const connection = await pool.getConnection();

        // Check if user already exists
        const [existingUser] = await connection.execute(
            'SELECT * FROM users WHERE email = ? OR userId = ? OR phone = ?',
            [email, userId, phone]
        );

        if (existingUser.length > 0) {
            await connection.release();
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Insert user
        await connection.execute(
            `INSERT INTO users (first_name, last_name, email, phone, user_id, password_hash, dob, email_verified, phone_verified)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [firstName, lastName, email, phone, userId, hashedPassword, dob, emailVerified, phoneVerified]
        );

        await connection.release();

        // Generate JWT token
        const token = jwt.encode({
            userId: userId,
            email: email,
            exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY
        }, JWT_SECRET);

        res.json({
            message: 'Account created successfully',
            token,
            userId
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error creating account' });
    }
});

// ===== User Login =====
router.post('/user-login', async (req, res) => {
    try {
        const { userIdOrEmail, password } = req.body;
        const pool = req.pool;
        const connection = await pool.getConnection();

        // Find user by ID or email
        const [users] = await connection.execute(
            'SELECT * FROM users WHERE user_id = ? OR email = ?',
            [userIdOrEmail, userIdOrEmail]
        );

        if (users.length === 0) {
            await connection.release();
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const isPasswordValid = await bcryptjs.compare(password, user.password_hash);
        if (!isPasswordValid) {
            await connection.release();
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        await connection.release();

        // Generate JWT token
        const token = jwt.encode({
            userId: user.id,
            email: user.email,
            exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY
        }, JWT_SECRET);

        res.json({
            message: 'Login successful',
            token,
            userId: user.user_id,
            firstName: user.first_name,
            lastName: user.last_name
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
});

// ===== Admin Login =====
router.post('/admin-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const pool = req.pool;
        const connection = await pool.getConnection();

        // Find admin by email
        const [admins] = await connection.execute(
            'SELECT * FROM admin WHERE email = ?',
            [email]
        );

        if (admins.length === 0) {
            await connection.release();
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        const admin = admins[0];

        // Verify password
        const isPasswordValid = await bcryptjs.compare(password, admin.password_hash);
        if (!isPasswordValid) {
            await connection.release();
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        await connection.release();

        // Generate JWT token
        const token = jwt.encode({
            adminId: admin.id,
            email: admin.email,
            role: 'admin',
            exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY
        }, JWT_SECRET);

        res.json({
            message: 'Admin login successful',
            token,
            adminId: admin.id,
            adminName: admin.admin_name
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Error during admin login' });
    }
});

module.exports = router;
