// frontend/src/pages/LoginPage.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
// Snackbar is now rendered by UserContext, no need to import/render here
// import Snackbar from '../components/Common/Snackbar';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    // CRITICAL FIX: Destructure loginUser and showSnackbar from UserContext
    const { loginUser, showSnackbar } = useContext(UserContext);

    // Local snackbar state and handleCloseSnackbar are no longer needed here
    // as UserContext manages the global Snackbar.
    // const [snackbar, setSnackbar] = useState({
    //     show: false,
    //     message: '',
    //     type: 'info',
    // });
    // const handleCloseSnackbar = () => {
    //     setSnackbar({ ...snackbar, show: false });
    // };

    const { email, password } = formData;

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
        // No need to hide local snackbar anymore, it's global
        // if (snackbar.show) setSnackbar({ ...snackbar, show: false });
    };

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        // No need to hide local snackbar anymore, it's global
        // setSnackbar({ ...snackbar, show: false });

        try {
            // UPDATED: Use the live Render backend URL
            const res = await axios.post('https://digi-thesis-ai-project.onrender.com/api/auth/login', {
                email,
                password
            });

            // CRITICAL FIX: Call loginUser with the user data and token from the response
            // The res.data from backend login should contain both token and user object
            // UserContext's loginUser will handle setting token, user, and showing snackbar
            await loginUser(res.data.user, res.data.token);

            // The snackbar is now shown by loginUser in UserContext.
            // No need for local snackbar setting here:
            // setSnackbar({
            //     show: true,
            //     message: 'Login successful! Welcome back.',
            //     type: 'success',
            // });

            // The user object received from the login response already contains the role
            const userRole = res.data.user.role;

            // Use setTimeout to allow snackbar to show before navigation
            // Using a fixed duration or getting it from context if needed
            setTimeout(() => {
                if (userRole === 'admin' || userRole === 'supervisor') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/dashboard');
                }
            }, 1000); // Short delay to see snackbar, adjust as needed

        } catch (err) {
            console.error('Login failed:', err.response ? err.response.data : err.message);
            const errorMessage = err.response && err.response.data && err.response.data.errors
                ? err.response.data.errors[0].msg
                : 'Login failed. Please check your credentials.';

            setError(errorMessage);
            // Use showSnackbar from context for error messages
            showSnackbar(errorMessage, 'error');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
            {/* Snackbar is now rendered globally by UserProvider, remove local render */}
            {/* <Snackbar
                message={snackbar.message}
                type={snackbar.type}
                show={snackbar.show}
                onClose={handleCloseSnackbar}
            /> */}

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
