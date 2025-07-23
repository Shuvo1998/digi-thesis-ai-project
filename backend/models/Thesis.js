// backend/models/Thesis.js

const mongoose = require('mongoose');

const ThesisSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, // This will link the thesis to a specific user
        ref: 'User', // References the 'User' model
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    abstract: {
        type: String,
        required: true
    },
    keywords: {
        type: [String], // Array of strings
        default: []
    },
    filePath: {
        type: String, // Path where the file is stored on the server
        required: true
    },
    fileName: {
        type: String, // Original name of the file
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    // You can add more fields as needed, e.g., 'status', 'aiSummary', 'citations'
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'], // Example statuses
        default: 'pending'
    }
});

module.exports = mongoose.model('Thesis', ThesisSchema);