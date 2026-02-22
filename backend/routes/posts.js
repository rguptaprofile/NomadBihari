/* ===== Posts Routes with MongoDB ===== */

const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

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

        const post = new Post({
            userId,
            title,
            description,
            content,
            visibility: visibility || 'public',
            seoTitle,
            seoDescription
        });

        await post.save();
        res.json({ message: 'Post created successfully', post });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post' });
    }
});

// ===== Get Feed =====
router.get('/feed', authenticateToken, async (req, res) => {
    try {
        const posts = await Post.find({ 
            visibility: 'public',
            isDeleted: false 
        })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('userId', 'firstName lastName userId');

        const postsWithCounts = posts.map(post => ({
            id: post._id,
            title: post.title,
            description: post.description,
            featuredImage: post.featuredImage,
            createdAt: post.createdAt,
            authorName: post.userId ? `${post.userId.firstName} ${post.userId.lastName}` : 'Unknown',
            userId: post.userId?.userId || 'unknown',
            likesCount: post.likes.length,
            commentsCount: post.comments.length,
            sharesCount: 0
        }));

        res.json(postsWithCounts);
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

        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(userId);
        
        if (likeIndex > -1) {
            // Unlike
            post.likes.splice(likeIndex, 1);
        } else {
            // Like
            post.likes.push(userId);
        }

        await post.save();

        res.json({ 
            message: likeIndex > -1 ? 'Post unliked' : 'Post liked',
            likesCount: post.likes.length
        });
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ message: 'Error liking post' });
    }
});

// ===== Get Comments =====
router.get('/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId)
            .populate('comments.userId', 'firstName lastName userId');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post.comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Error fetching comments' });
    }
});

// ===== Add Comment =====
router.post('/:postId/comments', authenticateToken, async (req, res) => {
    try {
        const { postId } = req.params;
        const { commentText } = req.body;
        const userId = req.user.userId;

        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.comments.push({
            userId,
            commentText,
            createdAt: new Date()
        });

        await post.save();

        res.json({ 
            message: 'Comment added successfully',
            commentsCount: post.comments.length
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Error adding comment' });
    }
});

module.exports = router;
