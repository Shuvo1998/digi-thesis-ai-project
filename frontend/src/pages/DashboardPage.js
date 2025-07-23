// frontend/src/pages/DashboardPage.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import Snackbar from '../components/Common/Snackbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBookOpen, faSpinner // Removed other icons as they are now in ThesisCard
} from '@fortawesome/free-solid-svg-icons';
import ThesisCard from '../components/Thesis/ThesisCard'; // ADDED: Import ThesisCard

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
    const [checkingPlagiarismId, setCheckingPlagiarismId] = useState(null);
    const [checkingGrammarId, setCheckingGrammarId] = useState(null);

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
        if (!userLoading && user) {
            fetchTheses();
        } else if (!userLoading && !user) {
            setError('Please log in to view your dashboard.');
            setSnackbar({
                show: true,
                message: 'Please log in to view your dashboard.',
                type: 'error',
            });
        }
    }, [user, userLoading]);

    // --- Handle Plagiarism Check (existing) ---
    const handlePlagiarismCheck = async (thesisId) => {
        setCheckingPlagiarismId(thesisId);
        setSnackbar({ show: false, message: '', type: 'info' });

        if (!user || !user.token) {
            setSnackbar({ show: true, message: 'You must be logged in to perform this action.', type: 'error' });
            setCheckingPlagiarismId(null);
            return;
        }

        try {
            const res = await axios.post(`http://localhost:5000/api/theses/check-plagiarism/${thesisId}`, {}, {
                headers: {
                    'x-auth-token': user.token,
                },
            });
            setSnackbar({ show: true, message: res.data.msg, type: 'success' });
            fetchTheses(); // Re-fetch thesis to update the plagiarismResult on the card
        } catch (err) {
            console.error('Plagiarism check failed:', err.response ? err.response.data : err.message);
            const errorMessage = err.response && err.response.data && err.response.data.msg
                ? err.response.data.msg
                : 'Plagiarism check failed. Please try again.';
            setSnackbar({ show: true, message: errorMessage, type: 'error' });
        } finally {
            setCheckingPlagiarismId(null);
        }
    };

    // --- Handle Grammar Check (existing) ---
    const handleGrammarCheck = async (thesisId) => {
        setCheckingGrammarId(thesisId);
        setSnackbar({ show: false, message: '', type: 'info' });

        if (!user || !user.token) {
            setSnackbar({ show: true, message: 'You must be logged in to perform this action.', type: 'error' });
            setCheckingGrammarId(null);
            return;
        }

        try {
            const res = await axios.post(`http://localhost:5000/api/theses/check-grammar/${thesisId}`, {}, {
                headers: {
                    'x-auth-token': user.token,
                },
            });
            setSnackbar({ show: true, message: res.data.msg, type: 'success' });
            fetchTheses(); // Re-fetch thesis to update the grammarResult on the card
        } catch (err) {
            console.error('Grammar check failed:', err.response ? err.response.data : err.message);
            const errorMessage = err.response && err.response.data && err.response.data.msg
                ? err.response.data.msg
                : 'Grammar check failed. Please try again.';
            setSnackbar({ show: true, message: errorMessage, type: 'error' });
        } finally {
            setCheckingGrammarId(null);
        }
    };

    // Placeholder functions for future features (existing)
    const handleEdit = (thesisId) => {
        console.log('Edit thesis:', thesisId);
        setSnackbar({ show: true, message: `Edit functionality for thesis ${thesisId} coming soon!`, type: 'info' });
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
        const fileUrl = `http://localhost:5000/${filePath.replace(/\\/g, '/')}`;
        window.open(fileUrl, '_blank');
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
                            {/* Use ThesisCard component here */}
                            <ThesisCard
                                thesis={thesis}
                                isOwnerOrAdmin={true} // For dashboard, user is always the owner
                                checkingPlagiarismId={checkingPlagiarismId}
                                checkingGrammarId={checkingGrammarId}
                                onPlagiarismCheck={handlePlagiarismCheck}
                                onGrammarCheck={handleGrammarCheck}
                                onDownload={handleDownload}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            // No onApprove/onReject for DashboardPage
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
