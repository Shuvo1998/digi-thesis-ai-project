const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware'); // Import the protect middleware

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe); // Now protected!

module.exports = router;