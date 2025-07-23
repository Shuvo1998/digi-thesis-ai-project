import React, { useState, useContext } from 'react'; // ADDED useContext
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios'; // ADDED axios import
import { UserContext } from '../context/UserContext'; // ADDED UserContext import

const RegisterPage = () => {
    // UPDATED: Using a single formData state object for all inputs
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '' // Renamed confirmPassword to password2 for consistency with backend validation
    });
    const [error, setError] = useState(''); // ADDED: State for displaying errors
    const navigate = useNavigate();
    const { login } = useContext(UserContext); // ADDED: Get the login function from context

    // Destructure formData for easier access in JSX
    const { username, email, password, password2 } = formData;

    // UPDATED: Single onChange handler for all form inputs
    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(''); // Clear error when user starts typing again
    };

    // UPDATED: Replaced handleSubmit with onSubmit for API call
    const onSubmit = async (e) => { // Renamed from handleSubmit to onSubmit to match form prop
        e.preventDefault();

        if (password !== password2) { // Use password2 for confirmation
            setError("Passwords do not match!");
            return;
        }

        try {
            // Make API call to backend register endpoint
            const res = await axios.post('http://localhost:5000/api/auth/register', {
                username,
                email,
                password
            });

            console.log('Registration successful:', res.data);
            const { token } = res.data;

            // Use the login function from UserContext to set user data and token
            // For now, we only get token. When we get user data from /api/auth in the future, we'll pass it.
            login({ token, username, email }); // Pass token and basic user info to login context function

            alert('Registration successful! You are now logged in.'); // Optional: you can remove this alert later for smoother UX
            navigate('/dashboard'); // Redirect to dashboard after successful registration
        } catch (err) {
            console.error('Registration failed:', err.response ? err.response.data : err.message);
            setError(err.response && err.response.data && err.response.data.errors
                ? err.response.data.errors[0].msg // Display first error from backend validation
                : 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
            <div className="card p-4 shadow-lg" style={{ maxWidth: '450px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                <h2 className="text-center mb-4 text-dark">
                    <FontAwesomeIcon icon={faUserPlus} className="me-2" /> Register
                </h2>
                {/* ADDED: Error display */}
                {error && <div className="alert alert-danger">{error}</div>}
                {/* UPDATED: form onSubmit prop */}
                <form onSubmit={onSubmit}>
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
                                name="username" // ADDED: name attribute
                                placeholder="Choose a username"
                                value={username} // UPDATED: value from formData
                                onChange={onChange} // UPDATED: onChange handler
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
                                name="email" // ADDED: name attribute
                                placeholder="name@example.com"
                                value={email} // UPDATED: value from formData
                                onChange={onChange} // UPDATED: onChange handler
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
                                name="password" // ADDED: name attribute
                                placeholder="Create a password"
                                value={password} // UPDATED: value from formData
                                onChange={onChange} // UPDATED: onChange handler
                                required
                            />
                        </div>
                    </div>
                    {/* Confirm Password Field */}
                    <div className="mb-3">
                        <label htmlFor="password2" className="form-label text-primary fw-bold text-start d-flex align-items-center"> {/* Renamed htmlFor to password2 */}
                            <FontAwesomeIcon icon={faLock} className="me-2" /> Confirm Password
                        </label>
                        <div className="input-group">
                            <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
                            <input
                                type="password"
                                className="form-control"
                                id="password2" // Renamed id to password2
                                name="password2" // ADDED: name attribute
                                placeholder="Confirm your password"
                                value={password2} // UPDATED: value from formData
                                onChange={onChange} // UPDATED: onChange handler
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
