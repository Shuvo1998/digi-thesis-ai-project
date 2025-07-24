// backend/routes/api/users.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');
const auth = require('../../middleware/auth'); // Import auth middleware
const authorizeRole = require('../../middleware/role'); // Import authorizeRole middleware

// @route   POST api/users
// @desc    Register user (existing route)
// @access  Public
router.post(
    '/',
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
                    role: user.role,
                    username: user.username, // Include username in JWT payload
                    email: user.email // Include email in JWT payload
                },
            };

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: '5h' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   GET api/users/all
// @desc    Get all users (accessible by admin/supervisor)
// @access  Private (Admin/Supervisor)
router.get(
    '/all',
    auth, // Authenticated users only
    authorizeRole('admin', 'supervisor'), // Only admin or supervisor roles
    async (req, res) => {
        try {
            // Fetch all users, but exclude their passwords for security
            const users = await User.find().select('-password').sort({ date: 1 }); // Sort by join date
            res.json(users);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);


module.exports = router;
