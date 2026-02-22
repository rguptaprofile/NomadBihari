/* ===== Users Routes with MongoDB ===== */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');

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

        const user = await User.findById(userId).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
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

        const user = await User.findByIdAndUpdate(
            userId,
            { firstName, lastName, bio },
            { new: true }
        ).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// ===== Delete User Account =====
router.delete('/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        await User.findByIdAndDelete(userId);

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

        const posts = await Post.find({ 
            userId: userId,
            isDeleted: false 
        })
        .sort({ createdAt: -1 })
        .populate('userId', 'firstName lastName');

        // Add counts
        const postsWithCounts = posts.map(post => ({
            ...post.toObject(),
            likesCount: post.likes.length,
            commentsCount: post.comments.length
        }));

        res.json(postsWithCounts);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({ message: 'Error fetching posts' });
    }
});

// ===== Get User Analytics =====
router.get('/:userId/analytics', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        const totalPosts = await Post.countDocuments({ userId, isDeleted: false });
        const totalViews = await Post.aggregate([
            { $match: { userId: userId, isDeleted: false } },
            { $group: { _id: null, total: { $sum: '$viewCount' } } }
        ]);

        const totalLikes = await Post.aggregate([
            { $match: { userId: userId, isDeleted: false } },
            { $project: { likesCount: { $size: '$likes' } } },
            { $group: { _id: null, total: { $sum: '$likesCount' } } }
        ]);

        res.json({
            totalPosts,
            totalViews: totalViews[0]?.total || 0,
            totalLikes: totalLikes[0]?.total || 0
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

module.exports = router;
