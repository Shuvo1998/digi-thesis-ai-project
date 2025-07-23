// backend/server.js

const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false })); // For parsing application/json
app.use(cors()); // Enable CORS

// Define Routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/theses', require('./routes/api/theses')); // <-- ADD THIS LINE

// Serve static files from the 'uploads' directory (to access uploaded files via URL)
app.use('/uploads', express.static('uploads')); // <-- ADD THIS LINE

// Simple test route
app.get('/', (req, res) => {
    res.send('API Running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));