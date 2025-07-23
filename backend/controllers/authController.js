const User = require('../models/User'); // Import the User model
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For creating JWTs

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        // Check if user already exists by email or username
        let user = await User.findOne({ $or: [{ email }, { username }] });

        if (user) {
            return res.status(400).json({ message: 'User with that email or username already exists' });
        }

        // Create new user instance
        user = new User({
            username,
            email,
            password, // Password will be hashed before saving
            role: role || 'student' // Use provided role or default to 'student'
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user to database
        await user.save();

        // Create and send JWT (optional here, but useful if user logs in immediately after registering)
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, // JWT_SECRET will be added to .env
            { expiresIn: '1h' }, // Token expires in 1 hour
            (err, token) => {
                if (err) throw err;
                res.status(201).json({
                    message: 'User registered successfully',
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare entered password with hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // User matched, create and return JWT
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, // JWT_SECRET from .env
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    message: 'Logged in successfully',
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get logged in user info
// @route   GET /api/auth/me
// @access  Private (will be protected in next step)
exports.getMe = async (req, res) => {
    try {
        // req.user will come from our auth middleware (next step)
        const user = await User.findById(req.user.id).select('-password'); // Exclude password from response
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};