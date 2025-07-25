// frontend/src/pages/RegisterPage.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faUserPlus, faSpinner } from '@fortawesome/free-solid-svg-icons'; // Added faSpinner
import axios from 'axios';
import { UserContext } from '../context/UserContext';
// Snackbar is now rendered by UserContext, no need to import/render here

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // New loading state for register button
    const navigate = useNavigate();
    const { showSnackbar } = useContext(UserContext); // Get showSnackbar from context

    const { username, email, password, password2 } = formData;

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true); // Set loading true on submission

        if (password !== password2) {
            setError('Passwords do not match');
            showSnackbar('Passwords do not match', 'error');
            setLoading(false);
            return;
        }

        try {
            // UPDATED: Use the live Render backend URL
            const res = await axios.post('https://digi-thesis-ai-project.onrender.com/api/users', {
                username,
                email,
                password
            });

            showSnackbar('Registration successful! Please log in.', 'success');
            setTimeout(() => {
                navigate('/login');
            }, 1500); // Short delay to see snackbar

        } catch (err) {
            console.error('Registration failed:', err.response ? err.response.data : err.message);
            const errorMessage = err.response && err.response.data && err.response.data.errors
                ? err.response.data.errors[0].msg
                : 'Registration failed. Please try again.';

            setError(errorMessage);
            showSnackbar(errorMessage, 'error');
        } finally {
            setLoading(false); // Set loading false after completion
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-900 font-inter p-4"> {/* Dark theme background */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full"> {/* Dark theme card background */}
                <h2 className="text-center mb-4 text-gray-100 text-2xl font-bold">Create Your Account</h2> {/* Dark theme text */}
                {error && <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>} {/* Dark theme error alert */}
                <form onSubmit={onSubmit}>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-gray-300 text-sm font-bold mb-2">
                            <FontAwesomeIcon icon={faUser} className="mr-2" />Username
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <FontAwesomeIcon icon={faUser} />
                            </span>
                            <input
                                type="text"
                                className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-100 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500"
                                id="username"
                                name="username"
                                placeholder="Your Username"
                                value={username}
                                onChange={onChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">
                            <FontAwesomeIcon icon={faEnvelope} className="mr-2" />Email
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <FontAwesomeIcon icon={faEnvelope} />
                            </span>
                            <input
                                type="email"
                                className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-100 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500"
                                id="email"
                                name="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={onChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-300 text-sm font-bold mb-2">
                            <FontAwesomeIcon icon={faLock} className="mr-2" />Password
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <FontAwesomeIcon icon={faLock} />
                            </span>
                            <input
                                type="password"
                                className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-100 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500"
                                id="password"
                                name="password"
                                placeholder="********"
                                value={password}
                                onChange={onChange}
                                minLength="6"
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password2" className="block text-gray-300 text-sm font-bold mb-2">
                            <FontAwesomeIcon icon={faLock} className="mr-2" />Confirm Password
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <FontAwesomeIcon icon={faLock} />
                            </span>
                            <input
                                type="password"
                                className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-100 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500"
                                id="password2"
                                name="password2"
                                placeholder="********"
                                value={password2}
                                onChange={onChange}
                                minLength="6"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                            ) : (
                                <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                            )}
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </div>
                    <p className="text-center mt-4 text-gray-300">
                        Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300 font-bold">Login here</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
