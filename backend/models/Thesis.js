// backend/models/Thesis.js
const mongoose = require('mongoose');

const ThesisSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
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
    // NEW FIELDS ADDED BELOW
    authorName: {
        type: String,
        required: true // Making author name required
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
        default: true // Default to true for now, to keep existing public display working
    }
});

module.exports = mongoose.model('thesis', ThesisSchema);
