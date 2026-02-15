/* ===== Admin Routes ===== */

const express = require('express');
const router = express.Router();

const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    req.admin = { adminId: 1 };
    next();
};

// ===== Dashboard Overview =====
router.get('/dashboard/overview', authenticateAdmin, async (req, res) => {
    try {
        const pool = req.pool;
        const connection = await pool.getConnection();

        const [overview] = await connection.execute(
            `SELECT
                (SELECT COUNT(*) FROM users) as totalUsers,
                (SELECT COUNT(*) FROM posts) as totalPosts,
                (SELECT COALESCE(SUM(view_count), 0) FROM posts) as totalEngagement,
                (SELECT COALESCE(SUM(revenue), 0) FROM ad_revenue) as totalRevenue`
        );

        await connection.release();
        res.json(overview[0] || {});
    } catch (error) {
        console.error('Error fetching dashboard overview:', error);
        res.status(500).json({ message: 'Error fetching overview' });
    }
});

// ===== Get All Users =====
router.get('/users', authenticateAdmin, async (req, res) => {
    try {
        const { search } = req.query;
        const pool = req.pool;
        const connection = await pool.getConnection();

        let query = `SELECT id, user_id, first_name, last_name, email, phone, created_at,
                           (SELECT COUNT(*) FROM posts WHERE user_id = users.id) as postCount
                    FROM users`;
        let params = [];

        if (search) {
            query += ` WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR user_id LIKE ?`;
            const searchParam = `%${search}%`;
            params = [searchParam, searchParam, searchParam, searchParam];
        }

        query += ` ORDER BY created_at DESC LIMIT 100`;

        const [users] = await connection.execute(query, params);
        await connection.release();

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// ===== Get All Posts =====
router.get('/posts', authenticateAdmin, async (req, res) => {
    try {
        const { search } = req.query;
        const pool = req.pool;
        const connection = await pool.getConnection();

        let query = `SELECT p.id, p.title, p.visibility, p.created_at, p.view_count,
                           u.first_name, u.last_name, CONCAT(u.first_name, ' ', u.last_name) as authorName
                    FROM posts p
                    JOIN users u ON p.user_id = u.id`;
        let params = [];

        if (search) {
            query += ` WHERE p.title LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?`;
            const searchParam = `%${search}%`;
            params = [searchParam, searchParam, searchParam];
        }

        query += ` ORDER BY p.created_at DESC LIMIT 100`;

        const [posts] = await connection.execute(query, params);
        await connection.release();

        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Error fetching posts' });
    }
});

// ===== Get Analytics =====
router.get('/analytics', authenticateAdmin, async (req, res) => {
    try {
        const pool = req.pool;
        const connection = await pool.getConnection();

        const [analytics] = await connection.execute(
            `SELECT
                (SELECT COALESCE(SUM(view_count), 0) FROM posts) as totalViews,
                (SELECT COUNT(*) FROM likes) as totalLikes,
                (SELECT COUNT(*) FROM comments) as totalComments,
                (SELECT COUNT(*) FROM shares) as totalShares`
        );

        await connection.release();
        res.json(analytics[0] || {});
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

// ===== Get Contact Queries =====
router.get('/contact-queries', authenticateAdmin, async (req, res) => {
    try {
        const pool = req.pool;
        const connection = await pool.getConnection();

        const [queries] = await connection.execute(
            `SELECT id, name, email, phone, subject, message, status, created_at
             FROM contact_queries
             ORDER BY created_at DESC`
        );

        await connection.release();
        res.json(queries);
    } catch (error) {
        console.error('Error fetching contact queries:', error);
        res.status(500).json({ message: 'Error fetching queries' });
    }
});

module.exports = router;
