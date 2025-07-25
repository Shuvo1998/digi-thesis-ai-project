// backend/server.js
const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Explicitly require Mongoose models to ensure their schemas are registered
require('./models/User');
require('./models/Thesis');

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/theses', require('./routes/api/theses'));

// Serve static files from the 'uploads' directory
// This path is relative to the backend service's root, which is correct.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// REMOVED: The block for serving frontend static assets in production.
// This is handled by Vercel, not the Render backend.
/*
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('frontend/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
    });
}
*/

const PORT = process.env.PORT || 10000; // Use port 10000 for Render

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
