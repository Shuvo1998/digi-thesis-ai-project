import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSignInAlt } from '@fortawesome/free-solid-svg-icons';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Login attempt with:', { email, password });

        // --- Future API Call Placeholder ---
        // try { /* ... api call ... */ } catch (error) { /* ... handle error ... */ }
        // --- End Future API Call Placeholder ---

        alert(`Login attempt for ${email}. (This is a simulation!)`);
        setEmail('');
        setPassword('');
        // navigate('/dashboard');
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
            <div className="card p-4 shadow-lg" style={{ maxWidth: '400px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                <h2 className="text-center mb-4 text-dark">Welcome Back!</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        {/* --- UPDATED EMAIL LABEL with d-flex and align-items-center --- */}
                        <label htmlFor="email" className="form-label text-primary fw-bold text-start d-flex align-items-center">
                            <FontAwesomeIcon icon={faEnvelope} className="me-2" />Email
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
                    <div className="mb-3">
                        {/* --- UPDATED PASSWORD LABEL with d-flex and align-items-center --- */}
                        <label htmlFor="password" className="form-label text-primary fw-bold text-start d-flex align-items-center">
                            <FontAwesomeIcon icon={faLock} className="me-2" />Password
                        </label>
                        <div className="input-group">
                            <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="d-grid gap-2 mb-3">
                        <button type="submit" className="btn btn-primary btn-lg">
                            <FontAwesomeIcon icon={faSignInAlt} className="me-2" /> Login
                        </button>
                    </div>
                    <p className="text-center text-dark">
                        Don't have an account? <Link to="/register" className="text-primary fw-bold">Register here</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;