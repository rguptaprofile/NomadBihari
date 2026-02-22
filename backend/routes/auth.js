/* ===== Authentication Routes with MongoDB ===== */

const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jwt-simple');
const nodemailer = require('nodemailer');
const axios = require('axios');
const twilio = require('twilio');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// ===== Configuration =====
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = 7 * 24 * 60 * 60; // 7 days

// Email Configuration
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-password'
    }
});

// OTP Storage (In production, use Redis or database)
const otpStorage = {};

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;
const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI;

const isPlaceholder = (value) => !value || value.includes('YOUR_');
const isEmailConfigured = () => !isPlaceholder(EMAIL_USER) && !isPlaceholder(EMAIL_PASS);
const isTwilioConfigured = () => !isPlaceholder(TWILIO_ACCOUNT_SID) && !isPlaceholder(TWILIO_AUTH_TOKEN) && !isPlaceholder(TWILIO_PHONE_NUMBER);
const isLinkedInConfigured = () => !isPlaceholder(LINKEDIN_CLIENT_ID) && !isPlaceholder(LINKEDIN_CLIENT_SECRET) && !isPlaceholder(LINKEDIN_REDIRECT_URI);
const isGoogleConfigured = () => !isPlaceholder(GOOGLE_CLIENT_ID) && !isPlaceholder(GOOGLE_CLIENT_SECRET) && !isPlaceholder(GOOGLE_REDIRECT_URI);
const isFacebookConfigured = () => !isPlaceholder(FACEBOOK_CLIENT_ID) && !isPlaceholder(FACEBOOK_CLIENT_SECRET) && !isPlaceholder(FACEBOOK_REDIRECT_URI);

const twilioClient = isTwilioConfigured() ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null;

// ===== Helper Functions =====

// Generate Unique User ID
async function generateUniqueUserId(firstName) {
    const prefix = firstName.substring(0, 3).toUpperCase();
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const userId = `${prefix}_${randomStr}_${randomNum}`;
    
    // Check if userId already exists
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
        // Try again if duplicate
        return generateUniqueUserId(firstName);
    }
    
    return userId;
}

