/* ===== Posts Routes ===== */

const express = require('express');
const router = express.Router();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    req.user = { userId: 1 };
    next();
};

// ===== Create Post =====
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description, content, visibility, seoTitle, seoDescription } = req.body;
        const userId = req.user.userId;
        const pool = req.pool;
        const connection = await pool.getConnection();

        await connection.execute(
            `INSERT INTO posts (user_id, title, description, content, visibility, seo_title, seo_description)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, title, description, content, visibility, seoTitle, seoDescription]
        );

        await connection.release();
        res.json({ message: 'Post created successfully' });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post' });
    }
});

// ===== Get Feed =====
router.get('/feed', authenticateToken, async (req, res) => {
    try {
        const pool = req.pool;
        const connection = await pool.getConnection();

        const [posts] = await connection.execute(
            `SELECT p.id, p.title, p.description, p.featured_image, p.created_at,
                    u.first_name as authorName, u.user_id,
                    (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likesCount,
                    (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as commentsCount,
                    (SELECT COUNT(*) FROM shares WHERE post_id = p.id) as sharesCount
             FROM posts p
             JOIN users u ON p.user_id = u.id
             WHERE p.visibility = 'public' AND p.is_deleted = FALSE
             ORDER BY p.view_count DESC, p.created_at DESC
             LIMIT 20`
        );

        await connection.release();
        res.json(posts);
    } catch (error) {
        console.error('Error fetching feed:', error);
        res.status(500).json({ message: 'Error fetching feed' });
    }
});

// ===== Like Post =====
router.post('/:postId/like', authenticateToken, async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.userId;
        const pool = req.pool;
        const connection = await pool.getConnection();

        // Check if already liked
        const [existingLike] = await connection.execute(
            'SELECT * FROM likes WHERE post_id = ? AND user_id = ?',
            [postId, userId]
        );

        if (existingLike.length > 0) {
            // Unlike
            await connection.execute(
                'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
                [postId, userId]
            );
        } else {
            // Like
            await connection.execute(
                'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
                [postId, userId]
            );
        }

        await connection.release();
        res.json({ message: 'Like operation successful' });
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ message: 'Error toggling like' });
    }
});

// ===== Get Comments =====
router.get('/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params;
        const pool = req.pool;
        const connection = await pool.getConnection();

        const [comments] = await connection.execute(
            `SELECT c.id, c.comment_text, c.created_at, u.first_name as authorName
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.post_id = ? AND c.is_deleted = FALSE
             ORDER BY c.created_at DESC`,
            [postId]
        );

        await connection.release();
        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Error fetching comments' });
    }
});

// ===== Add Comment =====
router.post('/:postId/comments', authenticateToken, async (req, res) => {
    try {
        const { postId } = req.params;
        const { text } = req.body;
        const userId = req.user.userId;
        const pool = req.pool;
        const connection = await pool.getConnection();

        await connection.execute(
            'INSERT INTO comments (post_id, user_id, comment_text) VALUES (?, ?, ?)',
            [postId, userId, text]
        );

        await connection.release();
        res.json({ message: 'Comment added successfully' });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Error adding comment' });
    }
});

module.exports = router;
