// backend/models/Thesis.js

const mongoose = require('mongoose');

const ThesisSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References the User model
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    abstract: {
        type: String,
        required: true,
        trim: true
    },
    keywords: {
        type: [String], // Array of strings
        default: []
    },
    filePath: { // Path to the uploaded PDF file on the server
        type: String,
        required: true
    },
    fileName: { // Original name of the uploaded file
        type: String,
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
    plagiarismResult: { // Field to store plagiarism check results
        type: String,
        default: null
    },
    grammarResult: { // ADDED: Field to store grammar correction results
        type: String, // Will store the text output from the AI model
        default: null // Default to null until checked
    }
});

module.exports = mongoose.model('Thesis', ThesisSchema);
