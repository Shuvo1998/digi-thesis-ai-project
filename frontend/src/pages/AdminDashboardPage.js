// frontend/src/pages/AdminDashboardPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import Snackbar from '../components/Common/Snackbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheckCircle, faTimesCircle, faDownload, faSpinner,
    faClipboardList, faUserGraduate, faCalendarAlt, faTags, faFilePdf
} from '@fortawesome/free-solid-svg-icons';

const AdminDashboardPage = () => {
    const { user, loading: userLoading } = useContext(UserContext);
    const navigate = useNavigate();
    const [pendingTheses, setPendingTheses] = useState([]);
    const [loadingTheses, setLoadingTheses] = useState(true);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({
        show: false,
        message: '',
        type: 'info',
    });

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, show: false });
    };

    // Function to fetch pending theses
    const fetchPendingTheses = async () => {
        // Ensure user is loaded and has the correct role before fetching
        if (userLoading) return; // Wait until user context is loaded

        if (!user || (user.role !== 'admin' && user.role !== 'supervisor')) {
            setError('Access Denied: You do not have permission to view this page.');
            setSnackbar({
                show: true,
                message: 'Access Denied: You do not have permission to view this page.',
                type: 'error',
            });
            setLoadingTheses(false);
            // Redirect if not authorized after a short delay
            setTimeout(() => navigate('/'), 3000);
            return;
        }

        try {
            setLoadingTheses(true);
            setError('');
            const res = await axios.get('http://localhost:5000/api/theses/pending', {
                headers: {
                    'x-auth-token': user.token, // Send JWT for authentication
                },
            });
            setPendingTheses(res.data);
            setLoadingTheses(false);
        } catch (err) {
            console.error('Failed to fetch pending theses:', err.response ? err.response.data : err.message);
            setError('Failed to load pending theses. Please try again.');
            setSnackbar({
                show: true,
                message: 'Failed to load pending theses. Please try again.',
                type: 'error',
            });
            setLoadingTheses(false);
        }
    };

    // Fetch pending theses on component mount and when user context changes
    useEffect(() => {
        fetchPendingTheses();
    }, [user, userLoading]); // Re-fetch if user or userLoading state changes

    const handleApprove = async (thesisId) => {
        if (!user || (user.role !== 'admin' && user.role !== 'supervisor')) {
            setSnackbar({ show: true, message: 'Unauthorized action.', type: 'error' });
            return;
        }
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
        if (!user || (user.role !== 'admin' && user.role !== 'supervisor')) {
            setSnackbar({ show: true, message: 'Unauthorized action.', type: 'error' });
            return;
        }
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

    // Render loading state
    if (userLoading || loadingTheses) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
                <p className="ms-3 text-white">Loading Admin Dashboard...</p>
            </div>
        );
    }

    // Render access denied state
    if (error) {
        return (
            <div className="container py-5 text-center">
                <Snackbar message={snackbar.message} type={snackbar.type} show={snackbar.show} onClose={handleCloseSnackbar} />
                <h1 className="text-danger mb-4">Access Denied</h1>
                <p className="lead text-white">{error}</p>
                <p className="text-white-50">Please ensure you are logged in with an administrator or supervisor account.</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <Snackbar message={snackbar.message} type={snackbar.type} show={snackbar.show} onClose={handleCloseSnackbar} />

            <h1 className="text-center mb-5 text-white">
                <FontAwesomeIcon icon={faClipboardList} className="me-3" /> Pending Theses for Approval
            </h1>

            {pendingTheses.length === 0 ? (
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
    );
};

export default AdminDashboardPage;
