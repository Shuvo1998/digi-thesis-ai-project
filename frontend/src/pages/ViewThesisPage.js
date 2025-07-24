// frontend/src/pages/ViewThesisPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import Snackbar from '../components/Common/Snackbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSpinner, faBookOpen, faUserGraduate, faBuilding, faCalendarAlt,
    faTags, faFilePdf, faDownload, faClipboardCheck, faPenFancy, faEye, faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const ViewThesisPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, loading: userLoading } = useContext(UserContext);

    const [thesis, setThesis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({
        show: false,
        message: '',
        type: 'info',
    });

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, show: false });
    };

    useEffect(() => {
        const fetchThesis = async () => {
            if (userLoading) return; // Wait for user context to load

            if (!user || !user.token) {
                setSnackbar({
                    show: true,
                    message: 'You must be logged in to view thesis details. Redirecting to login.',
                    type: 'error',
                });
                setTimeout(() => navigate('/login'), 3000);
                return;
            }

            try {
                setLoading(true);
                setError('');
                // Backend URL is now hardcoded
                const res = await axios.get(`https://digi-thesis-ai-project.onrender.com/api/theses/${id}`, {
                    headers: {
                        'x-auth-token': user.token,
                    },
                });
                setThesis(res.data);
            } catch (err) {
                console.error('Failed to fetch thesis:', err.response ? err.response.data : err.message);
                const errorMessage = err.response && err.response.data && err.response.data.msg
                    ? err.response.data.msg
                    : 'Failed to load thesis details. It might not exist or you might not have permission.';
                setError(errorMessage);
                setSnackbar({
                    show: true,
                    message: errorMessage,
                    type: 'error',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchThesis();
    }, [id, user, userLoading, navigate]); // Re-run effect if ID or user changes

    const handleDownload = () => {
        if (thesis && thesis.filePath) {
            // Backend URL is now hardcoded
            const fileUrl = `https://digi-thesis-ai-project.onrender.com/${thesis.filePath.replace(/\\/g, '/')}`;
            window.open(fileUrl, '_blank');
            setSnackbar({ show: true, message: `Downloading ${thesis.fileName}...`, type: 'info' });
        }
    };

    const handlePlagiarismCheck = async () => {
        if (!user || !user.token) {
            setSnackbar({ show: true, message: 'You must be logged in to perform this action.', type: 'error' });
            return;
        }
        if (!thesis) return;

        try {
            setSnackbar({ show: true, message: 'Initiating plagiarism check...', type: 'info' });
            // Backend URL is now hardcoded
            const res = await axios.post(`https://digi-thesis-ai-project.onrender.com/api/theses/check-plagiarism/${thesis._id}`, {}, {
                headers: {
                    'x-auth-token': user.token,
                },
            });
            setThesis(prev => ({ ...prev, plagiarismResult: res.data.result }));
            setSnackbar({ show: true, message: res.data.msg, type: 'success' });
        } catch (err) {
            console.error('Plagiarism check failed:', err.response ? err.response.data : err.message);
            const errorMessage = err.response && err.response.data && err.response.data.msg
                ? err.response.data.msg
                : 'Plagiarism check failed. Please try again.';
            setSnackbar({ show: true, message: errorMessage, type: 'error' });
        }
    };

    const handleGrammarCheck = async () => {
        if (!user || !user.token) {
            setSnackbar({ show: true, message: 'You must be logged in to perform this action.', type: 'error' });
            return;
        }
        if (!thesis) return;

        try {
            setSnackbar({ show: true, message: 'Initiating grammar check...', type: 'info' });
            // Backend URL is now hardcoded
            const res = await axios.post(`https://digi-thesis-ai-project.onrender.com/api/theses/check-grammar/${thesis._id}`, {}, {
                headers: {
                    'x-auth-token': user.token,
                },
            });
            setThesis(prev => ({ ...prev, grammarResult: res.data.result }));
            setSnackbar({ show: true, message: res.data.msg, type: 'success' });
        } catch (err) {
            console.error('Grammar check failed:', err.response ? err.response.data : err.message);
            const errorMessage = err.response && err.response.data && err.response.data.msg
                ? err.response.data.msg
                : 'Grammar check failed. Please try again.';
            setSnackbar({ show: true, message: errorMessage, type: 'error' });
        }
    };

    if (loading || userLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
                <p className="ms-3 text-white">Loading thesis details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5 text-center">
                <Snackbar message={snackbar.message} type={snackbar.type} show={snackbar.show} onClose={handleCloseSnackbar} />
                <h1 className="text-danger mb-4">Error</h1>
                <p className="lead text-white">{error}</p>
                <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    if (!thesis) {
        return (
            <div className="container py-5 text-center text-white">
                <p className="lead">Thesis not found or no data available.</p>
                <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    const isOwner = user && thesis.user && thesis.user._id === user._id;
    const isAdminOrSupervisor = user && (user.role === 'admin' || user.role === 'supervisor');

    return (
        <div className="container py-5">
            <Snackbar message={snackbar.message} type={snackbar.type} show={snackbar.show} onClose={handleCloseSnackbar} />

            <motion.div
                className="card p-4 shadow-lg"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 10 }}
            >
                <h2 className="card-title text-dark mb-3">
                    <FontAwesomeIcon icon={faBookOpen} className="me-2" /> {thesis.title}
                </h2>

                {/* NEW: Display Author, Department, Year */}
                <div className="mb-3 text-start text-dark">
                    <p className="mb-1">
                        <FontAwesomeIcon icon={faUserGraduate} className="me-2 text-primary" />
                        <strong>Author:</strong> {thesis.authorName}
                    </p>
                    <p className="mb-1">
                        <FontAwesomeIcon icon={faBuilding} className="me-2 text-primary" />
                        <strong>Department:</strong> {thesis.department}
                    </p>
                    <p className="mb-1">
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                        <strong>Submission Year:</strong> {thesis.submissionYear}
                    </p>
                    <p className="mb-1">
                        {thesis.isPublic ? (
                            <FontAwesomeIcon icon={faEye} className="me-2 text-success" />
                        ) : (
                            <FontAwesomeIcon icon={faEyeSlash} className="me-2 text-secondary" />
                        )}
                        <strong>Visibility:</strong> {thesis.isPublic ? 'Public' : 'Private'}
                    </p>
                </div>

                <h5 className="text-dark text-start mt-4 mb-2">Abstract:</h5>
                <p className="card-text text-muted text-start mb-4">{thesis.abstract}</p>

                {thesis.keywords && thesis.keywords.length > 0 && (
                    <div className="mb-4 text-start">
                        <h5 className="text-dark mb-2">Keywords:</h5>
                        {thesis.keywords.map((keyword, index) => (
                            <span key={index} className="badge bg-info text-white me-1 mb-1">
                                {keyword}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mb-4 text-start">
                    <h5 className="text-dark mb-2">Uploaded By:</h5>
                    <p className="text-muted">{thesis.user ? thesis.user.username : 'N/A'} ({thesis.user ? thesis.user.email : 'N/A'}) on {new Date(thesis.uploadDate).toLocaleDateString()}</p>
                </div>

                {/* Plagiarism and Grammar Results */}
                <div className="mb-4 text-start">
                    <h5 className="text-dark mb-2">Analysis Results:</h5>
                    <div className="plagiarism-result mb-2 text-dark">
                        <strong>Plagiarism Check:</strong> {thesis.plagiarismResult}
                    </div>
                    <div className="grammar-result text-dark">
                        <strong>Grammar Check:</strong> {thesis.grammarResult}
                    </div>
                </div>

                <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
                    <motion.button
                        className="btn btn-primary btn-lg"
                        onClick={handleDownload}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FontAwesomeIcon icon={faDownload} className="me-2" /> Download Thesis
                    </motion.button>

                    {(isOwner || isAdminOrSupervisor) && (
                        <>
                            <motion.button
                                className="btn btn-info btn-lg"
                                onClick={handlePlagiarismCheck}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FontAwesomeIcon icon={faClipboardCheck} className="me-2" /> Run Plagiarism Check
                            </motion.button>
                            <motion.button
                                className="btn btn-secondary btn-lg"
                                onClick={handleGrammarCheck}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FontAwesomeIcon icon={faPenFancy} className="me-2" /> Run Grammar Check
                            </motion.button>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ViewThesisPage;
