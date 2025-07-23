const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true // Store emails in lowercase
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'supervisor', 'admin'], // Define allowed roles
        default: 'student' // Default role for new users
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);