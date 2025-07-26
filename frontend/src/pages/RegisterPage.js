// frontend/src/pages/RegisterPage.js
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// ADDED faUserGraduate to the import list
import { faUserPlus, faEnvelope, faLock, faUser, faBuilding, faSpinner, faUserGraduate } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../context/UserContext';
import { motion } from 'framer-motion';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        role: 'student', // Default role
        department: '' // Added department field
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { registerUser, user, showSnackbar } = useContext(UserContext);

    // Redirect if user is already logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard'); // Or /admin-dashboard based on role
        }
    }, [user, navigate]);

    const { username, email, password, password2, role, department } = formData;

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(''); // Clear local error on input change
    };

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password !== password2) {
            setError('Passwords do not match');
            showSnackbar('Passwords do not match', 'error');
            setLoading(false);
            return;
        }

        try {
            await registerUser({ username, email, password, role, department });
            // showSnackbar for success is handled by registerUser in UserContext
            // Navigation handled by useEffect after successful registration and login (if auto-login)
        } catch (err) {
            console.error('Registration failed:', err);
            const errorMessage = err.message || 'Registration failed. Please try again.';
            setError(errorMessage);
            showSnackbar(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const formVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 10 } }
    };

    const buttonVariants = {
        hover: { scale: 1.05, boxShadow: "0px 0px 8px rgba(255,255,255,0.5)" },
        tap: { scale: 0.95 }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-h-screen py-5">
            <motion.div
                className="card p-4 shadow-lg dark-card-section"
                style={{ maxWidth: '500px', width: '100%' }}
                variants={formVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="card-body text-center">
                    <h2 className="card-title mb-4 text-light-custom">
                        <FontAwesomeIcon icon={faUserPlus} className="me-2" /> Register for DigiThesis AI
                    </h2>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={onSubmit}>
                        <div className="mb-3 text-start">
                            <label htmlFor="username" className="form-label text-muted-custom">Username</label>
                            <div className="input-group">
                                <span className="input-group-text bg-secondary-custom border-secondary-custom text-light-custom">
                                    <FontAwesomeIcon icon={faUser} />
                                </span>
                                <input
                                    type="text"
                                    className="form-control bg-dark text-light border-secondary-custom"
                                    id="username"
                                    name="username"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={onChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-3 text-start">
                            <label htmlFor="email" className="form-label text-muted-custom">Email address</label>
                            <div className="input-group">
                                <span className="input-group-text bg-secondary-custom border-secondary-custom text-light-custom">
                                    <FontAwesomeIcon icon={faEnvelope} />
                                </span>
                                <input
                                    type="email"
                                    className="form-control bg-dark text-light border-secondary-custom"
                                    id="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={onChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-3 text-start">
                            <label htmlFor="password" className="form-label text-muted-custom">Password</label>
                            <div className="input-group">
                                <span className="input-group-text bg-secondary-custom border-secondary-custom text-light-custom">
                                    <FontAwesomeIcon icon={faLock} />
                                </span>
                                <input
                                    type="password"
                                    className="form-control bg-dark text-light border-secondary-custom"
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
                        <div className="mb-4 text-start">
                            <label htmlFor="password2" className="form-label text-muted-custom">Confirm Password</label>
                            <div className="input-group">
                                <span className="input-group-text bg-secondary-custom border-secondary-custom text-light-custom">
                                    <FontAwesomeIcon icon={faLock} />
                                </span>
                                <input
                                    type="password"
                                    className="form-control bg-dark text-light border-secondary-custom"
                                    id="password2"
                                    name="password2"
                                    placeholder="Confirm password"
                                    value={password2}
                                    onChange={onChange}
                                    minLength="6"
                                    required
                                />
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div className="mb-3 text-start">
                            <label htmlFor="role" className="form-label text-muted-custom">Register As</label>
                            <div className="input-group">
                                <span className="input-group-text bg-secondary-custom border-secondary-custom text-light-custom">
                                    <FontAwesomeIcon icon={faUserGraduate} /> {/* This is the icon */}
                                </span>
                                <select
                                    className="form-select bg-dark text-light border-secondary-custom"
                                    id="role"
                                    name="role"
                                    value={role}
                                    onChange={onChange}
                                    required
                                >
                                    <option value="student">Student</option>
                                    <option value="supervisor">Supervisor</option>
                                </select>
                            </div>
                        </div>

                        {/* Department Field (Conditional for Student/Supervisor) */}
                        {(role === 'student' || role === 'supervisor') && (
                            <div className="mb-4 text-start">
                                <label htmlFor="department" className="form-label text-muted-custom">Department</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-secondary-custom border-secondary-custom text-light-custom">
                                        <FontAwesomeIcon icon={faBuilding} />
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control bg-dark text-light border-secondary-custom"
                                        id="department"
                                        name="department"
                                        placeholder="e.g., Computer Science"
                                        value={department}
                                        onChange={onChange}
                                        required={role === 'student' || role === 'supervisor'}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="d-grid gap-2 mb-3">
                            <button
                                type="submit"
                                className="btn btn-success btn-lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin className="me-2" /> Registering...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faUserPlus} className="me-2" /> Register
                                    </>
                                )}
                            </button>
                        </div>
                        <p className="text-center mt-3 mb-0 text-muted-custom">
                            Already have an account? <Link to="/login" className="text-primary-custom">Login here</Link>
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
