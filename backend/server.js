/* ===== Nomad Bihari Backend Server ===== */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== MySQL Connection Pool =====
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'nomad_bihari',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ===== Store pool for use in routes =====
app.use((req, res, next) => {
    req.pool = pool;
    next();
});

// ===== Health Check =====
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// ===== API Routes =====

// Authentication Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// User Routes
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

// Posts Routes
const postsRoutes = require('./routes/posts');
app.use('/api/posts', postsRoutes);

// Admin Routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Contact Routes
const contactRoutes = require('./routes/contact');
app.use('/api/contact', contactRoutes);

// Chatbot Routes
const chatbotRoutes = require('./routes/chatbot');
app.use('/api/chatbot', chatbotRoutes);

// AI Routes - Temporarily disabled (requires openai package)
// const aiRoutes = require('./routes/ai');
// app.use('/api/ai', aiRoutes);

// ===== Error Handling =====
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error'
    });
});

// ===== 404 Handler =====
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Nomad Bihari Backend Server running on http://localhost:${PORT}`);
    console.log(`📚 Database: ${process.env.DB_NAME || 'nomad_bihari'}`);
});

module.exports = app;
