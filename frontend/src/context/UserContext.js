// frontend/src/context/UserContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react'; // Import useCallback
import axios from 'axios';
import Snackbar from '../components/Common/Snackbar';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({
        show: false,
        message: '',
        type: 'info',
        duration: 3000,
    });

    // Memoize showSnackbar to ensure stable function reference
    const showSnackbar = useCallback((message, type = 'info', duration = 3000) => {
        setSnackbar({ show: true, message, type, duration });
    }, []); // No dependencies, as it only uses setSnackbar (from useState)

    // Memoize handleCloseSnackbar to ensure stable function reference
    const handleCloseSnackbar = useCallback(() => {
        setSnackbar(prev => ({ ...prev, show: false }));
    }, []); // No dependencies

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
    }, [showSnackbar]); // showSnackbar is a dependency

    const logoutUser = useCallback(() => {
        setUser(null);
        localStorage.removeItem('token');
        setAuthToken(null);
        showSnackbar('Logged out successfully.', 'info');
    }, [showSnackbar]); // showSnackbar is a dependency

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
            setLoading(false);
        };

        loadUser();
    }, [showSnackbar]); // showSnackbar is a dependency here too

    const contextValue = {
        user,
        loading,
        loginUser,
        logoutUser,
        showSnackbar,
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
            <Snackbar
                message={snackbar.message}
                type={snackbar.type}
                show={snackbar.show}
                onClose={handleCloseSnackbar}
            />
        </UserContext.Provider>
    );
};
