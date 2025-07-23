import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Ensure faUserPlus is imported
import { faUser, faEnvelope, faLock, faUserPlus } from '@fortawesome/free-solid-svg-icons';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        console.log('Register attempt with:', { username, email, password });

        // --- Future API Call Placeholder ---
        // try { /* ... api call ... */ } catch (error) { /* ... handle error ... */ }
        // --- End Future API Call Placeholder ---

        alert(`Registration attempt for ${username}. (This is a simulation!)`);
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        // navigate('/login');
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
            <div className="card p-4 shadow-lg" style={{ maxWidth: '450px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                {/* --- UPDATED HEADING WITH ICON --- */}
                <h2 className="text-center mb-4 text-dark">
                    <FontAwesomeIcon icon={faUserPlus} className="me-2" /> Register
                </h2>
                <form onSubmit={handleSubmit}>
                    {/* Username Field */}
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label text-primary fw-bold text-start d-flex align-items-center">
                            <FontAwesomeIcon icon={faUser} className="me-2" /> Username
                        </label>
                        <div className="input-group">
                            <span className="input-group-text"><FontAwesomeIcon icon={faUser} /></span>
                            <input
                                type="text"
                                className="form-control"
                                id="username"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    {/* Email Field */}
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label text-primary fw-bold text-start d-flex align-items-center">
                            <FontAwesomeIcon icon={faEnvelope} className="me-2" /> University Email
                        </label>
                        <div className="input-group">
                            <span className="input-group-text"><FontAwesomeIcon icon={faEnvelope} /></span>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    {/* Password Field */}
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label text-primary fw-bold text-start d-flex align-items-center">
                            <FontAwesomeIcon icon={faLock} className="me-2" /> Password
                        </label>
                        <div className="input-group">
                            <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    {/* Confirm Password Field */}
                    <div className="mb-3">
                        <label htmlFor="confirmPassword" className="form-label text-primary fw-bold text-start d-flex align-items-center">
                            <FontAwesomeIcon icon={faLock} className="me-2" /> Confirm Password
                        </label>
                        <div className="input-group">
                            <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
                            <input
                                type="password"
                                className="form-control"
                                id="confirmPassword"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="d-grid gap-2 mb-3">
                        <button type="submit" className="btn btn-success btn-lg">
                            <FontAwesomeIcon icon={faUserPlus} className="me-2" /> Register Account
                        </button>
                    </div>
                    <p className="text-center text-dark">
                        Already have an account? <Link to="/login" className="text-primary fw-bold">Login here</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;