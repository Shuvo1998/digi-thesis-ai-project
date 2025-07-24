// frontend/src/pages/DashboardPage.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import Snackbar from '../components/Common/Snackbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBookOpen, faSpinner
} from '@fortawesome/free-solid-svg-icons';
import ThesisCard from '../components/Thesis/ThesisCard';

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
            setError('');
            // UPDATED: Use the live Render backend URL
            const res = await axios.get('https://digi-thesis-ai-project.onrender.com/api/theses', {
                headers: {
                    'x-auth-token': user.token,
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

    const handlePlagiarismCheck = async (thesisId) => {
        setCheckingPlagiarismId(thesisId);
        setSnackbar({ show: false, message: '', type: 'info' });

        if (!user || !user.token) {
            setSnackbar({ show: true, message: 'You must be logged in to perform this action.', type: 'error' });
            setCheckingPlagiarismId(null);
            return;
        }

        try {
            // UPDATED: Use the live Render backend URL
            const res = await axios.post(`https://digi-thesis-ai-project.onrender.com/api/theses/check-plagiarism/${thesisId}`, {}, {
                headers: {
                    'x-auth-token': user.token,
                },
            });
            setSnackbar({ show: true, message: res.data.msg, type: 'success' });
            fetchTheses();
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

    const handleGrammarCheck = async (thesisId) => {
        setCheckingGrammarId(thesisId);
        setSnackbar({ show: false, message: '', type: 'info' });

        if (!user || !user.token) {
            setSnackbar({ show: true, message: 'You must be logged in to perform this action.', type: 'error' });
            setCheckingGrammarId(null);
            return;
        }

        try {
            // UPDATED: Use the live Render backend URL
            const res = await axios.post(`https://digi-thesis-ai-project.onrender.com/api/theses/check-grammar/${thesisId}`, {}, {
                headers: {
                    'x-auth-token': user.token,
                },
            });
            setSnackbar({ show: true, message: res.data.msg, type: 'success' });
            fetchTheses();
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

    const handleEdit = (thesisId) => {
        console.log('Edit thesis:', thesisId);
        setSnackbar({ show: true, message: `Edit functionality for thesis ${thesisId} coming soon!`, type: 'info' });
    };

    const handleDelete = async (thesisId) => {
        if (window.confirm('Are you sure you want to delete this thesis? This action cannot be undone.')) {
            try {
                // UPDATED: Use the live Render backend URL
                await axios.delete(`https://digi-thesis-ai-project.onrender.com/api/theses/${thesisId}`, {
                    headers: {
                        'x-auth-token': user.token,
                    },
                });
                setSnackbar({ show: true, message: 'Thesis deleted successfully!', type: 'success' });
                fetchTheses();
            } catch (err) {
                console.error('Failed to delete thesis:', err.response ? err.response.data : err.message);
                setSnackbar({ show: true, message: 'Failed to delete thesis. Please try again.', type: 'error' });
            }
        }
    };

    const handleDownload = (filePath, fileName) => {
        // UPDATED: Use the live Render backend URL
        const fileUrl = `https://digi-thesis-ai-project.onrender.com/${filePath.replace(/\\/g, '/')}`;
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
                            <ThesisCard
                                thesis={thesis}
                                isOwnerOrAdmin={true}
                                checkingPlagiarismId={checkingPlagiarismId}
                                checkingGrammarId={checkingGrammarId}
                                onPlagiarismCheck={handlePlagiarismCheck}
                                onGrammarCheck={handleGrammarCheck}
                                onDownload={handleDownload}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
