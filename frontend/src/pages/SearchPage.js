// frontend/src/pages/SearchPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom'; // To get query parameters
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import Snackbar from '../components/Common/Snackbar';
import ThesisCard from '../components/Thesis/ThesisCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';

const SearchPage = () => {
    const location = useLocation(); // Hook to access the URL's location object
    const { user, loading: userLoading } = useContext(UserContext); // Get user context for potential future private searches
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({
        show: false,
        message: '',
        type: 'info',
    });

    // Extract the search query from the URL (e.g., ?q=your+query)
    const searchQuery = new URLSearchParams(location.search).get('q') || '';

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, show: false });
    };

    // Function to fetch search results
    const fetchSearchResults = async () => {
        if (!searchQuery) {
            setSearchResults([]);
            setLoading(false);
            setError('Please enter a search query.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            // Call the backend search API
            const res = await axios.get(`http://localhost:5000/api/theses/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchResults(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch search results:', err.response ? err.response.data : err.message);
            const msg = err.response && err.response.data && err.response.data.msg
                ? err.response.data.msg
                : 'Failed to load search results. Please try again.';
            setError(msg);
            setSnackbar({ show: true, message: msg, type: 'error' });
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSearchResults();
    }, [searchQuery]); // Re-fetch results whenever the search query in the URL changes

    // Handler for downloading public theses (passed to ThesisCard)
    const handleDownloadPublicThesis = (filePath, fileName) => {
        const fileUrl = `http://localhost:5000/${filePath.replace(/\\/g, '/')}`;
        window.open(fileUrl, '_blank');
        setSnackbar({ show: true, message: `Downloading ${fileName}...`, type: 'info' });
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
                <p className="ms-3 text-white">Searching for theses...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <Snackbar message={snackbar.message} type={snackbar.type} show={snackbar.show} onClose={handleCloseSnackbar} />

            <h1 className="text-center mb-5 text-white">
                <FontAwesomeIcon icon={faSearch} className="me-3" /> Search Results for "{searchQuery}"
            </h1>

            {error && <div className="alert alert-danger text-center">{error}</div>}

            {searchResults.length === 0 ? (
                <div className="text-center text-white-50">
                    <p className="lead">No approved theses found matching your search.</p>
                    <p>Try a different keyword or phrase.</p>
                </div>
            ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {searchResults.map((thesis) => (
                        <div className="col" key={thesis._id}>
                            <ThesisCard
                                thesis={thesis}
                                onDownload={handleDownloadPublicThesis} // Only download is available for public search results
                            // No other actions are passed, so only download will be visible
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchPage;
