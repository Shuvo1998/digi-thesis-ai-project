// backend/routes/api/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For generating tokens
const { check, validationResult } = require('express-validator'); // For input validation

// Load User model
const User = require('../../models/User');

// Load environment variables
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET; // Retrieve JWT secret from .env

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post(
    '/register',
    [
        // Input validation using express-validator
        check('username', 'Username is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;

        try {
            // 1. Check if user already exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
            }

            // If user doesn't exist, create a new User instance
            user = new User({
                username,
                email,
                password, // This will be hashed next
            });

            // 2. Hash password
            const salt = await bcrypt.genSalt(10); // Generate a salt (recommended 10 rounds)
            user.password = await bcrypt.hash(password, salt); // Hash the password with the salt

            // 3. Save user to database
            await user.save();

            // 4. Create and return JSON Web Token (JWT)
            const payload = {
                user: {
                    id: user.id, // Mongoose creates an _id field which we access as .id
                    username: user.username, // Include username in payload for convenience
                    email: user.email // Include email in payload for convenience
                },
            };

            jwt.sign(
                payload,
                jwtSecret,
                { expiresIn: '1h' }, // Token expires in 1 hour (adjust as needed)
                (err, token) => {
                    if (err) throw err;
                    res.json({ token }); // Send the token back to the client
                }
            );

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
    '/login',
    [
        // Input validation for login
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // 1. Check if user exists (by email)
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            // 2. Compare entered password with hashed password in DB
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            // 3. Create and return JWT (same as registration)
            const payload = {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                },
            };

            jwt.sign(
                payload,
                jwtSecret,
                { expiresIn: '1h' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

module.exports = router;