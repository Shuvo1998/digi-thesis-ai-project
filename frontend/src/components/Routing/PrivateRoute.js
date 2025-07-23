import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext'; // Adjust path if needed

const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(UserContext);

    // 1. If authentication status is still loading, render nothing or a loading spinner
    if (loading) {
        // You can return a loading spinner here if you have one
        return null;
    }

    // 2. If user is logged in, render the children (the protected component)
    if (user) {
        return children;
    }

    // 3. If user is NOT logged in and loading is complete, redirect to login page
    return <Navigate to="/login" replace />;
};

export default PrivateRoute;