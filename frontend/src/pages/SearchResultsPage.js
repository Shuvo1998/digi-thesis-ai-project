// frontend/src/pages/SearchResultsPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import ThesisCard from '../components/Thesis/ThesisCard';

const SearchResultsPage = () => {
    const location = useLocation();
    // No longer need 'user' from useContext for search authorization
    const { showSnackbar } = useContext(UserContext);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchSearchResults = async (query) => {
        setLoading(true);
        setError('');
        try {
            // Removed client-side login check for search
            // if (!user || !user.token) {
            //     setError('Please log in to perform a search.');
            //     showSnackbar('Please log in to perform a search.', 'error');
            //     setLoading(false);
            //     return;
            // }

            // Removed 'config' with 'x-auth-token' as search is now public
            const res = await axios.get(`https://digi-thesis-ai-project.onrender.com/api/theses/search?q=${encodeURIComponent(query)}`);

            if (Array.isArray(res.data.theses)) {
                setSearchResults(res.data.theses);
                if (res.data.theses.length > 0) {
                    showSnackbar(`Found ${res.data.theses.length} results for "${query}"`, 'success');
                } else {
                    showSnackbar(`No results found for "${query}"`, 'info');
                }
            } else {
                console.warn("API response 'theses' is not an array:", res.data.theses);
                setSearchResults([]);
                showSnackbar('Received unexpected data format for search results.', 'warning');
            }
        } catch (err) {
            console.error('Search failed:', err.response ? err.response.data : err.message);
            setError('Failed to fetch search results. Please try again.');
            showSnackbar('Failed to fetch search results.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get('q');

        if (query) {
            setSearchQuery(query);
            fetchSearchResults(query);
        } else {
            setSearchQuery('');
            setSearchResults([]);
            setLoading(false);
            setError('No search query provided.');
            showSnackbar('No search query provided.', 'warning');
        }
    }, [location.search, showSnackbar]); // Removed 'user' from dependency array as it's not needed for public search

    const handleDownloadResultThesis = (filePath, fileName) => {
        const fileUrl = `https://digi-thesis-ai-project.onrender.com/${filePath.replace(/\\/g, '/')}`;
        window.open(fileUrl, '_blank');
        showSnackbar(`Downloading ${fileName}...`, 'info');
    };

    return (
        <div className="container py-5 text-light-custom">
            <h1 className="text-center mb-5 text-light-custom">
                <FontAwesomeIcon icon={faSearch} className="me-3" /> Search Results
            </h1>

            <div className="card p-4 shadow-lg mb-4 dark-card-section">
                <h3 className="mb-3 text-primary-custom">
                    Query: <span className="text-secondary-custom">{searchQuery || 'N/A'}</span>
                </h3>
                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center py-5 min-h-250px">
                        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary-custom" />
                        <p className="ms-3 text-muted-custom">Loading search results...</p>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger text-center">
                        <FontAwesomeIcon icon={faExclamationCircle} className="me-2" /> {error}
                    </div>
                ) : searchResults.length === 0 ? (
                    <div className="text-center text-muted-custom py-5">
                        <p className="lead">No results found for "{searchQuery}".</p>
                        <p>Try a different keyword or check your spelling.</p>
                    </div>
                ) : (
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        {searchResults.map(thesis => (
                            <div className="col" key={thesis._id}>
                                <ThesisCard thesis={thesis} onDownload={handleDownloadResultThesis} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResultsPage;
