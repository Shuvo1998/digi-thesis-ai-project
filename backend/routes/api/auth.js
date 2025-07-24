// backend/routes/api/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth'); // Import auth middleware
const User = require('../../models/User');

// @route   GET api/auth
// @desc    Get authenticated user profile (by token)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // req.user.id is available from the auth middleware
        // .select('-password') excludes the password field from the returned user object
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user); // Returns user object with id, username, email, role
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/auth/profile
// @desc    Update authenticated user's profile
// @access  Private
router.put(
    '/profile',
    auth, // Ensure user is authenticated
    [
        // Optional validation for fields that can be updated
        check('username', 'Username is required').optional().not().isEmpty(),
        check('email', 'Please include a valid email').optional().isEmail(),
        // Password update would be a separate, more secure process
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email } = req.body;
        const userFields = {};

        if (username) userFields.username = username;
        if (email) userFields.email = email;

        try {
            let user = await User.findById(req.user.id);

            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }

            // Check if email is being updated and if it already exists for another user
            if (email && email !== user.email) {
                let existingUserWithEmail = await User.findOne({ email });
                if (existingUserWithEmail && existingUserWithEmail.id.toString() !== user.id.toString()) {
                    return res.status(400).json({ errors: [{ msg: 'Email already in use by another account.' }] });
                }
            }

            // Update user profile
            user = await User.findByIdAndUpdate(
                req.user.id,
                { $set: userFields },
                { new: true, runValidators: true } // new: true returns the updated document; runValidators: true runs schema validators
            ).select('-password'); // Exclude password from the response

            res.json({ msg: 'Profile updated successfully', user });

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);


// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post(
    '/register',
    [
        check('username', 'Username is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check(
            'password',
            'Please enter a password with 6 or more characters'
        ).isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;

        try {
            let user = await User.findOne({ email });

            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
            }

            user = new User({
                username,
                email,
                password,
                role: 'user' // Default role for new registrations
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            const payload = {
                user: {
                    id: user.id,
                    role: user.role, // Include role in JWT payload
                    username: user.username, // Include username in JWT payload
                    email: user.email // Include email in JWT payload
                },
            };

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: '5h' }, // Increased to 5 hours for better testing flow
                (err, token) => {
                    if (err) throw err;
                    // Send token and the full user object (excluding password)
                    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
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
            let user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const payload = {
                user: {
                    id: user.id,
                    role: user.role, // Include role in JWT payload
                    username: user.username, // Include username in JWT payload
                    email: user.email // Include email in JWT payload
                },
            };

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: '5h' }, // Increased to 5 hours for better testing flow
                (err, token) => {
                    if (err) throw err;
                    // Send token and the full user object (excluding password)
                    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

module.exports = router;
