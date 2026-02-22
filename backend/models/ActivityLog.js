/* ===== Activity Log Model for MongoDB ===== */

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    activityType: {
        type: String,
        required: true,
        enum: ['SIGNUP', 'LOGIN', 'LOGOUT', 'PROFILE_UPDATE', 'POST_CREATE', 'POST_UPDATE', 'POST_DELETE', 'OTHER']
    },
    activityDescription: {
        type: String,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ activityType: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
