// frontend/src/pages/DashboardPage.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import Snackbar from '../components/Common/Snackbar'; // For notifications
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faFilePdf, faTags, faCalendarAlt, faSpinner, faEdit, faTrashAlt, faDownload } from '@fortawesome/free-solid-svg-icons'; // Icons for dashboard

const DashboardPage = () => {
    const { user, loading: userLoading } = useContext(UserContext);
    const [theses, setTheses] = useState([]);
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

    // Function to fetch theses from the backend
    const fetchTheses = async () => {
        if (!user || !user.token) {
            setLoadingTheses(false);
            setError('User not authenticated. Please log in.');
            setSnackbar({
                show: true,
                message: 'User not authenticated. Please log in.',
                type: 'error',
            });
            return;
        }

        try {
            setLoadingTheses(true);
            setError(''); // Clear previous errors
            const res = await axios.get('http://localhost:5000/api/theses', {
                headers: {
                    'x-auth-token': user.token, // Send the JWT for authentication
                },
            });
            setTheses(res.data);
            setLoadingTheses(false);
        } catch (err) {
            console.error('Failed to fetch theses:', err.response ? err.response.data : err.message);
            setError('Failed to load theses. Please try again.');
            setSnackbar({
                show: true,
                message: 'Failed to load theses. Please try again.',
                type: 'error',
            });
            setLoadingTheses(false);
        }
    };

    // Fetch theses when the component mounts or user changes
    useEffect(() => {
        if (!userLoading && user) { // Only fetch if user context is loaded and user is available
            fetchTheses();
        } else if (!userLoading && !user) {
            // If user is not logged in after loading, set error
            setError('Please log in to view your dashboard.');
            setSnackbar({
                show: true,
                message: 'Please log in to view your dashboard.',
                type: 'error',
            });
        }
    }, [user, userLoading]); // Dependency array: re-run if user or userLoading changes

    // Placeholder functions for future features
    const handleEdit = (thesisId) => {
        console.log('Edit thesis:', thesisId);
        setSnackbar({ show: true, message: `Edit functionality for thesis ${thesisId} coming soon!`, type: 'info' });
        // Future: navigate('/edit-thesis/${thesisId}')
    };

    const handleDelete = async (thesisId) => {
        if (window.confirm('Are you sure you want to delete this thesis? This action cannot be undone.')) {
            try {
                await axios.delete(`http://localhost:5000/api/theses/${thesisId}`, {
                    headers: {
                        'x-auth-token': user.token,
                    },
                });
                setSnackbar({ show: true, message: 'Thesis deleted successfully!', type: 'success' });
                fetchTheses(); // Re-fetch theses to update the list
            } catch (err) {
                console.error('Failed to delete thesis:', err.response ? err.response.data : err.message);
                setSnackbar({ show: true, message: 'Failed to delete thesis. Please try again.', type: 'error' });
            }
        }
    };

    const handleDownload = (filePath, fileName) => {
        // Construct the full URL to the file
        const fileUrl = `http://localhost:5000/${filePath.replace(/\\/g, '/')}`; // Replace backslashes for URL compatibility
        window.open(fileUrl, '_blank'); // Open in new tab
        setSnackbar({ show: true, message: `Downloading ${fileName}...`, type: 'info' });
    };


    if (userLoading || loadingTheses) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
                <p className="ms-3 text-white">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <Snackbar
                message={snackbar.message}
                type={snackbar.type}
                show={snackbar.show}
                onClose={handleCloseSnackbar}
            />

            <h1 className="text-center mb-5 text-white">
                <FontAwesomeIcon icon={faBookOpen} className="me-3" /> My Theses
            </h1>

            {error && <div className="alert alert-danger text-center">{error}</div>}

            {theses.length === 0 ? (
                <div className="text-center text-white-50">
                    <p className="lead">You haven't uploaded any theses yet.</p>
                    <p>Click "Upload Your Thesis" on the homepage to get started!</p>
                </div>
            ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {theses.map((thesis) => (
                        <div className="col" key={thesis._id}>
                            <div className="card h-100 shadow-sm bg-light text-dark">
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title text-primary mb-2">{thesis.title}</h5>
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
                                    <div className="mt-auto d-flex justify-content-between align-items-center">
                                        <span className={`badge ${thesis.status === 'approved' ? 'bg-success' : thesis.status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                            Status: {thesis.status.charAt(0).toUpperCase() + thesis.status.slice(1)}
                                        </span>
                                        <div>
                                            <button
                                                className="btn btn-outline-secondary btn-sm me-2"
                                                title="Download Thesis"
                                                onClick={() => handleDownload(thesis.filePath, thesis.fileName)}
                                            >
                                                <FontAwesomeIcon icon={faDownload} />
                                            </button>
                                            <button
                                                className="btn btn-outline-primary btn-sm me-2"
                                                title="Edit Thesis"
                                                onClick={() => handleEdit(thesis._id)}
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                title="Delete Thesis"
                                                onClick={() => handleDelete(thesis._id)}
                                            >
                                                <FontAwesomeIcon icon={faTrashAlt} />
                                            </button>
                                        </div>
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

export default DashboardPage;
