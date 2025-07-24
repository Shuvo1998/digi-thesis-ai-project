// frontend/src/context/UserContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import setAuthToken from '../utils/setAuthToken';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios'; // Import axios for API calls

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Memoized logout function
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setAuthToken(null); // Clear token from Axios headers
        setUser(null); // Clear user state
        console.log('User logged out. User state:', null); // Log state change
    }, []); // No dependencies, so it's stable

    // Function to load user from token and fetch full details (called on initial app load/refresh)
    const loadUser = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (token) {
            setAuthToken(token); // Set token in Axios headers for subsequent requests
            try {
                const decoded = jwtDecode(token);
                // Check if token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    console.log('Token expired. Logging out.');
                    logout(); // Log out if token is expired
                    return;
                }

                // Fetch full user details from backend using the token
                // This relies on your backend's /api/auth route to return the full user object
                const res = await axios.get('http://localhost:5000/api/auth');
                const userDataFromBackend = res.data;

                const newUserState = {
                    id: userDataFromBackend._id, // Use _id from backend response
                    username: userDataFromBackend.username,
                    email: userDataFromBackend.email,
                    role: userDataFromBackend.role || 'user', // Default to 'user' if role is missing
                    token: token // Store the token itself in the user object
                };
                setUser(newUserState);
                console.log('User loaded from token and backend. User state:', newUserState);
            } catch (err) {
                console.error('Failed to decode token or fetch user data:', err);
                // If there's an error fetching user data (e.g., token invalid on backend), log out
                logout();
            }
        } else {
            setUser(null); // No token, ensure user is null
            console.log('No token found. User state:', null); // Log state change
        }
        setLoading(false);
    }, [logout]); // Dependency on logout

    // Effect to load user on initial mount
    useEffect(() => {
        loadUser();
    }, [loadUser]); // Dependency on loadUser to re-run if loadUser itself changes (due to useCallback)

    // Login function (called after successful login/registration)
    const login = useCallback(async ({ token }) => { // MODIFIED: Only expect 'token' as argument
        localStorage.setItem('token', token);
        setAuthToken(token); // Set token in Axios headers immediately for the next request

        try {
            // Fetch full user details from backend after setting token
            const res = await axios.get('http://localhost:5000/api/auth');
            const userDataFromBackend = res.data;

            const newUserState = {
                id: userDataFromBackend._id,
                username: userDataFromBackend.username,
                email: userDataFromBackend.email,
                role: userDataFromBackend.role || 'user',
                token: token
            };
            setUser(newUserState); // Update user state with complete data
            console.log('User logged in. User state:', newUserState);
        } catch (err) {
            console.error('Failed to fetch user data after login:', err);
            // If fetching user data fails after getting a token, it indicates an issue, so log out
            logout();
        }
    }, [logout]); // Dependency on logout

    return (
        <UserContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};
