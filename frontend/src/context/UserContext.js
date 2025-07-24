// frontend/src/context/UserContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import setAuthToken from '../utils/setAuthToken';
import jwtDecode from 'jwt-decode';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setAuthToken(null);
        setUser(null);
        console.log('User logged out. User state:', null);
    }, []);

    const loadUser = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (token) {
            setAuthToken(token);
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    console.log('Token expired. Logging out.');
                    logout();
                    return;
                }

                // UPDATED: Use the live Render backend URL
                const res = await axios.get('YOUR_RENDER_BACKEND_URL/api/auth');
                const userDataFromBackend = res.data;

                const newUserState = {
                    id: userDataFromBackend._id,
                    username: userDataFromBackend.username,
                    email: userDataFromBackend.email,
                    role: userDataFromBackend.role || 'user',
                    token: token
                };
                setUser(newUserState);
                console.log('User loaded from token and backend. User state:', newUserState);
            } catch (err) {
                console.error('Failed to decode token or fetch user data:', err);
                logout();
            }
        } else {
            setUser(null);
            console.log('No token found. User state:', null);
        }
        setLoading(false);
    }, [logout]);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = useCallback(async ({ token }) => {
        localStorage.setItem('token', token);
        setAuthToken(token);

        try {
            // UPDATED: Use the live Render backend URL
            const res = await axios.get('YOUR_RENDER_BACKEND_URL/api/auth');
            const userDataFromBackend = res.data;

            const newUserState = {
                id: userDataFromBackend._id,
                username: userDataFromBackend.username,
                email: userDataFromBackend.email,
                role: userDataFromBackend.role || 'user',
                token: token
            };
            setUser(newUserState);
            console.log('User logged in. User state:', newUserState);
        } catch (err) {
            console.error('Failed to fetch user data after login:', err);
            logout();
        }
    }, [logout]);

    return (
        <UserContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};
