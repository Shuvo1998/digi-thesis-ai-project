// backend/routes/api/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config'); // For accessing jwtSecret
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth'); // Our authentication middleware
const User = require('../../models/User'); // User Model

// @route   GET api/auth
// @desc    Get user by token (for authenticated users)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // req.user.id comes from our auth middleware
        // .select('-password') excludes the password from the returned user object
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

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
                // Role will default to 'user' as per UserSchema definition
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            // Payload for JWT (ADDED role here)
            const payload = {
                user: {
                    id: user.id,
                    role: user.role // ADDED: Include the user's role in the JWT payload
                },
            };

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: '1h' }, // Token expires in 1 hour
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

            // Payload for JWT (ADDED role here)
            const payload = {
                user: {
                    id: user.id,
                    role: user.role // ADDED: Include the user's role in the JWT payload
                },
            };

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: '1h' }, // Token expires in 1 hour
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
