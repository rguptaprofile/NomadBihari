/* ===== User Model for MongoDB ===== */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    userId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    profileImage: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    phoneVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Indexes are automatically created by unique: true in schema definition

module.exports = mongoose.model('User', userSchema);