// Generate Random Password
function generateRandomPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Send Credentials Email
async function sendCredentialsEmail(email, firstName, userId, password) {
    try {
        if (!isEmailConfigured()) {
            console.warn('Email is not configured. Skipping credentials email.');
            return false;
        }
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Nomad Bihari - आपके खाते की जानकारी (Your Account Details)',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                        .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .warning { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 स्वागत है Nomad Bihari में!</h1>
                            <p>Welcome to Nomad Bihari!</p>
                        </div>
                        <div class="content">
                            <h2>नमस्ते ${firstName}!</h2>
                            <p>आपका खाता सफलतापूर्वक बनाया गया है। नीचे आपकी लॉगिन जानकारी दी गई है:</p>
                            
                            <div class="credentials">
                                <h3>📧 लॉगिन विवरण (Login Details):</h3>
                                <p><strong>User ID:</strong> <code style="background: #f8f9fa; padding: 5px 10px; border-radius: 3px;">${userId}</code></p>
                                <p><strong>Email:</strong> <code style="background: #f8f9fa; padding: 5px 10px; border-radius: 3px;">${email}</code></p>
                                <p><strong>Password:</strong> <code style="background: #f8f9fa; padding: 5px 10px; border-radius: 3px;">${password}</code></p>
                            </div>
                            
                            <div class="warning">
                                <strong>⚠️ महत्वपूर्ण सुरक्षा सूचना (Important Security Notice):</strong><br>
                                1. लॉगिन करने के बाद अपना पासवर्ड तुरंत बदलें<br>
                                2. अपना पासवर्ड किसी के साथ साझा न करें<br>
                                3. इस ईमेल को सुरक्षित रखें या डिलीट कर दें
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/pages/signin.html" class="button">
                                    🚀 अभी लॉगिन करें (Login Now)
                                </a>
                            </div>
                            
                            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                                यदि आपने यह खाता नहीं बनाया है, तो कृपया इस ईमेल को अनदेखा करें।<br>
                                If you didn't create this account, please ignore this email.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await emailTransporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
}

function isOtpVerified(target) {
    const storedOtp = otpStorage[target];
    if (!storedOtp) {
        return { ok: false, message: 'OTP not found' };
    }
    if (storedOtp.expiresAt < Date.now()) {
        return { ok: false, message: 'OTP expired' };
    }
    if (!storedOtp.verified) {
        return { ok: false, message: 'OTP not verified' };
    }
    return { ok: true };
}

// ===== Send Email OTP =====
router.post('/send-email-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        otpStorage[email] = {
            otp,
            type: 'email',
            verified: false,
            expiresAt: Date.now() + 5 * 60 * 1000
        };

        if (isEmailConfigured()) {
            await emailTransporter.sendMail({
                from: EMAIL_USER,
                to: email,
                subject: 'Nomad Bihari - Email OTP',
                html: `<p>Your OTP is: <strong>${otp}</strong></p><p>This OTP is valid for 5 minutes.</p>`
            });
            return res.json({ message: 'OTP sent to email' });
        }

        console.log(`\n📧 OTP for ${email}: ${otp}\n`);
        res.json({ message: 'OTP sent to email (demo)', demo_otp: otp });
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
        const phoneDigits = String(phone || '').replace(/\D/g, '');
        const smsTarget = String(phone || '').startsWith('+') ? phone : `+91${phoneDigits}`;

        otpStorage[phoneDigits] = {
            otp,
            type: 'phone',
            verified: false,
            expiresAt: Date.now() + 5 * 60 * 1000
        };

        if (twilioClient) {
            await twilioClient.messages.create({
                body: `Your Nomad Bihari OTP is ${otp}. Valid for 5 minutes.`,
                from: TWILIO_PHONE_NUMBER,
                to: smsTarget
            });
            return res.json({ message: 'OTP sent to phone' });
        }

        console.log(`\n📱 OTP for ${smsTarget}: ${otp}\n`);
        res.json({ message: 'OTP sent to phone (demo)', demo_otp: otp });
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

        storedOtp.verified = true;
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
        const phoneDigits = String(phone || '').replace(/\D/g, '');
        const storedOtp = otpStorage[phoneDigits];
        if (!storedOtp || storedOtp.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (storedOtp.expiresAt < Date.now()) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        storedOtp.verified = true;
        res.json({ message: 'Phone verified successfully' });
    } catch (error) {
        console.error('Error verifying phone OTP:', error);
        res.status(500).json({ message: 'Error verifying OTP' });
    }
});

