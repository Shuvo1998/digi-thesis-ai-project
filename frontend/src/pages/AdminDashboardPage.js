// frontend/src/pages/AdminDashboardPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import Snackbar from '../components/Common/Snackbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSpinner, faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import ThesisCard from '../components/Thesis/ThesisCard';

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
    const [checkingPlagiarismId, setCheckingPlagiarismId] = useState(null);
    const [checkingGrammarId, setCheckingGrammarId] = useState(null);

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, show: false });
    };

    const fetchPendingTheses = async () => {
        if (userLoading) return;

        if (!user || (user.role !== 'admin' && user.role !== 'supervisor')) {
            setError('Access Denied: You do not have permission to view this page.');
            setSnackbar({
                show: true,
                message: 'Access Denied: You do not have permission to view this page.',
                type: 'error',
            });
            setLoadingTheses(false);
            setTimeout(() => navigate('/'), 3000);
            return;
        }

        try {
            setLoadingTheses(true);
            setError('');
            // Backend URL is now hardcoded
            const res = await axios.get('https://digi-thesis-ai-project.onrender.com/api/theses/pending', {
                headers: {
                    'x-auth-token': user.token,
                },
            });
            // CORRECTED: Access the 'theses' array from the response data
            setPendingTheses(res.data.theses);
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

    useEffect(() => {
        fetchPendingTheses();
    }, [user, userLoading]);

    const handleApprove = async (thesisId) => {
        if (!user || (user.role !== 'admin' && user.role !== 'supervisor')) {
            setSnackbar({ show: true, message: 'Unauthorized action.', type: 'error' });
            return;
        }
        try {
            // Backend URL is now hardcoded
            await axios.put(`https://digi-thesis-ai-project.onrender.com/api/theses/approve/${thesisId}`, {}, {
                headers: {
                    'x-auth-token': user.token,
                },
            });
            setSnackbar({ show: true, message: 'Thesis approved successfully!', type: 'success' });
            fetchPendingTheses();
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
                // Backend URL is now hardcoded
                await axios.put(`https://digi-thesis-ai-project.onrender.com/api/theses/reject/${thesisId}`, {}, {
                    headers: {
                        'x-auth-token': user.token,
                    },
                });
                setSnackbar({ show: true, message: 'Thesis rejected successfully!', type: 'success' });
                fetchPendingTheses();
            } catch (err) {
                console.error('Failed to reject thesis:', err.response ? err.response.data : err.message);
                setSnackbar({ show: true, message: 'Failed to reject thesis. Please try again.', type: 'error' });
            }
        }
    };

    const handleDownload = (filePath, fileName) => {
        // Backend URL is now hardcoded
        const fileUrl = `https://digi-thesis-ai-project.onrender.com/${filePath.replace(/\\/g, '/')}`;
        window.open(fileUrl, '_blank');
        setSnackbar({ show: true, message: `Downloading ${fileName}...`, type: 'info' });
    };

    const handlePlagiarismCheck = async (thesisId) => {
        setCheckingPlagiarismId(thesisId);
        setSnackbar({ show: false, message: '', type: 'info' });

        if (!user || !user.token) {
            setSnackbar({ show: true, message: 'You must be logged in to perform this action.', type: 'error' });
            setCheckingPlagiarismId(null);
            return;
        }

        try {
            // Backend URL is now hardcoded
            const res = await axios.post(`https://digi-thesis-ai-project.onrender.com/api/theses/check-plagiarism/${thesisId}`, {}, {
                headers: {
                    'x-auth-token': user.token,
                },
            });
            setSnackbar({ show: true, message: res.data.msg, type: 'success' });
            fetchPendingTheses();
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
            // Backend URL is now hardcoded
            const res = await axios.post(`https://digi-thesis-ai-project.onrender.com/api/theses/check-grammar/${thesisId}`, {}, {
                headers: {
                    'x-auth-token': user.token,
                },
            });
            setSnackbar({ show: true, message: res.data.msg, type: 'success' });
            fetchPendingTheses();
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


    if (userLoading || loadingTheses) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
                <p className="ms-3 text-white">Loading Admin Dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5 text-center">
                <Snackbar message={snackbar.message} type={snackbar.type} show={snackbar.show} onClose={handleCloseSnackbar} />
                <h1 className="text-danger mb-4">Access Denied</h1>
                <p className="lead text-white">{error}</p>
                <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <Snackbar message={snackbar.message} type={snackbar.type} show={snackbar.show} onClose={handleCloseSnackbar} />

            <h1 className="text-center mb-5 text-white">
                <FontAwesomeIcon icon={faClipboardList} className="me-3" /> Pending Theses for Approval
            </h1>

            {/* Check if pendingTheses.length is 0, which means the 'theses' array is empty */}
            {pendingTheses.length === 0 ? (
                <div className="text-center text-white-50">
                    <p className="lead">No pending theses found at the moment.</p>
                    <p>Great job! All theses are up-to-date.</p>
                </div>
            ) : (
                <div className="row row-cols-1 g-4">
                    {pendingTheses.map((thesis) => (
                        <div className="col" key={thesis._id}>
                            <ThesisCard
                                thesis={thesis}
                                isOwnerOrAdmin={true}
                                checkingPlagiarismId={checkingPlagiarismId}
                                checkingGrammarId={checkingGrammarId}
                                onPlagiarismCheck={handlePlagiarismCheck}
                                onGrammarCheck={handleGrammarCheck}
                                onDownload={handleDownload}
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;
