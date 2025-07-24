// backend/server.js
const express = require('express');
const connectDB = require('./config/db');
const path = require('path'); // Import path module
const cors = require('cors'); // Import cors

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors()); // Enable CORS for all routes

// NEW: Explicitly require User and Thesis models to ensure their schemas are registered
// This helps Mongoose find the 'user' and 'thesis' models when populating in other schemas.
require('./models/User');
require('./models/Thesis');

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/theses', require('./routes/api/theses'));

// Serve static files from the 'uploads' directory
// This is crucial for accessing the uploaded PDF files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('frontend/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
    });
}

const PORT = process.env.PORT || 10000; // Use port 10000 for Render

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
