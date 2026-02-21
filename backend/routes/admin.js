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
router.get('/dashboard/overview', async (req, res) => {
    try {
        const pool = req.pool;
        const connection = await pool.getConnection();

        // Get total users
        const [totalUsersResult] = await connection.execute(
            'SELECT COUNT(*) as count FROM users WHERE is_active = true'
        );
        const totalUsers = totalUsersResult[0]?.count || 0;

        // Get total posts
        const [totalPostsResult] = await connection.execute(
            'SELECT COUNT(*) as count FROM posts WHERE is_deleted = false'
        );
        const totalPosts = totalPostsResult[0]?.count || 0;

        // Get total engagement (likes + comments + shares)
        const [engagementResult] = await connection.execute(
            `SELECT 
                (SELECT COUNT(*) FROM likes) +
                (SELECT COUNT(*) FROM comments WHERE is_deleted = false) +
                (SELECT COUNT(*) FROM shares) as count`
        );
        const totalEngagement = engagementResult[0]?.count || 0;

        // Get total revenue (placeholder)
        const totalRevenue = 0;

        // Get recent activities
        const [recentActivity] = await connection.execute(
            `SELECT al.id, al.activity_type, al.activity_description, al.created_at as timestamp
             FROM activity_logs al
             ORDER BY al.created_at DESC
             LIMIT 10`
        );

        await connection.release();

        res.json({
            totalUsers,
            totalPosts,
            totalEngagement,
            totalRevenue,
            recentActivity: recentActivity.map(a => ({
                description: a.activity_description || a.activity_type,
                type: a.activity_type,
                timestamp: a.timestamp
            }))
        });
    } catch (error) {
        console.error('Error fetching dashboard overview:', error);
        res.status(500).json({ message: 'Error fetching dashboard data' });
    }
});

// ===== Get All Users =====
router.get('/users', async (req, res) => {
    try {
        const pool = req.pool;
        const connection = await pool.getConnection();
        const search = req.query.search || '';

        let query = 'SELECT id, first_name, last_name, email, phone, user_id, created_at, is_active FROM users';
        let params = [];

        if (search) {
            query += ' WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR user_id LIKE ?';
            const searchPattern = `%${search}%`;
            params = [searchPattern, searchPattern, searchPattern, searchPattern];
        }

        query += ' ORDER BY created_at DESC LIMIT 100';

        const [users] = await connection.execute(query, params);
        await connection.release();

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// ===== Delete User =====
router.delete('/users/:userId', async (req, res) => {
    try {
        const pool = req.pool;
        const connection = await pool.getConnection();
        const userId = req.params.userId;

        // Soft delete - mark as inactive
        await connection.execute(
            'UPDATE users SET is_active = false WHERE id = ?',
            [userId]
        );

        await connection.release();

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// ===== Get All Posts =====
router.get('/posts', async (req, res) => {
    try {
        const pool = req.pool;
        const connection = await pool.getConnection();
        const search = req.query.search || '';

        let query = `SELECT p.id, p.title, p.user_id, u.user_id as author, u.first_name, u.last_name, 
                     p.view_count, p.created_at, p.visibility
                     FROM posts p
                     JOIN users u ON p.user_id = u.id
                     WHERE p.is_deleted = false`;
        let params = [];

        if (search) {
            query += ' AND (p.title LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)';
            const searchPattern = `%${search}%`;
            params = [searchPattern, searchPattern, searchPattern];
        }

        query += ' ORDER BY p.created_at DESC LIMIT 100';

        const [posts] = await connection.execute(query, params);
        await connection.release();

        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Error fetching posts' });
    }
});

// ===== Delete Post =====
router.delete('/posts/:postId', async (req, res) => {
    try {
        const pool = req.pool;
        const connection = await pool.getConnection();
        const postId = req.params.postId;

        // Soft delete
        await connection.execute(
            'UPDATE posts SET is_deleted = true WHERE id = ?',
            [postId]
        );

        await connection.release();

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Error deleting post' });
    }
});

// ===== Create Post (Admin) =====
router.post('/posts', async (req, res) => {
    try {
        const pool = req.pool;
        const connection = await pool.getConnection();
        const { title, description, content, featuredImage, visibility, adminId } = req.body;

        const [result] = await connection.execute(
            `INSERT INTO posts (user_id, title, description, content, featured_image, visibility, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [1, title, description, content, featuredImage, visibility || 'public']
        );

        await connection.release();

        res.json({ message: 'Post created successfully', postId: result.insertId });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post' });
    }
});

// ===== Get Analytics =====
router.get('/analytics', async (req, res) => {
    try {
        const pool = req.pool;
        const connection = await pool.getConnection();

        // Users growth (last 7 days)
        const [usersGrowth] = await connection.execute(
            `SELECT DATE(created_at) as date, COUNT(*) as count 
             FROM users 
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
             GROUP BY DATE(created_at)
             ORDER BY date ASC`
        );

        // Posts growth
        const [postsGrowth] = await connection.execute(
            `SELECT DATE(created_at) as date, COUNT(*) as count 
             FROM posts 
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND is_deleted = false
             GROUP BY DATE(created_at)
             ORDER BY date ASC`
        );

        // Top posts
        const [topPosts] = await connection.execute(
            `SELECT id, title, view_count, created_at 
             FROM posts 
             WHERE is_deleted = false
             ORDER BY view_count DESC
             LIMIT 10`
        );

        await connection.release();

        res.json({
            usersGrowth,
            postsGrowth,
            topPosts
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

// ===== Get Contact Queries =====
router.get('/contact-queries', async (req, res) => {
    try {
        const pool = req.pool;
        const connection = await pool.getConnection();

        const [queries] = await connection.execute(
            `SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 100`
        );

        await connection.release();

        res.json(queries || []);
    } catch (error) {
        console.error('Error fetching contact queries:', error);
        res.status(500).json({ message: 'Error fetching contact queries', data: [] });
    }
});

// ===== Get Activity Logs =====
router.get('/activity-logs', async (req, res) => {
    try {
        const pool = req.pool;
        const connection = await pool.getConnection();

        const [logs] = await connection.execute(
            `SELECT * FROM admin_activity_logs ORDER BY created_at DESC LIMIT 100`
        );

        await connection.release();

        res.json(logs || []);
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({ message: 'Error fetching activity logs', data: [] });
    }
});

module.exports = router;
