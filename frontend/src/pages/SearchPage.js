// frontend/src/pages/SearchPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import Snackbar from '../components/Common/Snackbar';
import ThesisCard from '../components/Thesis/ThesisCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';

const SearchPage = () => {
    const location = useLocation();
    const { user, loading: userLoading } = useContext(UserContext);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({
        show: false,
        message: '',
        type: 'info',
    });

    const searchQuery = new URLSearchParams(location.search).get('q') || '';

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, show: false });
    };

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
            // UPDATED: Use the live Render backend URL
            const res = await axios.get(`YOUR_RENDER_BACKEND_URL/api/theses/search?q=${encodeURIComponent(searchQuery)}`);
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
    }, [searchQuery]);

    const handleDownloadPublicThesis = (filePath, fileName) => {
        // UPDATED: Use the live Render backend URL
        const fileUrl = `YOUR_RENDER_BACKEND_URL/${filePath.replace(/\\/g, '/')}`;
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
                                onDownload={handleDownloadPublicThesis}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchPage;
