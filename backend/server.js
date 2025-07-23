require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/userRoutes'); // Import auth routes
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};
connectDB();

app.get('/', (req, res) => {
    res.send('DigiThesis AI Backend is running!');
});

// Use auth routes
app.use('/api/auth', authRoutes); // All auth routes will be prefixed with /api/auth

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});