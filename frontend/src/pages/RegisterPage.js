import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import Snackbar from '../components/Common/Snackbar';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: ''
    });
    const navigate = useNavigate();
    const { login } = useContext(UserContext);

    const [snackbar, setSnackbar] = useState({
        show: false,
        message: '',
        type: 'info',
    });

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, show: false });
    };

    const { username, email, password, password2 } = formData;

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (snackbar.show) setSnackbar({ ...snackbar, show: false });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setSnackbar({ ...snackbar, show: false });

        if (password !== password2) {
            setSnackbar({
                show: true,
                message: "Passwords do not match!",
                type: 'error',
            });
            return;
        }

        try {
            // UPDATED: Use the live Render backend URL
            const res = await axios.post('https://digi-thesis-ai-project.onrender.com/api/auth/register', {
                username,
                email,
                password
            });

            console.log('Registration successful:', res.data);
            const { token, user: userData } = res.data;

            await login({ token });

            setSnackbar({
                show: true,
                message: 'Registration successful! You are now logged in.',
                type: 'success',
            });
            setTimeout(() => {
                navigate('/dashboard');
            }, snackbar.duration || 3000);

        } catch (err) {
            console.error('Registration failed:', err.response ? err.response.data : err.message);
            setSnackbar({
                show: true,
                message: err.response && err.response.data && err.response.data.errors
                    ? err.response.data.errors[0].msg
                    : 'Registration failed. Please try again.',
                type: 'error',
            });
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
            <Snackbar
                message={snackbar.message}
                type={snackbar.type}
                show={snackbar.show}
                onClose={handleCloseSnackbar}
            />

            <div className="card p-4 shadow-lg" style={{ maxWidth: '450px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                <h2 className="text-center mb-4 text-dark">
                    <FontAwesomeIcon icon={faUserPlus} className="me-2" /> Register
                </h2>
                <form onSubmit={onSubmit}>
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
                                name="username"
                                placeholder="Choose a username"
                                value={username}
                                onChange={onChange}
                                required
                            />
                        </div>
                    </div>
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
                                name="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={onChange}
                                required
                            />
                        </div>
                    </div>
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
                                name="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={onChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password2" className="form-label text-primary fw-bold text-start d-flex align-items-center">
                            <FontAwesomeIcon icon={faLock} className="me-2" /> Confirm Password
                        </label>
                        <div className="input-group">
                            <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
                            <input
                                type="password"
                                className="form-control"
                                id="password2"
                                name="password2"
                                placeholder="Confirm your password"
                                value={password2}
                                onChange={onChange}
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
