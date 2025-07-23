// frontend/src/context/UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // To indicate if user data is still being loaded

    // Function to load user from localStorage and validate token
    const loadUser = async () => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            // Decode the token to get user info (including role)
            // Note: This is a client-side decode, not verification.
            // Verification happens on the backend.
            try {
                // A simple way to decode JWT without a library for basic info
                const decoded = JSON.parse(atob(storedToken.split('.')[1]));
                // The user object in the token payload is usually under a 'user' key
                const userDataFromToken = decoded.user;

                // Optionally, make a call to /api/auth to get fresh user data and verify token
                // This is more secure but adds a network request on every page load
                const res = await axios.get('http://localhost:5000/api/auth', {
                    headers: { 'x-auth-token': storedToken }
                });

                // Update user state with full user data from backend and the token
                // The backend /api/auth route returns the user object without password
                // We combine it with the token for convenience.
                setUser({
                    token: storedToken,
                    id: res.data._id, // Get ID from backend response
                    username: res.data.username, // Get username from backend response
                    email: res.data.email, // Get email from backend response
                    role: res.data.role // ADDED: Get role from backend response
                });

            } catch (err) {
                console.error('Failed to load user or token invalid:', err);
                localStorage.removeItem('token'); // Clear invalid token
                setUser(null);
            }
        }
        setLoading(false); // Finished loading user
    };

    // Run once on component mount to load user
    useEffect(() => {
        loadUser();
    }, []);

    // Login function: stores token and sets user state
    const login = async (userData) => { // userData now expects { token, username, email, role }
        localStorage.setItem('token', userData.token);
        // Set user state with all provided data, including role
        setUser({
            token: userData.token,
            id: userData.id, // Assuming ID might come from backend on login/register
            username: userData.username,
            email: userData.email,
            role: userData.role // ADDED: Store the role here
        });
    };

    // Logout function: clears token and user state
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export { UserContext, UserProvider };
