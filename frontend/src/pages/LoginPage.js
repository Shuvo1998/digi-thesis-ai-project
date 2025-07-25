// frontend/src/pages/LoginPage.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSignInAlt, faSpinner } from '@fortawesome/free-solid-svg-icons'; // Added faSpinner
import axios from 'axios';
import { UserContext } from '../context/UserContext';
// Snackbar is now rendered by UserContext, no need to import/render here

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // New loading state for login button
    const navigate = useNavigate();
    const { loginUser, showSnackbar } = useContext(UserContext);

    const { email, password } = formData;

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true); // Set loading true on submission

        try {
            const res = await axios.post('https://digi-thesis-ai-project.onrender.com/api/auth/login', {
                email,
                password
            });

            await loginUser(res.data.user, res.data.token);

            const userRole = res.data.user.role;

            setTimeout(() => {
                if (userRole === 'admin' || userRole === 'supervisor') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/dashboard');
                }
            }, 1000); // Short delay to see snackbar

        } catch (err) {
            console.error('Login failed:', err.response ? err.response.data : err.message);
            const errorMessage = err.response && err.response.data && err.response.data.errors
                ? err.response.data.errors[0].msg
                : 'Login failed. Please check your credentials.';

            setError(errorMessage);
            showSnackbar(errorMessage, 'error');
        } finally {
            setLoading(false); // Set loading false after completion
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-900 font-inter p-4"> {/* Dark theme background */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full"> {/* Dark theme card background */}
                <h2 className="text-center mb-4 text-gray-100 text-2xl font-bold">Welcome Back!</h2> {/* Dark theme text */}
                {error && <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>} {/* Dark theme error alert */}
                <form onSubmit={onSubmit}>
                    <div className="mb-4"> {/* Increased margin bottom for spacing */}
                        <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2"> {/* Dark theme text */}
                            <FontAwesomeIcon icon={faEnvelope} className="mr-2" />Email
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"> {/* Dark theme icon color */}
                                <FontAwesomeIcon icon={faEnvelope} />
                            </span>
                            <input
                                type="email"
                                className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-100 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500" // Dark theme input styles
                                id="email"
                                name="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={onChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-6"> {/* Increased margin bottom for spacing */}
                        <label htmlFor="password" className="block text-gray-300 text-sm font-bold mb-2"> {/* Dark theme text */}
                            <FontAwesomeIcon icon={faLock} className="mr-2" />Password
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"> {/* Dark theme icon color */}
                                <FontAwesomeIcon icon={faLock} />
                            </span>
                            <input
                                type="password"
                                className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-100 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500" // Dark theme input styles
                                id="password"
                                name="password"
                                placeholder="********"
                                value={password}
                                onChange={onChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 w-full" // Tailwind button style
                            disabled={loading} // Disable button while loading
                        >
                            {loading ? (
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                            ) : (
                                <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                            )}
                            {loading ? 'Logging In...' : 'Login'}
                        </button>
                    </div>
                    <p className="text-center mt-4 text-gray-300"> {/* Dark theme text */}
                        Don't have an account? <Link to="/register" className="text-blue-400 hover:text-blue-300 font-bold">Register here</Link> {/* Dark theme link */}
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
