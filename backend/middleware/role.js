// backend/middleware/role.js

// This middleware checks if the authenticated user has one of the allowed roles.
// It should be used AFTER the 'auth' middleware, as it relies on req.user.

module.exports = (...allowedRoles) => { // Takes a variable number of arguments (roles)
    return (req, res, next) => {
        // Check if req.user exists (meaning 'auth' middleware ran successfully)
        if (!req.user || !req.user.role) {
            return res.status(401).json({ msg: 'Authorization denied: User role not found.' });
        }

        // Check if the user's role is included in the allowedRoles array
        const hasPermission = allowedRoles.includes(req.user.role);

        if (hasPermission) {
            next(); // User has permission, proceed to the next middleware/route handler
        } else {
            // User does not have permission
            res.status(403).json({ msg: 'Access denied: You do not have the required role.' }); // 403 Forbidden
        }
    };
};
