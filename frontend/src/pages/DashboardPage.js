// frontend/src/pages/DashboardPage.js
import React, { useState, useEffect, useContext, useCallback } from 'react'; // Added useCallback
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import { UserContext } from '../context/UserContext';
// Snackbar is now rendered globally by UserContext, no need to import/render here
// import Snackbar from '../components/Common/Snackbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBookOpen, faSpinner, faEdit, faTrashAlt // Added icons for actions
} from '@fortawesome/free-solid-svg-icons';
import ThesisCard from '../components/Thesis/ThesisCard';

const DashboardPage = () => {
    const { user, loading: userLoading, showSnackbar } = useContext(UserContext); // Get showSnackbar from context
    const navigate = useNavigate(); // Initialize navigate

    const [theses, setTheses] = useState([]);
    const [loadingTheses, setLoadingTheses] = useState(true);
    const [error, setError] = useState('');
    // Local snackbar state and handleCloseSnackbar are no longer needed here
    // as UserContext manages the global Snackbar.
    // const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'info' });
    // const handleCloseSnackbar = () => { setSnackbar({ ...snackbar, show: false }); };

    const [checkingPlagiarismId, setCheckingPlagiarismId] = useState(null);
    const [checkingGrammarId, setCheckingGrammarId] = useState(null);

    // --- Fetching Function (Wrapped in useCallback) ---
    const fetchTheses = useCallback(async () => {
        // Only attempt to fetch if user is loaded and authenticated
        if (!user) {
            setLoadingTheses(false);
            // Error message will be handled by the useEffect below for redirection
            return;
        }

        try {
            setLoadingTheses(true);
            setError('');
            // Axios default header (x-auth-token) is set by UserContext, no need to pass manually here
            const res = await axios.get('https://digi-thesis-ai-project.onrender.com/api/theses');
            setTheses(Array.isArray(res.data) ? res.data : []); // Ensure it's an array
            // showSnackbar('Your theses loaded successfully.', 'success'); // Commented to reduce excessive notifications
        } catch (err) {
            console.error('Failed to fetch theses:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.msg || 'Failed to load your theses. Please try again.');
            setTheses([]); // Clear theses on error
            showSnackbar(err.response?.data?.msg || 'Failed to load your theses: Server Error', 'error');
        } finally {
            setLoadingTheses(false);
        }
    }, [user, showSnackbar]); // user and showSnackbar are dependencies

    // --- Effects ---

    // Effect to handle redirection based on user authentication status
    useEffect(() => {
        if (!userLoading) { // Wait until user context has finished loading
            if (!user) {
                showSnackbar('Please log in to view your dashboard.', 'error');
                navigate('/login');
            }
        }
    }, [user, userLoading, navigate, showSnackbar]);

    // Effect to fetch theses when user is loaded and authenticated
    useEffect(() => {
        if (!userLoading && user) { // Only fetch if user is loaded AND exists
            fetchTheses();
        }
    }, [user, userLoading, fetchTheses]); // fetchTheses is now a stable dependency

    // --- Action Handlers (Wrapped in useCallback) ---
    const handlePlagiarismCheck = useCallback(async (thesisId) => {
        setCheckingPlagiarismId(thesisId);
        // showSnackbar('Initiating plagiarism check...', 'info'); // Snackbar will be shown on success/error

        try {
            const res = await axios.post(`https://digi-thesis-ai-project.onrender.com/api/theses/check-plagiarism/${thesisId}`);
            showSnackbar(res.data.msg, 'success');
            fetchTheses(); // Refresh the list
        } catch (err) {
            console.error('Plagiarism check failed:', err.response ? err.response.data : err.message);
            const errorMessage = err.response && err.response.data && err.response.data.msg
                ? err.response.data.msg
                : 'Plagiarism check failed. Please try again.';
            showSnackbar(errorMessage, 'error');
        } finally {
            setCheckingPlagiarismId(null);
        }
    }, [user, showSnackbar, fetchTheses]); // user is a dependency if you check user.token inside (though not needed with global axios header)

    const handleGrammarCheck = useCallback(async (thesisId) => {
        setCheckingGrammarId(thesisId);
        // showSnackbar('Initiating grammar check...', 'info');

        try {
            const res = await axios.post(`https://digi-thesis-ai-project.onrender.com/api/theses/check-grammar/${thesisId}`);
            showSnackbar(res.data.msg, 'success');
            fetchTheses(); // Refresh the list
        } catch (err) {
            console.error('Grammar check failed:', err.response ? err.response.data : err.message);
            const errorMessage = err.response && err.response.data && err.response.data.msg
                ? err.response.data.msg
                : 'Grammar check failed. Please try again.';
            showSnackbar(errorMessage, 'error');
        } finally {
            setCheckingGrammarId(null);
        }
    }, [user, showSnackbar, fetchTheses]);

    const handleEdit = useCallback((thesisId) => {
        console.log('Edit thesis:', thesisId);
        showSnackbar(`Edit functionality for thesis ${thesisId} coming soon!`, 'info');
    }, [showSnackbar]);

    const handleDelete = useCallback(async (thesisId) => {
        // IMPORTANT: Replace window.confirm with a custom modal for better UX and consistency
        if (window.confirm('Are you sure you want to delete this thesis? This action cannot be undone.')) {
            try {
                await axios.delete(`https://digi-thesis-ai-project.onrender.com/api/theses/${thesisId}`);
                showSnackbar('Thesis deleted successfully!', 'success');
                fetchTheses(); // Refresh the list
            } catch (err) {
                console.error('Failed to delete thesis:', err.response ? err.response.data : err.message);
                showSnackbar('Failed to delete thesis. Please try again.', 'error');
            }
        }
    }, [user, showSnackbar, fetchTheses]); // user dependency if you use user.token (though not needed with global axios header)

    const handleDownload = useCallback((filePath, fileName) => {
        const fileUrl = `https://digi-thesis-ai-project.onrender.com/${filePath.replace(/\\/g, '/')}`;
        window.open(fileUrl, '_blank');
        showSnackbar(`Downloading ${fileName}...`, 'info');
    }, [showSnackbar]);

    // --- Render Logic ---

    // Show loading spinner while user data is being fetched initially OR theses are loading
    if (userLoading || loadingTheses) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 font-inter"> {/* Dark theme */}
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-blue-400" /> {/* Dark theme color */}
                <p className="ml-3 text-lg text-gray-300">Loading Dashboard...</p> {/* Dark theme color */}
            </div>
        );
    }

    // If user is not authenticated after loading, display a message (redirection handled by useEffect)
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-inter"> {/* Dark theme */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-center"> {/* Dark theme card */}
                    <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Authentication Required:</strong>
                        <span className="block sm:inline"> Please log in to view your dashboard.</span>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-md text-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-lg"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8 font-inter"> {/* Dark theme background */}
            {/* Snackbar is now rendered globally by UserProvider, no need for local render */}
            {/* <Snackbar
                message={snackbar.message}
                type={snackbar.type}
                show={snackbar.show}
                onClose={handleCloseSnackbar}
            /> */}

            <div className="max-w-7xl mx-auto bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl"> {/* Dark theme card background */}
                <h1 className="text-center mb-5 text-gray-100 text-3xl sm:text-4xl font-bold"> {/* Dark theme text color */}
                    <FontAwesomeIcon icon={faBookOpen} className="mr-3 text-blue-400" /> My Theses {/* Adjusted icon color */}
                </h1>

                {error && (
                    <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}

                {theses.length === 0 ? (
                    <div className="text-center text-gray-300 text-lg py-10"> {/* Dark theme text color */}
                        <p className="lead">You haven't uploaded any theses yet.</p>
                        <p className="text-sm text-gray-400">Click "Upload Your Thesis" on the homepage to get started!</p>
                        <button
                            onClick={fetchTheses}
                            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-200"
                        >
                            <FontAwesomeIcon icon={faSpinner} className="mr-2" /> Refresh My Theses
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Tailwind grid classes */}
                        {theses.map((thesis) => (
                            <ThesisCard
                                key={thesis._id}
                                thesis={thesis}
                                isOwnerOrAdmin={true} // Assuming user is owner here
                                checkingPlagiarismId={checkingPlagiarismId}
                                checkingGrammarId={checkingGrammarId}
                                onPlagiarismCheck={handlePlagiarismCheck}
                                onGrammarCheck={handleGrammarCheck}
                                onDownload={handleDownload}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            // Ensure ThesisCard itself adapts to dark theme
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