// ===== User Sign Up =====
router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, dob, userId, password, emailVerified, phoneVerified } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !phone || !dob || !userId || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { userId }, { phone }]
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email, username, or phone' });
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Create user
        const newUser = new User({
            firstName,
            lastName,
            email,
            phone,
            userId,
            passwordHash: hashedPassword,
            dob: new Date(dob),
            emailVerified: emailVerified || false,
            phoneVerified: phoneVerified || false
        });

        await newUser.save();

        // Log signup activity
        const activityLog = new ActivityLog({
            userId: newUser._id,
            activityType: 'SIGNUP',
            activityDescription: `User ${userId} created account - ${email}`
        });
        await activityLog.save();

        // Generate JWT token
        const token = jwt.encode({
            userId: newUser._id.toString(),
            email: email,
            user_id: userId,
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

        // Find user by ID or email
        const user = await User.findOne({
            $or: [{ userId: userIdOrEmail }, { email: userIdOrEmail }]
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isPasswordValid = await bcryptjs.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Log login activity
        const activityLog = new ActivityLog({
            userId: user._id,
            activityType: 'LOGIN',
            activityDescription: `User ${user.userId} logged in - ${user.email}`
        });
        await activityLog.save();

        console.log(`\n✅ User Login Successful:`);
        console.log(`   User ID: ${user.userId}`);
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   MongoDB ID: ${user._id}`);
        console.log(`   Activity logged to database\n`);

        // Generate JWT token
        const token = jwt.encode({
            userId: user._id.toString(),
            email: user.email,
            user_id: user.userId,
            exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY
        }, JWT_SECRET);

        res.json({
            message: 'Login successful',
            token,
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
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

        console.log(`\n✅ Admin Login Successful:`);
        console.log(`   Admin: ${admin.name}`);
        console.log(`   Email: ${admin.email}\n`);

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

// ===== LinkedIn OAuth =====
router.get('/linkedin', (req, res) => {
    if (!isLinkedInConfigured()) {
        return res.status(501).json({ message: 'LinkedIn login is not configured.' });
    }

    const state = `nb_${Date.now()}`;
    const scope = encodeURIComponent('openid profile email');
    const redirectUri = encodeURIComponent(LINKEDIN_REDIRECT_URI);
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;
    res.redirect(authUrl);
});

router.get('/linkedin/callback', async (req, res) => {
    try {
        if (!isLinkedInConfigured()) {
            return res.status(501).json({ message: 'LinkedIn login is not configured.' });
        }

        const { code } = req.query;
        if (!code) {
            return res.status(400).json({ message: 'Authorization code missing.' });
        }

        const tokenResponse = await axios.post(
            'https://www.linkedin.com/oauth/v2/accessToken',
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: LINKEDIN_REDIRECT_URI,
                client_id: LINKEDIN_CLIENT_ID,
                client_secret: LINKEDIN_CLIENT_SECRET
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const accessToken = tokenResponse.data.access_token;

        const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const profile = profileResponse.data;
        const email = profile.email;
        const firstName = profile.given_name || 'LinkedIn';
        const lastName = profile.family_name || 'User';

        if (!email) {
            return res.status(400).json({ message: 'Email not available from LinkedIn.' });
        }

        let user = await User.findOne({ email });

        if (!user) {
            const userId = await generateUniqueUserId(firstName);
            const randomPassword = generateRandomPassword();
            const hashedPassword = await bcryptjs.hash(randomPassword, 10);

            user = new User({
                firstName,
                lastName,
                email,
                phone: `linkedin_${Date.now()}`,
                userId,
                passwordHash: hashedPassword,
                dob: new Date('1990-01-01'),
                emailVerified: true,
                phoneVerified: false,
                isActive: true
            });

            await user.save();
            await sendCredentialsEmail(email, firstName, userId, randomPassword);
        }

        const token = jwt.encode({
            userId: user._id.toString(),
            email: user.email,
            user_id: user.userId,
            exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY
        }, JWT_SECRET);

        res.send(`
            <html>
            <head><title>LinkedIn Login</title></head>
            <body>
                <script>
                    localStorage.setItem('userToken', '${token}');
                    localStorage.setItem('userId', '${user._id.toString()}');
                    localStorage.setItem('user_id', '${user.userId}');
                    localStorage.setItem('userName', '${user.firstName} ${user.lastName}');
                    localStorage.setItem('userEmail', '${user.email}');
                    window.location.href = '/dashboard.html?auth=user';
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('LinkedIn login error:', error);
        res.status(500).json({ message: 'LinkedIn login failed' });
    }
});

// ===== Google OAuth =====
router.get('/google', (req, res) => {
    if (!isGoogleConfigured()) {
        return res.status(501).json({ message: 'Google login is not configured.' });
    }

    const state = `nb_${Date.now()}`;
    const scope = encodeURIComponent('openid profile email');
    const redirectUri = encodeURIComponent(GOOGLE_REDIRECT_URI);
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}&access_type=offline`;
    res.redirect(authUrl);
});

router.get('/google/callback', async (req, res) => {
    try {
        if (!isGoogleConfigured()) {
            return res.status(501).json({ message: 'Google login is not configured.' });
        }

        const { code } = req.query;
        if (!code) {
            return res.status(400).json({ message: 'Authorization code missing.' });
        }

        const tokenResponse = await axios.post(
            'https://oauth2.googleapis.com/token',
            {
                grant_type: 'authorization_code',
                code,
                redirect_uri: GOOGLE_REDIRECT_URI,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET
            }
        );

        const accessToken = tokenResponse.data.access_token;

        const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo?access_token=' + accessToken);

        const profile = profileResponse.data;
        const email = profile.email;
        const firstName = profile.given_name || 'Google';
        const lastName = profile.family_name || 'User';

        if (!email) {
            return res.status(400).json({ message: 'Email not available from Google.' });
        }

        let user = await User.findOne({ email });

        if (!user) {
            const userId = await generateUniqueUserId(firstName);
            const randomPassword = generateRandomPassword();
            const hashedPassword = await bcryptjs.hash(randomPassword, 10);

            user = new User({
                firstName,
                lastName,
                email,
                phone: `google_${Date.now()}`,
                userId,
                passwordHash: hashedPassword,
                dob: new Date('1990-01-01'),
                emailVerified: true,
                phoneVerified: false,
                isActive: true
            });

            await user.save();
            await sendCredentialsEmail(email, firstName, userId, randomPassword);
        }

        const token = jwt.encode({
            userId: user._id.toString(),
            email: user.email,
            user_id: user.userId,
            exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY
        }, JWT_SECRET);

        res.send(`
            <html>
            <head><title>Google Login</title></head>
            <body>
                <script>
                    localStorage.setItem('userToken', '${token}');
                    localStorage.setItem('userId', '${user._id.toString()}');
                    localStorage.setItem('user_id', '${user.userId}');
                    localStorage.setItem('userName', '${user.firstName} ${user.lastName}');
                    localStorage.setItem('userEmail', '${user.email}');
                    window.location.href = '/dashboard.html?auth=user';
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ message: 'Google login failed' });
    }
});

