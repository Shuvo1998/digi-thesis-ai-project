// backend/config/db.js

const mongoose = require('mongoose');
require('dotenv').config(); // Ensure dotenv is loaded to access process.env.MONGO_URI

const mongoURI = process.env.MONGO_URI; // Your MongoDB connection string from .env

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;