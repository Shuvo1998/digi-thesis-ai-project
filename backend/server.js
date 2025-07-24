// backend/server.js

const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors'); // Import cors

const app = express();

// Connect Database
connectDB();

// Init Middleware
// Allows us to get data in req.body
app.use(express.json({ extended: false }));
app.use(cors()); // Use cors middleware to allow cross-origin requests

// Define Routes
app.use('/api/users', require('./routes/api/users')); // <-- ENSURE THIS LINE IS PRESENT AND CORRECT
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/theses', require('./routes/api/theses')); // For thesis-related routes

// Serve static assets in production (for uploaded files)
app.use('/uploads', express.static('uploads')); // Serve files from the 'uploads' directory

// Simple test route
app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
