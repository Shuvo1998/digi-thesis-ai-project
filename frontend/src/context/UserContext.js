import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api'; // use custom api instance
import { jwtDecode } from 'jwt-decode';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        console.log('User logged out.');
    }, []);

    const loadUser = useCallback(async () => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    console.log('Token expired.');
                    logout();
                    return;
                }

                const res = await api.get('/auth');
                const data = res.data;

                setUser({
                    id: data._id,
                    username: data.username,
                    email: data.email,
                    role: data.role || 'user',
                });

                console.log('User loaded:', data);
            } catch (err) {
                console.error('Load user failed:', err);
                logout();
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    }, [token, logout]);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = useCallback(async ({ token }) => {
        localStorage.setItem('token', token);
        setToken(token);
        await loadUser();
    }, [loadUser]);

    return (
        <UserContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};
