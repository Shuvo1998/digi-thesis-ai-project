// backend/routes/api/users.js
const express = require('express');
const router = express.Router(); // THIS LINE IS CRITICAL - MUST BE express.Router()
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../../models/User');
const auth = require('../../middleware/auth'); // Import auth middleware
const authorizeRole = require('../../middleware/role'); // Import authorizeRole middleware

// @route   POST api/users
// @desc    Register user
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
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'User already exists' }] });
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
                    username: user.username,
                    email: user.email
                }
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
            res.status(500).send('Server error');
        }
    }
);

// @route   GET api/users/all
// @desc    Get all users with pagination (accessible by admin/supervisor)
// @access  Private (Admin/Supervisor)
router.get(
    '/all',
    auth, // Authenticated users only
    authorizeRole('admin', 'supervisor'), // Only admin or supervisor roles
    async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1; // Current page number, default to 1
            const limit = parseInt(req.query.limit) || 10; // Items per page, default to 10
            const skipIndex = (page - 1) * limit; // Calculate how many documents to skip

            // Get total count of users for pagination info
            const totalUsers = await User.countDocuments();

            // Fetch users with pagination, excluding passwords
            const users = await User.find()
                .select('-password')
                .sort({ date: 1 }) // Sort by join date
                .limit(limit)
                .skip(skipIndex);

            res.json({
                users,
                currentPage: page,
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers,
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   PUT api/users/role/:id
// @desc    Update a user's role (accessible by admin/supervisor)
// @access  Private (Admin/Supervisor)
router.put(
    '/role/:id', // This is a parameterized route
    auth, // Authenticated users only
    authorizeRole('admin', 'supervisor'), // Only admin or supervisor roles
    [
        check('role', 'Valid role (user, supervisor, admin) is required').isIn(['user', 'supervisor', 'admin'])
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { role } = req.body; // New role from the request body
        const userIdToUpdate = req.params.id; // ID of the user whose role is being updated

        try {
            let userToUpdate = await User.findById(userIdToUpdate);

            if (!userToUpdate) {
                return res.status(404).json({ msg: 'User not found' });
            }

            // Prevent an admin/supervisor from changing their own role via this endpoint
            if (req.user.id === userIdToUpdate) {
                return res.status(403).json({ msg: 'You cannot change your own role via this endpoint.' });
            }

            // Optional: Prevent supervisors from changing admin roles
            if (req.user.role === 'supervisor' && userToUpdate.role === 'admin') {
                return res.status(403).json({ msg: 'Supervisors cannot change administrator roles.' });
            }

            // Update the user's role
            userToUpdate.role = role;
            await userToUpdate.save();

            // Return the updated user (without password)
            res.json({ msg: `User role updated to ${role}`, user: userToUpdate.select('-password') });

        } catch (err) {
            console.error(err.message);
            if (err.kind === 'ObjectId') {
                return res.status(404).json({ msg: 'User not found' });
            }
            res.status(500).send('Server Error');
        }
    }
);


module.exports = router;
