// backend/models/Thesis.js
const mongoose = require('mongoose');

const ThesisSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // <--- CHANGED FROM 'user' TO 'User' (uppercase U)
        required: true
    },
    title: {
        type: String,
        required: true
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
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    plagiarismResult: {
        type: String,
        default: 'Not checked'
    },
    grammarResult: {
        type: String,
        default: 'Not checked'
    },
    authorName: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    submissionYear: {
        type: Number,
        required: true
    },
    isPublic: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('thesis', ThesisSchema);
