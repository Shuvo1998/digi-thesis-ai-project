import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import Snackbar from '../components/Common/Snackbar';
import { jwtDecode } from 'jwt-decode'; // ADDED: Import jwtDecode

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user, login } = useContext(UserContext);

    const [snackbar, setSnackbar] = useState({
        show: false,
        message: '',
        type: 'info',
    });

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, show: false });
    };

    const { email, password } = formData;

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
        if (snackbar.show) setSnackbar({ ...snackbar, show: false });
    };

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setSnackbar({ ...snackbar, show: false });

        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password
            });

            const { token } = res.data; // Backend only sends 'token'

            // ADDED: Decode the token to get user details including role
            const decodedToken = jwtDecode(token);
            const userDataFromToken = decodedToken.user; // This should contain id and role from JWT payload

            // Combine token with decoded user data
            const userToLogin = {
                token,
                id: userDataFromToken.id,
                username: userDataFromToken.username || email, // Use username from token, or fallback to email
                email: email, // Email comes from form input
                role: userDataFromToken.role || 'user', // Get role from token, fallback to 'user'
            };

            login(userToLogin); // Pass the combined user object to context login function

            setSnackbar({
                show: true,
                message: 'Login successful! Welcome back.',
                type: 'success',
            });

            setTimeout(() => {
                if (userToLogin.role === 'admin' || userToLogin.role === 'supervisor') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/dashboard');
                }
            }, snackbar.duration || 3000);

        } catch (err) {
            console.error('Login failed:', err.response ? err.response.data : err.message);
            setSnackbar({
                show: true,
                message: err.response && err.response.data && err.response.data.errors
                    ? err.response.data.errors[0].msg
                    : 'Login failed. Please check your credentials.',
                type: 'error',
            });
            setError(err.response && err.response.data && err.response.data.errors
                ? err.response.data.errors[0].msg
                : 'Login failed. Please check your credentials.');
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

            <div className="card p-4 shadow-lg" style={{ maxWidth: '400px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                <h2 className="text-center mb-4 text-dark">Welcome Back!</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={onSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label text-primary fw-bold text-start d-flex align-items-center">
                            <FontAwesomeIcon icon={faEnvelope} className="me-2" />Email
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
                            <FontAwesomeIcon icon={faLock} className="me-2" />Password
                        </label>
                        <div className="input-group">
                            <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                name="password"
                                placeholder="********"
                                value={password}
                                onChange={onChange}
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
