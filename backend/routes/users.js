/* ===== Users Routes ===== */

const express = require('express');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // Token verification logic
        req.user = { userId: 1 }; // In production, decode JWT
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
};

// ===== Get User Profile =====
router.get('/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const pool = req.pool;
        const connection = await pool.getConnection();

        const [users] = await connection.execute(
            'SELECT id, first_name, last_name, email, phone, user_id, dob, bio, profile_image, created_at FROM users WHERE id = ?',
            [userId]
        );

        await connection.release();

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
});

// ===== Update User Profile =====
router.put('/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { firstName, lastName, bio } = req.body;
        const pool = req.pool;
        const connection = await pool.getConnection();

        await connection.execute(
            'UPDATE users SET first_name = ?, last_name = ?, bio = ? WHERE id = ?',
            [firstName, lastName, bio, userId]
        );

        await connection.release();
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// ===== Delete User Account =====
router.delete('/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const pool = req.pool;
        const connection = await pool.getConnection();

        await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
        await connection.release();

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Error deleting account' });
    }
});

// ===== Get User Posts =====
router.get('/:userId/posts', async (req, res) => {
    try {
        const { userId } = req.params;
        const pool = req.pool;
        const connection = await pool.getConnection();

        const [posts] = await connection.execute(
            `SELECT id, title, description, content, visibility, featured_image, view_count,
                    created_at, (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) as likesCount,
                    (SELECT COUNT(*) FROM comments WHERE post_id = posts.id) as commentsCount,
                    (SELECT COUNT(*) FROM shares WHERE post_id = posts.id) as sharesCount
             FROM posts WHERE user_id = ? AND is_deleted = FALSE ORDER BY created_at DESC`,
            [userId]
        );

        await connection.release();
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Error fetching posts' });
    }
});

// ===== Get User Analytics =====
router.get('/:userId/analytics', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const pool = req.pool;
        const connection = await pool.getConnection();

        const [stats] = await connection.execute(
            `SELECT 
                (SELECT COUNT(*) FROM posts WHERE user_id = ?) as totalPosts,
                (SELECT COALESCE(SUM(view_count), 0) FROM posts WHERE user_id = ?) as totalViews,
                (SELECT COUNT(*) FROM likes WHERE post_id IN (SELECT id FROM posts WHERE user_id = ?)) as totalLikes,
                (SELECT COUNT(*) FROM comments WHERE post_id IN (SELECT id FROM posts WHERE user_id = ?)) as totalComments,
                (SELECT COUNT(*) FROM shares WHERE post_id IN (SELECT id FROM posts WHERE user_id = ?)) as totalShares,
                (SELECT COUNT(*) FROM push_notification_subscriptions WHERE user_id = ?) as subscribersCount`,
            [userId, userId, userId, userId, userId, userId]
        );

        await connection.release();
        res.json(stats[0] || {});
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

module.exports = router;
