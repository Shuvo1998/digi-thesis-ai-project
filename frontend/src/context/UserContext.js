// frontend/src/context/UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios'; // Using global axios instance
import Snackbar from '../components/Common/Snackbar'; // Import the Snackbar component

// Create the UserContext
export const UserContext = createContext();

// Create the UserProvider component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // For initial user loading
    const [snackbar, setSnackbar] = useState({
        show: false,
        message: '',
        type: 'info',
        duration: 3000,
    });

    // Helper function to show snackbar messages
    const showSnackbar = (message, type = 'info', duration = 3000) => {
        setSnackbar({ show: true, message, type, duration });
    };

    // Handler to close the snackbar
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, show: false }));
    };

    // Function to set the auth token in Axios headers
    const setAuthToken = (token) => {
        if (token) {
            axios.defaults.headers.common['x-auth-token'] = token;
        } else {
            delete axios.defaults.headers.common['x-auth-token'];
        }
    };

    // Function to log in a user
    const loginUser = (userData, token) => {
        setUser(userData);
        if (token) {
            localStorage.setItem('token', token);
            setAuthToken(token);
        }
        showSnackbar('Login successful!', 'success');
    };

    // Function to log out a user
    const logoutUser = () => {
        setUser(null);
        localStorage.removeItem('token');
        setAuthToken(null);
        showSnackbar('Logged out successfully.', 'info');
    };

    // Effect to check for existing token on initial load
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                setAuthToken(token);
                try {
                    // Verify token with backend and fetch user data
                    // Use a hardcoded URL for now, as per your setup
                    const res = await axios.get('https://digi-thesis-ai-project.onrender.com/api/auth');
                    setUser(res.data.user); // Backend should return { user: { id, username, email, role } }
                } catch (err) {
                    console.error('Token invalid or expired:', err);
                    localStorage.removeItem('token'); // Clear invalid token
                    setAuthToken(null);
                    setUser(null);
                    showSnackbar('Session expired or invalid. Please log in again.', 'error');
                }
            }
            setLoading(false); // Finished loading user status
        };

        loadUser();
    }, []); // Run only once on component mount

    // Value provided by the context to its consumers
    const contextValue = {
        user,
        loading, // Indicates if initial user loading is complete
        loginUser,
        logoutUser,
        showSnackbar, // Provide showSnackbar function
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
            {/* Render the Snackbar component here, managed by UserContext's state */}
            <Snackbar
                message={snackbar.message}
                type={snackbar.type}
                show={snackbar.show}
                onClose={handleCloseSnackbar}
            />
        </UserContext.Provider>
    );
};
