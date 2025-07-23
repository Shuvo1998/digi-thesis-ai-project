const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token'); // Common header name for tokens

    // Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user from token payload to the request object
        req.user = decoded.user;
        next(); // Move to the next middleware/route handler
    } catch (err) {
        console.error(err.message); // Log the actual error for debugging
        res.status(401).json({ message: 'Token is not valid' });
    }
};