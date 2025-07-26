// frontend/src/pages/LoginPage.js
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSignInAlt, faSpinner } from '@fortawesome/free-solid-svg-icons'; // Added faSpinner
// axios is not directly needed here if loginUser in UserContext handles the API call
// import axios from 'axios';
import { UserContext } from '../context/UserContext';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false); // Added loading state
    const [error, setError] = useState(''); // Keep local error state for display
    const navigate = useNavigate();
    // Destructure loginUser, user (for redirect), and showSnackbar from UserContext
    const { loginUser, user, showSnackbar } = useContext(UserContext);

    // Redirect if user is already logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard'); // Or /admin-dashboard based on role
        }
    }, [user, navigate]);

    const { email, password } = formData;

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(''); // Clear local error on input change
    };

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true); // Start loading
        setError(''); // Clear previous errors

        try {
            // CRITICAL FIX: Call loginUser from UserContext directly with email and password.
            // UserContext's loginUser should handle the axios call, setting user, token,
            // and showing success snackbar.
            const loggedInUser = await loginUser(email, password); // loginUser should return the user object

            // After successful loginUser call, navigate based on role
            // The setTimeout is removed as loginUser should handle its own snackbar
            // and navigation can occur immediately after its successful completion.
            if (loggedInUser && (loggedInUser.role === 'admin' || loggedInUser.role === 'supervisor')) {
                navigate('/admin-dashboard');
            } else if (loggedInUser) {
                navigate('/dashboard');
            }

        } catch (err) {
            console.error('Login failed:', err);
            // Use the error message from loginUser (which might come from backend response)
            const errorMessage = err.message || 'Login failed. Please check your credentials.';
            setError(errorMessage);
            showSnackbar(errorMessage, 'error'); // Show error via global snackbar
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        // Main container for the page, centered content using Bootstrap flex utilities
        <div className="container d-flex justify-content-center align-items-center min-h-screen py-5">
            <div
                className="card p-4 shadow-lg dark-card-section" // Using custom dark card style
                style={{ maxWidth: '450px', width: '100%' }}
            >
                <div className="card-body text-center">
                    <h2 className="card-title mb-4 text-light-custom">
                        <FontAwesomeIcon icon={faSignInAlt} className="me-2" /> Login to DigiThesis AI
                    </h2>
                    {/* Display local error message if any */}
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={onSubmit}>
                        <div className="mb-3 text-start">
                            <label htmlFor="email" className="form-label text-muted-custom">Email address</label>
                            <div className="input-group">
                                <span className="input-group-text bg-secondary-custom border-secondary-custom text-light-custom">
                                    <FontAwesomeIcon icon={faEnvelope} />
                                </span>
                                <input
                                    type="email"
                                    className="form-control bg-dark text-light border-secondary-custom" // Bootstrap dark input
                                    id="email"
                                    name="email" // Added name attribute for formData
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={onChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-4 text-start">
                            <label htmlFor="password" className="form-label text-muted-custom">Password</label>
                            <div className="input-group">
                                <span className="input-group-text bg-secondary-custom border-secondary-custom text-light-custom">
                                    <FontAwesomeIcon icon={faLock} />
                                </span>
                                <input
                                    type="password"
                                    className="form-control bg-dark text-light border-secondary-custom" // Bootstrap dark input
                                    id="password"
                                    name="password" // Added name attribute for formData
                                    placeholder="********"
                                    value={password}
                                    onChange={onChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="d-grid gap-2 mb-3">
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={loading} // Disable button when loading
                            >
                                {loading ? (
                                    <>
                                        {/* Spinner inside the button, will be centered by Bootstrap's button styling */}
                                        <FontAwesomeIcon icon={faSpinner} spin className="me-2" /> Logging In...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faSignInAlt} className="me-2" /> Login
                                    </>
                                )}
                            </button>
                        </div>
                        <p className="text-center mt-3 mb-0 text-muted-custom"> {/* Adjusted margin and text color */}
                            Don't have an account? <Link to="/register" className="text-primary-custom">Register here</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
