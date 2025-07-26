// frontend/src/pages/SearchResultsPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios'; // Import axios for future API calls
import { UserContext } from '../context/UserContext'; // Import UserContext for snackbar

const SearchResultsPage = () => {
    const location = useLocation();
    const { showSnackbar } = useContext(UserContext); // Get showSnackbar from context

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Parse the query parameter from the URL
        const params = new URLSearchParams(location.search);
        const query = params.get('q'); // Get the value of 'q' parameter

        if (query) {
            setSearchQuery(query);
            // In a real implementation, you would make an API call here
            // to your backend search endpoint, e.g.:
            // fetchSearchResults(query);

            // For now, simulate loading and empty results
            setLoading(true);
            setError('');
            setTimeout(() => {
                setSearchResults([]); // No actual results yet
                setLoading(false);
                if (!query.trim()) {
                    setError('Please enter a valid search query.');
                    showSnackbar('Please enter a valid search query.', 'error');
                } else {
                    showSnackbar(`Displaying results for: "${query}"`, 'info');
                }
            }, 1000); // Simulate network delay
        } else {
            setSearchQuery('');
            setSearchResults([]);
            setLoading(false);
            setError('No search query provided.');
            showSnackbar('No search query provided.', 'warning');
        }
    }, [location.search, showSnackbar]); // Re-run when URL search params change

    // Placeholder for future search API call
    // const fetchSearchResults = async (query) => {
    //     setLoading(true);
    //     setError('');
    //     try {
    //         // Example: const res = await axios.get(`YOUR_BACKEND_URL/api/theses/search?q=${encodeURIComponent(query)}`);
    //         // setSearchResults(res.data.theses);
    //         setSearchResults([]); // Placeholder
    //     } catch (err) {
    //         console.error('Search failed:', err);
    //         setError('Failed to fetch search results. Please try again.');
    //         showSnackbar('Failed to fetch search results.', 'error');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    return (
        <div className="container py-5"> {/* Bootstrap container for centering and padding */}
            <h1 className="text-center mb-5 text-dark"> {/* Bootstrap text-dark for visibility */}
                <FontAwesomeIcon icon={faSearch} className="me-3" /> Search Results
            </h1>

            <div className="card p-4 shadow-lg mb-4"> {/* Bootstrap card styling */}
                <h3 className="mb-3 text-primary"> {/* Bootstrap text-primary */}
                    Query: <span className="text-secondary">{searchQuery || 'N/A'}</span> {/* Bootstrap text-secondary */}
                </h3>
                {loading ? (
                    <div className="text-center py-5">
                        <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-info" /> {/* Bootstrap text-info */}
                        <p className="mt-3 text-muted">Loading search results...</p> {/* Bootstrap text-muted */}
                    </div>
                ) : error ? (
                    <div className="alert alert-danger text-center"> {/* Bootstrap alert-danger */}
                        <FontAwesomeIcon icon={faExclamationCircle} className="me-2" /> {error}
                    </div>
                ) : searchResults.length === 0 ? (
                    <div className="text-center text-muted py-5"> {/* Bootstrap text-muted */}
                        <p className="lead">No results found for "{searchQuery}".</p>
                        <p>Try a different keyword or check your spelling.</p>
                    </div>
                ) : (
                    // In a real implementation, you'd map over searchResults here
                    <div>
                        <p className="text-success">Found {searchResults.length} results.</p> {/* Bootstrap text-success */}
                        {/* Example:
                        <div className="row">
                            {searchResults.map(thesis => (
                                <div className="col-md-4 mb-4" key={thesis._id}>
                                    <ThesisCard thesis={thesis} onDownload={...} />
                                </div>
                            ))}
                        </div>
                        */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResultsPage;