// ===== Facebook OAuth =====
router.get('/facebook', (req, res) => {
    if (!isFacebookConfigured()) {
        return res.status(501).json({ message: 'Facebook login is not configured.' });
    }

    const state = `nb_${Date.now()}`;
    const scope = encodeURIComponent('email public_profile');
    const redirectUri = encodeURIComponent(FACEBOOK_REDIRECT_URI);
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_CLIENT_ID}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;
    res.redirect(authUrl);
});

router.get('/facebook/callback', async (req, res) => {
    try {
        if (!isFacebookConfigured()) {
            return res.status(501).json({ message: 'Facebook login is not configured.' });
        }

        const { code } = req.query;
        if (!code) {
            return res.status(400).json({ message: 'Authorization code missing.' });
        }

        const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
            params: {
                client_id: FACEBOOK_CLIENT_ID,
                client_secret: FACEBOOK_CLIENT_SECRET,
                redirect_uri: FACEBOOK_REDIRECT_URI,
                code
            }
        });

        const accessToken = tokenResponse.data.access_token;

        const profileResponse = await axios.get('https://graph.facebook.com/me?fields=id,name,email,picture&access_token=' + accessToken);

        const profile = profileResponse.data;
        const email = profile.email;
        const nameParts = profile.name ? profile.name.split(' ') : ['Facebook', 'User'];
        const firstName = nameParts[0] || 'Facebook';
        const lastName = nameParts.slice(1).join(' ') || 'User';

        if (!email) {
            return res.status(400).json({ message: 'Email not available from Facebook.' });
        }

        let user = await User.findOne({ email });

        if (!user) {
            const userId = await generateUniqueUserId(firstName);
            const randomPassword = generateRandomPassword();
            const hashedPassword = await bcryptjs.hash(randomPassword, 10);

            user = new User({
                firstName,
                lastName,
                email,
                phone: `facebook_${Date.now()}`,
                userId,
                passwordHash: hashedPassword,
                dob: new Date('1990-01-01'),
                emailVerified: true,
                phoneVerified: false,
                isActive: true
            });

            await user.save();
            await sendCredentialsEmail(email, firstName, userId, randomPassword);
        }

        const token = jwt.encode({
            userId: user._id.toString(),
            email: user.email,
            user_id: user.userId,
            exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY
        }, JWT_SECRET);

        res.send(`
            <html>
            <head><title>Facebook Login</title></head>
            <body>
                <script>
                    localStorage.setItem('userToken', '${token}');
                    localStorage.setItem('userId', '${user._id.toString()}');
                    localStorage.setItem('user_id', '${user.userId}');
                    localStorage.setItem('userName', '${user.firstName} ${user.lastName}');
                    localStorage.setItem('userEmail', '${user.email}');
                    window.location.href = '/dashboard.html?auth=user';
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Facebook login error:', error);
        res.status(500).json({ message: 'Facebook login failed' });
    }
});

// ===== User Logout =====
router.post('/logout', async (req, res) => {
    try {
        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Error during logout' });
    }
});

// ===== Automatic Signup Endpoint =====
router.post('/auto-signup', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, dob } = req.body;

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

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { phone: phoneDigits }]
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: 'इस ईमेल या फोन नंबर से खाता पहले से मौजूद है (User already exists with this email or phone)' 
            });
        }

        // Require OTP verification
        const emailOtpStatus = isOtpVerified(email);
        if (!emailOtpStatus.ok) {
            return res.status(400).json({ message: `Email OTP not verified: ${emailOtpStatus.message}` });
        }

        const phoneOtpStatus = isOtpVerified(phoneDigits);
        if (!phoneOtpStatus.ok) {
            return res.status(400).json({ message: `Phone OTP not verified: ${phoneOtpStatus.message}` });
        }

        // Generate unique user ID
        const userId = await generateUniqueUserId(firstName);
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

        // Create user
        const newUser = new User({
            firstName,
            lastName,
            email,
            phone: phoneDigits,
            userId,
            passwordHash: hashedPassword,
            dob: new Date(dob),
            emailVerified: false,
            phoneVerified: false,
            isActive: true
        });

        await newUser.save();
        console.log(`✅ User created in MongoDB with ID: ${newUser._id}`);

        // Log signup activity
        const activityLog = new ActivityLog({
            userId: newUser._id,
            activityType: 'SIGNUP',
            activityDescription: `User ${userId} created account - ${email}`
        });
        await activityLog.save();
        console.log(`📝 Activity logged for user ${userId}`);

        delete otpStorage[email];
        delete otpStorage[phoneDigits];

        // Send credentials via email
        const emailSent = await sendCredentialsEmail(email, firstName, userId, randomPassword);

        // Generate JWT token
        const token = jwt.encode({
            userId: newUser._id.toString(),
            email: email,
            user_id: userId,
            exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY
        }, JWT_SECRET);

        res.json({
            message: 'खाता सफलतापूर्वक बनाया गया (Account created successfully)',
            success: true,
            token,
            userId: newUser._id.toString(),
            user_id: userId,
            firstName: firstName,
            lastName: lastName,
            email: email,
            emailSent: emailSent,
            note: 'कृपया अपने ईमेल की जांच करें - आपकी लॉगिन आईडी और पासवर्ड ईमेल किए गए हैं (Check your email for login credentials)'
        });

    } catch (error) {
        console.error('Auto-signup error:', error);
        res.status(500).json({ 
            message: 'खाता बनाने में त्रुटि (Error creating account)', 
            error: error.message 
        });
    }
});

module.exports = router;
