// backend/middleware/auth.js

const jwt = require('jsonwebtoken'); // To verify JWTs
require('dotenv').config(); // To access JWT_SECRET from .env

const jwtSecret = process.env.JWT_SECRET; // Get your JWT secret

module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token'); // Conventionally, the token is sent in a header named 'x-auth-token'

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' }); // 401 Unauthorized
    }

    // Verify token
    try {
        // Verify the token using your secret
        const decoded = jwt.verify(token, jwtSecret);

        // Attach the decoded user object (from the token payload) to the request
        // This makes user data (like user ID) available in subsequent route handlers
        req.user = decoded.user;
        next(); // Move to the next middleware/route handler
    } catch (err) {
        // If token is not valid (e.g., expired, malformed)
        res.status(401).json({ msg: 'Token is not valid' });
    }
};