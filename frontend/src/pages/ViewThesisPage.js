// frontend/src/pages/ViewThesisPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import Snackbar from '../components/Common/Snackbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBookOpen, faUserGraduate, faCalendarAlt, faTags, faFilePdf,
    faSpinner, faClipboardList, faSearch, faLanguage, faDownload
} from '@fortawesome/free-solid-svg-icons';

const ViewThesisPage = () => {
    const { id } = useParams(); // Get thesis ID from URL
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
    const [checkingPlagiarismId, setCheckingPlagiarismId] = useState(null);
    const [checkingGrammarId, setCheckingGrammarId] = useState(null);

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, show: false });
    };

    // Function to fetch a single thesis
    const fetchThesis = async () => {
        setLoading(true);
        setError('');
        try {
            let res;
            // Determine which endpoint to call based on user's role and thesis status
            // If user is logged in AND is owner OR admin/supervisor, try private endpoint first
            if (user && !userLoading) {
                // Attempt to fetch via private endpoint (for owner/admin/supervisor)
                try {
                    res = await axios.get(`http://localhost:5000/api/theses/${id}`, {
                        headers: { 'x-auth-token': user.token }
                    });
                } catch (privateErr) {
                    // If private endpoint fails (e.g., not owner), try public if approved
                    console.warn("Private thesis fetch failed, attempting public:", privateErr.message);
                    res = await axios.get(`http://localhost:5000/api/theses/public/${id}`);
                }
            } else {
                // If not logged in, only try public endpoint
                res = await axios.get(`http://localhost:5000/api/theses/public/${id}`);
            }

            setThesis(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch thesis:', err.response ? err.response.data : err.message);
            const msg = err.response && err.response.data && err.response.data.msg
                ? err.response.data.msg
                : 'Failed to load thesis details. It might not exist or be publicly available.';
            setError(msg);
            setSnackbar({ show: true, message: msg, type: 'error' });
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only fetch if user loading is complete
        if (!userLoading) {
            fetchThesis();
        }
    }, [id, user, userLoading]); // Re-fetch if ID or user/loading changes

    // --- Handle Plagiarism Check ---
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
            fetchThesis(); // Re-fetch thesis to update the plagiarismResult
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

    // --- Handle Grammar Check ---
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
            fetchThesis(); // Re-fetch thesis to update the grammarResult
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

    const handleDownload = (filePath, fileName) => {
        const fileUrl = `http://localhost:5000/${filePath.replace(/\\/g, '/')}`;
        window.open(fileUrl, '_blank');
        setSnackbar({ show: true, message: `Downloading ${fileName}...`, type: 'info' });
    };

    if (loading || userLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
                <p className="ms-3 text-white">Loading Thesis...</p>
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
            <div className="container py-5 text-center text-white-50">
                <p className="lead">Thesis not found or could not be loaded.</p>
                <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    // Determine if the logged-in user is the owner or an admin/supervisor
    const isOwnerOrAdmin = user && (thesis.user._id === user.id || user.role === 'admin' || user.role === 'supervisor');

    return (
        <div className="container py-5">
            <Snackbar message={snackbar.message} type={snackbar.type} show={snackbar.show} onClose={handleCloseSnackbar} />

            <div className="card p-4 shadow-lg bg-light text-dark">
                <h2 className="card-title text-center text-primary mb-4">
                    <FontAwesomeIcon icon={faBookOpen} className="me-2" /> {thesis.title}
                </h2>

                <div className="card-body">
                    <p className="card-text text-muted mb-2">
                        <FontAwesomeIcon icon={faUserGraduate} className="me-2" />
                        Uploaded by: {thesis.user ? thesis.user.username : 'N/A'} ({thesis.user ? thesis.user.email : 'N/A'})
                    </p>
                    <p className="card-text text-muted mb-4">
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                        Uploaded on: {new Date(thesis.uploadDate).toLocaleDateString()}
                    </p>

                    <h5 className="text-info mt-4 mb-2">Abstract:</h5>
                    <p className="card-text border p-3 rounded bg-white">{thesis.abstract}</p>

                    {thesis.keywords && thesis.keywords.length > 0 && (
                        <>
                            <h5 className="text-info mt-4 mb-2">Keywords:</h5>
                            <p className="card-text border p-3 rounded bg-white">
                                <FontAwesomeIcon icon={faTags} className="me-2" /> {thesis.keywords.join(', ')}
                            </p>
                        </>
                    )}

                    {/* Plagiarism Result Display */}
                    {thesis.plagiarismResult && (
                        <>
                            <h5 className="text-info mt-4 mb-2">Plagiarism Check Result:</h5>
                            <div className="plagiarism-result p-3 border rounded bg-white overflow-auto" style={{ maxHeight: '150px', fontSize: '0.95em' }}>
                                <p className="mb-0">{thesis.plagiarismResult}</p>
                            </div>
                        </>
                    )}

                    {/* Grammar Result Display */}
                    {thesis.grammarResult && (
                        <>
                            <h5 className="text-info mt-4 mb-2">Grammar Check Result:</h5>
                            <div className="grammar-result p-3 border rounded bg-white overflow-auto" style={{ maxHeight: '150px', fontSize: '0.95em' }}>
                                <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{thesis.grammarResult}</p>
                            </div>
                        </>
                    )}

                    {/* Action Buttons (only visible to owner or admin/supervisor) */}
                    {isOwnerOrAdmin && (
                        <div className="d-flex flex-wrap justify-content-center gap-3 mt-4 pt-3 border-top">
                            <button
                                className="btn btn-info btn-lg"
                                title="Check Plagiarism"
                                onClick={() => handlePlagiarismCheck(thesis._id)}
                                disabled={checkingPlagiarismId === thesis._id || checkingGrammarId === thesis._id}
                            >
                                {checkingPlagiarismId === thesis._id ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin className="me-2" /> Checking Plagiarism...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faSearch} className="me-2" /> Check Plagiarism
                                    </>
                                )}
                            </button>

                            <button
                                className="btn btn-warning text-dark btn-lg"
                                title="Check Grammar"
                                onClick={() => handleGrammarCheck(thesis._id)}
                                disabled={checkingGrammarId === thesis._id || checkingPlagiarismId === thesis._id}
                            >
                                {checkingGrammarId === thesis._id ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin className="me-2" /> Checking Grammar...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faLanguage} className="me-2" /> Check Grammar
                                    </>
                                )}
                            </button>

                            <button
                                className="btn btn-outline-primary btn-lg"
                                title="Download Thesis"
                                onClick={() => handleDownload(thesis.filePath, thesis.fileName)}
                            >
                                <FontAwesomeIcon icon={faDownload} className="me-2" /> Download PDF
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewThesisPage;
