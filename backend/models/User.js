// backend/models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Ensures no two users have the same username
        trim: true    // Removes whitespace from both ends of a string
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensures no two users have the same email
        lowercase: true // Converts email to lowercase before saving
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now // Automatically sets the current date when a user is created
    }
});

module.exports = mongoose.model('User', UserSchema);