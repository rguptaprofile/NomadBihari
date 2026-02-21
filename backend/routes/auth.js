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

        // For demo: Log OTP to console (since email service not configured)
        console.log(`\n📧 OTP for ${email}: ${otp}\n`);

        // In production, use email service
        // await emailTransporter.sendMail({...});

        res.json({ 
            message: 'OTP sent to email',
            // Development only - remove in production
            demo_otp: otp
        });
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

        // For demo: Log OTP to console (since SMS service not configured)
        console.log(`\n📱 OTP for ${phone}: ${otp}\n`);

        // In production, use Twilio or similar SMS service
        // For now, just log it
        console.log(`SMS OTP for ${phone}: ${otp}`);

        res.json({ 
            message: 'OTP sent to phone',
            // Development only - remove in production
            demo_otp: otp
        });
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

        // Validation
        if (!firstName || !lastName || !email || !phone || !dob || !userId || !password) {
            await connection.release();
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const [existingUser] = await connection.execute(
            'SELECT * FROM users WHERE email = ? OR user_id = ? OR phone = ?',
            [email, userId, phone]
        );

        if (existingUser.length > 0) {
            await connection.release();
            return res.status(400).json({ message: 'User already exists with this email, username, or phone' });
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Insert user
        const [result] = await connection.execute(
            `INSERT INTO users (first_name, last_name, email, phone, user_id, password_hash, dob, email_verified, phone_verified)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [firstName, lastName, email, phone, userId, hashedPassword, dob, emailVerified || false, phoneVerified || false]
        );

        const newUserId = result.insertId;

        // Log signup activity
        await connection.execute(
            `INSERT INTO activity_logs 
             (user_id, activity_type, activity_description, created_at)
             VALUES (?, ?, ?, NOW())`,
            [newUserId, 'SIGNUP', `User ${userId} created account - ${email}`]
        );

        await connection.release();

        // Generate JWT token
        const token = jwt.encode({
            userId: newUserId,
            email: email,
            userId: userId,
            exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY
        }, JWT_SECRET);

        res.json({
            message: 'Account created successfully',
            token,
            userId: userId,
            firstName: firstName,
            lastName: lastName,
            success: true
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error creating account', error: error.message });
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

        // Log login activity
        await connection.execute(
            `INSERT INTO activity_logs 
             (user_id, activity_type, activity_description, created_at)
             VALUES (?, ?, ?, NOW())`,
            [user.id, 'LOGIN', `User ${user.user_id} logged in - ${user.email}`]
        );

        console.log(`\n✅ User Login Successful:`);
        console.log(`   User ID: ${user.user_id}`);
        console.log(`   Name: ${user.first_name} ${user.last_name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Database ID: ${user.id}`);
        console.log(`   Activity logged to database\n`);

        await connection.release();

        // Generate JWT token
        const token = jwt.encode({
            userId: user.id,
            email: user.email,
            userName: user.user_id,
            exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY
        }, JWT_SECRET);

        res.json({
            message: 'Login successful',
            token,
            userId: user.user_id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            success: true
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

        // Predefined admin credentials
        const ADMIN_ACCOUNTS = [
            {
                id: 1,
                email: 'gupta.rahul.hru@gmail.com',
                name: 'Rahul Gupta',
                password: 'Admin1-9525.com'
            },
            {
                id: 2,
                email: 'kumarravi69600@gmail.com',
                name: 'Ravi Kumar',
                password: 'Chudail@143'
            }
        ];

        // Verify against predefined credentials
        const admin = ADMIN_ACCOUNTS.find(a => a.email === email);

        if (!admin || admin.password !== password) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        // Log admin activity
        try {
            const connection = await pool.getConnection();
            await connection.execute(
                `INSERT INTO admin_activity_logs 
                 (admin_id, activity_type, activity_description, created_at)
                 VALUES (?, ?, ?, NOW())`,
                [admin.id, 'LOGIN', 'Admin login successful']
            );
            await connection.release();
        } catch (logError) {
            console.error('Error logging admin activity:', logError);
        }

        // Generate JWT token
        const token = jwt.encode({
            adminId: admin.id,
            email: admin.email,
            name: admin.name,
            role: 'admin',
            exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY
        }, JWT_SECRET);

        res.json({
            message: 'Admin login successful',
            token,
            adminId: admin.id,
            adminName: admin.name
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Error during admin login' });
    }
});

// ===== User Logout =====
router.post('/logout', async (req, res) => {
    try {
        const token = req.get('Authorization')?.split(' ')[1];
        
        // Token is invalidated on client side (localStorage removal)
        // In production, you might want to maintain a token blacklist

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Error during logout' });
    }
});

// ===== Helper Functions =====

// Generate unique user ID
async function generateUniqueUserId(firstName, pool) {
    try {
        // Format: FirstName_RandomCode_Timestamp
        const code = Math.random().toString(36).substring(2, 7).toUpperCase();
        const timestamp = Date.now().toString().slice(-4);
        const baseUserId = `${firstName.substring(0, 3).toUpperCase()}_${code}_${timestamp}`;
        
        const connection = await pool.getConnection();
        const [existing] = await connection.execute(
            'SELECT user_id FROM users WHERE user_id LIKE ?',
            [`${baseUserId}%`]
        );
        await connection.release();
        
        if (existing.length === 0) {
            return baseUserId;
        }
        
        // If exists, add a counter
        for (let i = 1; i <= 100; i++) {
            const uniqueId = `${baseUserId}${i}`;
            const [exists] = await connection.execute(
                'SELECT user_id FROM users WHERE user_id = ?',
                [uniqueId]
            );
            if (exists.length === 0) {
                return uniqueId;
            }
        }
        return null;
    } catch (error) {
        console.error('Error generating unique user ID:', error);
        return null;
    }
}

// Generate random password
function generateRandomPassword() {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    
    let password = '';
    
    // Add one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Add 4 more random characters from all
    const all = uppercase + lowercase + numbers + special;
    for (let i = 0; i < 4; i++) {
        password += all[Math.floor(Math.random() * all.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Send credentials email
async function sendCredentialsEmail(email, firstName, userId, password) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER || 'noreply@nomadbihari.com',
            to: email,
            subject: 'नमस्ते! आपका NomadBihari खाता तैयार है 🎉',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                    <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #2c3e50; text-align: center;">स्वागत है, ${firstName}! 👋</h2>
                        
                        <p style="color: #555; font-size: 16px; line-height: 1.6;">
                            आपका <strong>NomadBihari</strong> खाता सफलतापूर्वक बनाया गया है। यहाँ आपके लॉगिन विवरण हैं:
                        </p>
                        
                        <div style="background-color: #ecf0f1; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3498db;">
                            <p style="margin: 10px 0; color: #333;">
                                <strong>📧 यूजर आईडी (User ID):</strong> <code style="background-color: white; padding: 5px 10px; border-radius: 3px;">${userId}</code>
                            </p>
                            <p style="margin: 10px 0; color: #333;">
                                <strong>🔐 पासवर्ड (Password):</strong> <code style="background-color: white; padding: 5px 10px; border-radius: 3px;">${password}</code>
                            </p>
                        </div>
                        
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                            <p style="margin: 0; color: #856404;">
                                <strong>⚠️ महत्वपूर्ण:</strong> इन विवरणों को सुरक्षित रखें। पहली लॉगिन के बाद अपना पासवर्ड बदलना सुनिश्चित करें।
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:8000/frontend/pages/signin.html" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                🚀 अभी लॉगिन करें
                            </a>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                        
                        <p style="color: #888; font-size: 14px; text-align: center;">
                            अगर आपको এই ईमेल में कोई समस्या दिख रही है, तो कृपया <strong>support@nomadbihari.com</strong> से संपर्क करें।
                        </p>
                    </div>
                </div>
            `
        };
        
        await emailTransporter.sendMail(mailOptions);
        console.log(`✅ Credentials email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending credentials email:', error);
        // Log the error but don't fail the signup - user can still login
        console.log(`⚠️ Email not sent to ${email} but account created successfully`);
        return false;
    }
}

// ===== Automatic Signup Endpoint =====
router.post('/auto-signup', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, dob } = req.body;
        const pool = req.pool;

        // Validation
        if (!firstName || !lastName || !email || !phone || !dob) {
            return res.status(400).json({ message: 'सभी फील्ड आवश्यक हैं (All fields are required)' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'कृपया एक वैध ईमेल दर्ज करें (Please enter a valid email)' });
        }

        // Phone validation
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
            return res.status(400).json({ message: 'कृपया एक वैध 10-अंकीय फोन नंबर दर्ज करें (Please enter a valid 10-digit phone number)' });
        }

        const connection = await pool.getConnection();

        try {
            // Check if user already exists
            const [existingUser] = await connection.execute(
                'SELECT id, user_id FROM users WHERE email = ? OR phone = ?',
                [email, phoneDigits]
            );

            if (existingUser.length > 0) {
                return res.status(400).json({ 
                    message: 'इस ईमेल या फोन नंबर से खाता पहले से मौजूद है (User already exists with this email or phone)' 
                });
            }

            // Generate unique user ID
            const userId = await generateUniqueUserId(firstName, pool);
            if (!userId) {
                return res.status(500).json({ message: 'यूजर आईडी जेनरेट करने में विफल (Failed to generate user ID)' });
            }

            // Generate random password
            const randomPassword = generateRandomPassword();
            const hashedPassword = await bcryptjs.hash(randomPassword, 10);

            console.log(`\n🔑 Auto-Generated Credentials for ${email}:`);
            console.log(`   User ID: ${userId}`);
            console.log(`   Password: ${randomPassword}`);
            console.log(`   (Password will be sent via email)\n`);

            // Insert user into database
            const [result] = await connection.execute(
                `INSERT INTO users (first_name, last_name, email, phone, user_id, password_hash, dob, email_verified, phone_verified, is_active)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [firstName, lastName, email, phoneDigits, userId, hashedPassword, dob, false, false, true]
            );

            const newUserId = result.insertId;
            console.log(`✅ User created in database with ID: ${newUserId}`);

            // Log signup activity
            await connection.execute(
                `INSERT INTO activity_logs 
                 (user_id, activity_type, activity_description, created_at)
                 VALUES (?, ?, ?, NOW())`,
                [newUserId, 'SIGNUP', `User ${userId} created account - ${email}`]
            );
            console.log(`📝 Activity logged for user ${userId}`);

            // Send credentials via email
            const emailSent = await sendCredentialsEmail(email, firstName, userId, randomPassword);

            // Generate JWT token
            const token = jwt.encode({
                userId: newUserId,
                email: email,
                user_id: userId,
                exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY
            }, JWT_SECRET);

            res.json({
                message: 'खाता सफलतापूर्वक बनाया गया (Account created successfully)',
                success: true,
                token,
                userId: newUserId,
                user_id: userId,
                firstName: firstName,
                lastName: lastName,
                email: email,
                emailSent: emailSent,
                note: 'कृपया अपने ईमेल की जांच करें - आपकी लॉगिन आईडी और पासवर्ड ईमेल किए गए हैं (Check your email for login credentials)'
            });

        } finally {
            await connection.release();
        }
    } catch (error) {
        console.error('Auto-signup error:', error);
        res.status(500).json({ 
            message: 'खाता बनाने में त्रुटि (Error creating account)', 
            error: error.message 
        });
    }
});

module.exports = router;
