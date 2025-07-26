// frontend/src/pages/RegisterPage.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faUserPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    // CRITICAL FIX: Ensure showSnackbar is correctly destructured from UserContext
    const { showSnackbar } = useContext(UserContext);

    const { username, email, password, password2 } = formData;

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (password !== password2) {
            setError('Passwords do not match');
            showSnackbar('Passwords do not match', 'error'); // Use showSnackbar from context
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post('https://digi-thesis-ai-project.onrender.com/api/users', {
                username, // Ensure username is being sent
                email,
                password
            });

            // Log the full response to see what backend sends for user
            console.log("Registration successful:", res.data);

            // Backend is returning an empty user object (user: {}).
            // This is unusual for a successful registration.
            // Ideally, the backend should return the newly registered user's basic info.
            // For now, we proceed with the assumption that the registration itself was successful.

            showSnackbar('Registration successful! Please log in.', 'success'); // Use showSnackbar from context
            setTimeout(() => {
                navigate('/login');
            }, 1500);

        } catch (err) {
            console.error('Registration failed:', err.response ? err.response.data : err.message);
            const errorMessage = err.response && err.response.data && err.response.data.errors
                ? err.response.data.errors[0].msg // Access the error message from the array
                : 'Registration failed. Please try again.';

            setError(errorMessage);
            showSnackbar(errorMessage, 'error'); // Use showSnackbar from context
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-900 font-inter p-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
                <h2 className="text-center mb-4 text-gray-100 text-2xl font-bold">Create Your Account</h2>
                {error && <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
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
