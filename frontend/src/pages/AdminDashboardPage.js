// frontend/src/pages/AdminDashboardPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import Snackbar from '../components/Common/Snackbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // ADDED: Import FontAwesomeIcon component
import {
    faCheckCircle, faTimesCircle, faDownload, faSpinner,
    faClipboardList, faUserGraduate, faCalendarAlt, faTags, faFilePdf,
    faUsers, faUserCircle, faEnvelope // Added faUsers, faUserCircle, faEnvelope for user list
} from '@fortawesome/free-solid-svg-icons';

const AdminDashboardPage = () => {
    const { user, loading: userLoading } = useContext(UserContext);
    const navigate = useNavigate();

    // State for pending theses tab
    const [pendingTheses, setPendingTheses] = useState([]);
    const [loadingPendingTheses, setLoadingPendingTheses] = useState(true);
    const [pendingThesesError, setPendingThesesError] = useState('');

    // State for all users tab
    const [allUsers, setAllUsers] = useState([]);
    const [loadingAllUsers, setLoadingAllUsers] = useState(true);
    const [allUsersError, setAllUsersError] = useState('');

    // State for active tab
    const [activeTab, setActiveTab] = useState('pendingTheses'); // 'pendingTheses' or 'allUsers'

    const [snackbar, setSnackbar] = useState({
        show: false,
        message: '',
        type: 'info',
    });

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, show: false });
    };

    // Function to check authorization and redirect if needed
    const checkAuthorization = () => {
        if (!userLoading && (!user || (user.role !== 'admin' && user.role !== 'supervisor'))) {
            setPendingThesesError('Access Denied: You do not have permission to view this page.');
            setAllUsersError('Access Denied: You do not have permission to view this page.');
            setSnackbar({
                show: true,
                message: 'Access Denied: You do not have permission to view this page.',
                type: 'error',
            });
            // Redirect if not authorized after a short delay
            setTimeout(() => navigate('/'), 3000);
            return false;
        }
        return true;
    };

    // Function to fetch pending theses
    const fetchPendingTheses = async () => {
        if (!checkAuthorization()) return; // Check authorization first

        try {
            setLoadingPendingTheses(true);
            setPendingThesesError('');
            const res = await axios.get('http://localhost:5000/api/theses/pending', {
                headers: {
                    'x-auth-token': user.token,
                },
            });
            setPendingTheses(res.data);
            setLoadingPendingTheses(false);
        } catch (err) {
            console.error('Failed to fetch pending theses:', err.response ? err.response.data : err.message);
            setPendingThesesError('Failed to load pending theses. Please try again.');
            setSnackbar({
                show: true,
                message: 'Failed to load pending theses. Please try again.',
                type: 'error',
            });
            setLoadingPendingTheses(false);
        }
    };

    // NEW: Function to fetch all users
    const fetchAllUsers = async () => {
        if (!checkAuthorization()) return; // Check authorization first

        try {
            setLoadingAllUsers(true);
            setAllUsersError('');
            const res = await axios.get('http://localhost:5000/api/users/all', {
                headers: {
                    'x-auth-token': user.token,
                },
            });
            setAllUsers(res.data);
            setLoadingAllUsers(false);
        } catch (err) {
            console.error('Failed to fetch all users:', err.response ? err.response.data : err.message);
            setAllUsersError('Failed to load user list. Please try again.');
            setSnackbar({
                show: true,
                message: 'Failed to load user list. Please try again.',
                type: 'error',
            });
            setLoadingAllUsers(false);
        }
    };

    // Fetch data based on active tab and user context changes
    useEffect(() => {
        if (!userLoading && user) {
            if (activeTab === 'pendingTheses') {
                fetchPendingTheses();
            } else if (activeTab === 'allUsers') {
                fetchAllUsers();
            }
        } else if (!userLoading && !user) {
            // If user is not logged in after loading, set error and redirect
            checkAuthorization(); // This will handle the error message and redirection
        }
    }, [user, userLoading, activeTab]); // Re-fetch if user, userLoading, or activeTab changes

    const handleApprove = async (thesisId) => {
        if (!checkAuthorization()) return;
        try {
            await axios.put(`http://localhost:5000/api/theses/approve/${thesisId}`, {}, {
                headers: {
                    'x-auth-token': user.token,
                },
            });
            setSnackbar({ show: true, message: 'Thesis approved successfully!', type: 'success' });
            fetchPendingTheses(); // Re-fetch list to remove approved thesis
        } catch (err) {
            console.error('Failed to approve thesis:', err.response ? err.response.data : err.message);
            setSnackbar({ show: true, message: 'Failed to approve thesis. Please try again.', type: 'error' });
        }
    };

    const handleReject = async (thesisId) => {
        if (!checkAuthorization()) return;
        if (window.confirm('Are you sure you want to reject this thesis?')) {
            try {
                await axios.put(`http://localhost:5000/api/theses/reject/${thesisId}`, {}, {
                    headers: {
                        'x-auth-token': user.token,
                    },
                });
                setSnackbar({ show: true, message: 'Thesis rejected successfully!', type: 'success' });
                fetchPendingTheses(); // Re-fetch list to remove rejected thesis
            } catch (err) {
                console.error('Failed to reject thesis:', err.response ? err.response.data : err.message);
                setSnackbar({ show: true, message: 'Failed to reject thesis. Please try again.', type: 'error' });
            }
        }
    };

    const handleDownload = (filePath, fileName) => {
        const fileUrl = `http://localhost:5000/${filePath.replace(/\\/g, '/')}`;
        window.open(fileUrl, '_blank');
        setSnackbar({ show: true, message: `Downloading ${fileName}...`, type: 'info' });
    };

    // Render loading state for initial user context or if authorization fails
    if (userLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
                <p className="ms-3 text-white">Loading Admin Dashboard...</p>
            </div>
        );
    }

    // Render access denied state if checkAuthorization returns false
    if (!user || (user.role !== 'admin' && user.role !== 'supervisor')) {
        return (
            <div className="container py-5 text-center">
                <Snackbar message={snackbar.message} type={snackbar.type} show={snackbar.show} onClose={handleCloseSnackbar} />
                <h1 className="text-danger mb-4">Access Denied</h1>
                <p className="lead text-white">{pendingThesesError || allUsersError}</p>
                <p className="text-white-50">Please ensure you are logged in with an administrator or supervisor account.</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <Snackbar message={snackbar.message} type={snackbar.type} show={snackbar.show} onClose={handleCloseSnackbar} />

            <h1 className="text-center mb-5 text-white">
                <FontAwesomeIcon icon={faClipboardList} className="me-3" /> Admin Dashboard
            </h1>

            {/* Tab Navigation */}
            <ul className="nav nav-tabs nav-justified mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'pendingTheses' ? 'active' : ''} text-white`}
                        onClick={() => setActiveTab('pendingTheses')}
                        style={{ backgroundColor: activeTab === 'pendingTheses' ? 'rgba(0, 123, 255, 0.7)' : 'rgba(0,0,0,0.3)', borderColor: 'transparent' }}
                    >
                        <FontAwesomeIcon icon={faClipboardList} className="me-2" /> Pending Theses
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'allUsers' ? 'active' : ''} text-white`}
                        onClick={() => setActiveTab('allUsers')}
                        style={{ backgroundColor: activeTab === 'allUsers' ? 'rgba(0, 123, 255, 0.7)' : 'rgba(0,0,0,0.3)', borderColor: 'transparent' }}
                    >
                        <FontAwesomeIcon icon={faUsers} className="me-2" /> All Users
                    </button>
                </li>
            </ul>

            {/* Tab Content */}
            <div className="tab-content">
                {/* Pending Theses Tab Content */}
                {activeTab === 'pendingTheses' && (
                    <div className="tab-pane fade show active">
                        {loadingPendingTheses ? (
                            <div className="d-flex justify-content-center align-items-center py-5">
                                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
                                <p className="ms-3 text-white">Loading pending theses...</p>
                            </div>
                        ) : pendingThesesError ? (
                            <div className="alert alert-danger text-center">{pendingThesesError}</div>
                        ) : pendingTheses.length === 0 ? (
                            <div className="text-center text-white-50">
                                <p className="lead">No pending theses found at the moment.</p>
                                <p>Great job! All theses are up-to-date.</p>
                            </div>
                        ) : (
                            <div className="row row-cols-1 g-4">
                                {pendingTheses.map((thesis) => (
                                    <div className="col" key={thesis._id}>
                                        <div className="card h-100 shadow-sm bg-light text-dark">
                                            <div className="card-body d-flex flex-column">
                                                <h5 className="card-title text-primary mb-2">{thesis.title}</h5>
                                                <h6 className="card-subtitle mb-2 text-muted">
                                                    <FontAwesomeIcon icon={faUserGraduate} className="me-1" />
                                                    Uploaded by: {thesis.user ? thesis.user.username : 'N/A'} ({thesis.user ? thesis.user.email : 'N/A'})
                                                </h6>
                                                <h6 className="card-subtitle mb-2 text-muted">
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                                    Uploaded: {new Date(thesis.uploadDate).toLocaleDateString()}
                                                </h6>
                                                <p className="card-text flex-grow-1 overflow-hidden" style={{ maxHeight: '6em' }}>
                                                    {thesis.abstract}
                                                </p>
                                                {thesis.keywords && thesis.keywords.length > 0 && (
                                                    <p className="card-text text-muted small">
                                                        <FontAwesomeIcon icon={faTags} className="me-1" />
                                                        Keywords: {thesis.keywords.join(', ')}
                                                    </p>
                                                )}
                                                <div className="mt-auto d-flex justify-content-end pt-3 border-top">
                                                    <button
                                                        className="btn btn-outline-secondary btn-sm me-2"
                                                        title="Download Thesis"
                                                        onClick={() => handleDownload(thesis.filePath, thesis.fileName)}
                                                    >
                                                        <FontAwesomeIcon icon={faFilePdf} className="me-2" /> Download
                                                    </button>
                                                    <button
                                                        className="btn btn-success btn-sm me-2"
                                                        title="Approve Thesis"
                                                        onClick={() => handleApprove(thesis._id)}
                                                    >
                                                        <FontAwesomeIcon icon={faCheckCircle} className="me-2" /> Approve
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        title="Reject Thesis"
                                                        onClick={() => handleReject(thesis._id)}
                                                    >
                                                        <FontAwesomeIcon icon={faTimesCircle} className="me-2" /> Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* All Users Tab Content */}
                {activeTab === 'allUsers' && (
                    <div className="tab-pane fade show active">
                        {loadingAllUsers ? (
                            <div className="d-flex justify-content-center align-items-center py-5">
                                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
                                <p className="ms-3 text-white">Loading users...</p>
                            </div>
                        ) : allUsersError ? (
                            <div className="alert alert-danger text-center">{allUsersError}</div>
                        ) : allUsers.length === 0 ? (
                            <div className="text-center text-white-50">
                                <p className="lead">No users found.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped table-hover bg-light text-dark rounded-3 overflow-hidden shadow-sm">
                                    <thead className="table-primary">
                                        <tr>
                                            <th scope="col">#</th>
                                            <th scope="col">Username</th>
                                            <th scope="col">Email</th>
                                            <th scope="col">Role</th>
                                            <th scope="col">Member Since</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allUsers.map((userItem, index) => (
                                            <tr key={userItem._id}>
                                                <th scope="row">{index + 1}</th>
                                                <td><FontAwesomeIcon icon={faUserCircle} className="me-2" />{userItem.username}</td>
                                                <td><FontAwesomeIcon icon={faEnvelope} className="me-2" />{userItem.email}</td>
                                                <td><span className={`badge ${userItem.role === 'admin' ? 'bg-danger' : userItem.role === 'supervisor' ? 'bg-info' : 'bg-secondary'}`}>
                                                    {userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                                                </span></td>
                                                <td>{new Date(userItem.date).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboardPage;
