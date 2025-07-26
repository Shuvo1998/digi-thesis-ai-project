// frontend/src/context/UserContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Snackbar from '../components/Common/Snackbar';

// Create the UserContext
export const UserContext = createContext();

// Create the UserProvider component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // For initial user loading

    // Removed isDarkMode state and its related logic
    // const [isDarkMode, setIsDarkMode] = useState(() => {
    //     try {
    //         const storedTheme = localStorage.getItem('theme');
    //         return storedTheme === 'dark';
    //     } catch (error) {
    //         console.error("Failed to read theme from localStorage:", error);
    //         return false;
    //     }
    // });

    const [snackbar, setSnackbar] = useState({
        show: false,
        message: '',
        type: 'info',
        duration: 3000,
    });

    // Memoize showSnackbar to ensure stable function reference
    const showSnackbar = useCallback((message, type = 'info', duration = 3000) => {
        setSnackbar({ show: true, message, type, duration });
    }, []);

    // Memoize handleCloseSnackbar to ensure stable function reference
    const handleCloseSnackbar = useCallback(() => {
        setSnackbar(prev => ({ ...prev, show: false }));
    }, []);

    // Removed toggleDarkMode function
    // const toggleDarkMode = useCallback(() => {
    //     setIsDarkMode(prevMode => !prevMode);
    // }, []);

    // Removed useEffect for localStorage theme update
    // useEffect(() => {
    //     try {
    //         localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    //     } catch (error) {
    //         console.error("Failed to write theme to localStorage:", error);
    //     }
    // }, [isDarkMode]);

    const setAuthToken = (token) => {
        if (token) {
            axios.defaults.headers.common['x-auth-token'] = token;
        } else {
            delete axios.defaults.headers.common['x-auth-token'];
        }
    };

    const loginUser = useCallback((userData, token) => {
        setUser(userData);
        if (token) {
            localStorage.setItem('token', token);
            setAuthToken(token);
        }
        showSnackbar('Login successful!', 'success');
    }, [showSnackbar]);

    const logoutUser = useCallback(() => {
        setUser(null);
        localStorage.removeItem('token');
        setAuthToken(null);
        showSnackbar('Logged out successfully.', 'info');
    }, [showSnackbar]);

    // Effect to check for existing token on initial load
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                setAuthToken(token);
                try {
                    const res = await axios.get('https://digi-thesis-ai-project.onrender.com/api/auth');
                    setUser(res.data.user);
                } catch (err) {
                    console.error('Token invalid or expired:', err);
                    localStorage.removeItem('token');
                    setAuthToken(null);
                    setUser(null);
                    showSnackbar('Session expired or invalid. Please log in again.', 'error');
                }
            }
            setLoading(false); // Finished loading user status
        };

        loadUser();
    }, [showSnackbar]); // showSnackbar is a dependency here too

    // Value provided by the context to its consumers
    const contextValue = {
        user,
        loading, // Indicates if initial user loading is complete
        loginUser,
        logoutUser,
        showSnackbar, // Provide showSnackbar function
        // Removed isDarkMode, toggleDarkMode from context value
        // isDarkMode,
        // toggleDarkMode,
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
