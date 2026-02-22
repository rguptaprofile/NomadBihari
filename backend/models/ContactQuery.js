/* ===== Contact Query Model for MongoDB ===== */

const mongoose = require('mongoose');

const contactQuerySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        default: ''
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['new', 'read', 'replied', 'closed'],
        default: 'new'
    },
    replyMessage: {
        type: String,
        default: ''
    },
    repliedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index
contactQuerySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ContactQuery', contactQuerySchema);
