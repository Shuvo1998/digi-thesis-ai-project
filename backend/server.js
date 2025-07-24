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

// Define Routes - TEMPORARILY COMMENTING OUT TO ISOLATE ERROR
app.use('/api/users', require('./routes/api/users'));
// app.use('/api/auth', require('./routes/api/auth'));
// app.use('/api/profile', require('./routes/api/profile'));
// app.use('/api/theses', require('./routes/api/theses'));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('frontend/build'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
    });
}

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
