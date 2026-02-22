/* ===== Post Model for MongoDB ===== */

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    featuredImage: {
        type: String,
        default: null
    },
    seoTitle: {
        type: String,
        default: ''
    },
    seoDescription: {
        type: String,
        default: ''
    },
    viewCount: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        commentText: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ visibility: 1 });
postSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Post', postSchema);
