// frontend/src/pages/ProfilePage.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import Snackbar from '../components/Common/Snackbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faEnvelope, faUser, faCalendarAlt, faSpinner, faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons'; // Added faSave, faTimes

const ProfilePage = () => {
    const { user, loading: userContextLoading, login } = useContext(UserContext);
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({
        show: false,
        message: '',
        type: 'info',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
    });

    console.log('ProfilePage Rendered. isEditing:', isEditing, 'Profile:', profile);

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, show: false });
    };

    const fetchProfile = async () => {
        if (userContextLoading) return;

        if (!user || !user.token) {
            setError('You must be logged in to view your profile.');
            setSnackbar({
                show: true,
                message: 'Authentication required to view profile.',
                type: 'error',
            });
            setLoadingProfile(false);
            return;
        }

        try {
            setLoadingProfile(true);
            setError('');
            const res = await axios.get('https://digi-thesis-ai-project.onrender.com/api/auth', {
                headers: {
                    'x-auth-token': user.token,
                },
            });
            setProfile(res.data);
            // Only initialize formData if not currently editing
            // This ensures that if we are already in edit mode, the form data isn't reset
            if (!isEditing) {
                setFormData({
                    username: res.data.username,
                    email: res.data.email,
                });
                console.log('Profile fetched and formData initialized (not editing):', res.data);
            } else {
                console.log('Profile fetched but formData NOT re-initialized because isEditing is true.');
            }
            setLoadingProfile(false);
        } catch (err) {
            console.error('Failed to fetch profile:', err.response ? err.response.data : err.message);
            setError('Failed to load profile. Please try again.');
            setSnackbar({
                show: true,
                message: 'Failed to load profile. Please try again.',
                type: 'error',
            });
            setLoadingProfile(false);
        }
    };

    useEffect(() => {
        console.log('useEffect triggered. User:', user, 'UserContextLoading:', userContextLoading);
        // REMOVED isEditing from dependency array.
        // fetchProfile should primarily react to user context changes for initial load/auth changes.
        fetchProfile();
    }, [user, userContextLoading]); // MODIFIED: Removed isEditing from dependency array


    const handleEditClick = () => {
        setIsEditing(true);
        setSnackbar({ ...snackbar, show: false });
        console.log('Edit button clicked. Setting isEditing to true.');
        // When entering edit mode, ensure formData is synced with current profile data
        if (profile) {
            setFormData({
                username: profile.username,
                email: profile.email,
            });
            console.log('Synced formData with profile on Edit click.');
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // Reset form data to current profile data
        if (profile) { // Ensure profile exists before trying to access its properties
            setFormData({
                username: profile.username,
                email: profile.email,
            });
        }
        setSnackbar({ ...snackbar, show: false });
        console.log('Cancel button clicked. Setting isEditing to false, resetting formData.');
    };

    const onFormChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setSnackbar({ ...snackbar, show: false });
        console.log('Form data changed:', e.target.name, e.target.value, 'New formData:', { ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSnackbar({ ...snackbar, show: false });
        console.log('Save button clicked. formData:', formData);

        if (!user || !user.token) {
            setSnackbar({ show: true, message: 'You must be logged in to update your profile.', type: 'error' });
            return;
        }

        try {
            const res = await axios.put('https://digi-thesis-ai-project.onrender.com/api/auth/profile', formData, {
                headers: {
                    'x-auth-token': user.token,
                },
            });

            setSnackbar({ show: true, message: res.data.msg, type: 'success' });
            setProfile(res.data.user);
            console.log('Profile saved successfully. New profile data:', res.data.user);

            // Update UserContext
            login({
                token: user.token,
                id: user.id,
                username: res.data.user.username,
                email: res.data.user.email,
                role: user.role
            });
            console.log('UserContext login called with updated data.');

            setIsEditing(false);
            console.log('Setting isEditing to false after save.');
        } catch (err) {
            console.error('Failed to update profile:', err.response ? err.response.data : err.message);
            const errorMessage = err.response && err.response.data && err.response.data.errors
                ? err.response.data.errors[0].msg
                : 'Failed to update profile. Please try again.';
            setSnackbar({ show: true, message: errorMessage, type: 'error' });
        }
    };


    if (userContextLoading || loadingProfile) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
                <p className="ms-3 text-white">Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5 text-center">
                <Snackbar message={snackbar.message} type={snackbar.type} show={snackbar.show} onClose={handleCloseSnackbar} />
                <h1 className="text-danger mb-4">Error</h1>
                <p className="lead text-white">{error}</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container py-5 text-center">
                <Snackbar message={snackbar.message} type={snackbar.type} show={snackbar.show} onClose={handleCloseSnackbar} />
                <h1 className="text-white mb-4">Profile Not Found</h1>
                <p className="lead text-white-50">Could not retrieve user profile data.</p>
            </div>
        );
    }

    return (
        <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: 'calc(100vh - 120px)' }}>
            <Snackbar message={snackbar.message} type={snackbar.type} show={snackbar.show} onClose={handleCloseSnackbar} />

            <div className="card p-5 shadow-lg text-center" style={{ maxWidth: '600px', width: '90%', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                <FontAwesomeIcon icon={faUserCircle} size="5x" className="mb-4 text-primary" />
                <h2 className="mb-4 text-dark">{profile.username}</h2>

                <form onSubmit={handleSaveProfile}>
                    <div className="text-start mb-4">
                        {/* Username Field */}
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label text-dark d-flex align-items-center">
                                <FontAwesomeIcon icon={faUser} className="me-2 text-secondary" /> Username:
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-control"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={onFormChange}
                                    required
                                />
                            ) : (
                                <p className="lead text-dark form-control-plaintext">{profile.username}</p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label text-dark d-flex align-items-center">
                                <FontAwesomeIcon icon={faEnvelope} className="me-2 text-secondary" /> Email:
                            </label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={onFormChange}
                                    required
                                />
                            ) : (
                                <p className="lead text-dark form-control-plaintext">{profile.email}</p>
                            )}
                        </div>

                        {/* Role and Member Since (always read-only) */}
                        <p className="lead text-dark">
                            <FontAwesomeIcon icon={faUser} className="me-2 text-secondary" />
                            <strong>Role:</strong> {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                        </p>
                        <p className="lead text-dark">
                            <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-secondary" />
                            <strong>Member Since:</strong> {new Date(profile.date).toLocaleDateString()}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex justify-content-center gap-3">
                        {isEditing ? (
                            <>
                                <button type="submit" className="btn btn-success btn-lg">
                                    <FontAwesomeIcon icon={faSave} className="me-2" /> Save Changes
                                </button>
                                <button type="button" className="btn btn-outline-secondary btn-lg" onClick={handleCancelEdit}>
                                    <FontAwesomeIcon icon={faTimes} className="me-2" /> Cancel
                                </button>
                            </>
                        ) : (
                            <button type="button" className="btn btn-outline-primary btn-lg" onClick={handleEditClick}>
                                <FontAwesomeIcon icon={faEdit} className="me-2" /> Edit Profile
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
