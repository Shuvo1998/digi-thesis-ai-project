// frontend/src/context/UserContext.js
import React, { createContext, useState, useEffect } from 'react';

// 1. Create the Context
export const UserContext = createContext(null);

// 2. Create the Provider Component
export const UserProvider = ({ children }) => {
    // Initialize user state, starting with null
    const [user, setUser] = useState(null);
    // Initialize loading state to true, as we need to check localStorage
    const [loading, setLoading] = useState(true);

    // Use useEffect to check localStorage only once when the component mounts
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                // If user data is found in localStorage, parse it and set the user state
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage:", error);
            localStorage.removeItem('user'); // Clear corrupted data if parsing fails
            // setUser(null) is already the default, but explicitly setting won't hurt
            setUser(null);
        } finally {
            // Crucially, set loading to false after the check, regardless of outcome
            setLoading(false);
        }
    }, []); // The empty dependency array ensures this effect runs only once on mount

    // Function to handle user login
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData)); // Store user data in local storage
    };

    // Function to handle user logout
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user'); // Remove user data from local storage
        // Potentially clear any stored tokens or session cookies here
    };

    // The value provided to consumers of this context
    const contextValue = {
        user,
        loading, // Provide loading state to consumers
        login,
        logout,
    };

    return (
        <UserContext.Provider value={contextValue}>
            {/* You could add a global loading spinner here if loading is true */}
            {/* For now, we'll just render children directly */}
            {children}
        </UserContext.Provider>
    );
};