import React, { useState } from 'react'; // Import useState for local component state
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faUserPlus, faSignInAlt, faSearch } from '@fortawesome/free-solid-svg-icons'; // Import faSearch

const Header = () => {
    const [searchQuery, setSearchQuery] = useState(''); // State for the search input

    const handleSearchSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission
        if (searchQuery.trim()) {
            console.log('Searching for:', searchQuery);
            // In Phase 7, Step 2, this will navigate to /submissions?q=searchQuery 
            // navigate(`/submissions?q=${searchQuery}`);
        }
    };

    return (
        <header>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                    {/* Brand Icon/Link - Left */}
                    <Link className="navbar-brand" to="/">
                        <FontAwesomeIcon icon={faGraduationCap} className="me-2" /> DigiThesis AI
                    </Link>

                    {/* Toggler for responsive navbar */}
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Navigation Links and Search - Right */}
                    <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                        {/* Search Form */}
                        <form className="d-flex my-2 my-lg-0 me-3" onSubmit={handleSearchSubmit}> {/* me-3 adds margin to the right */}
                            <div className="input-group">
                                <span className="input-group-text bg-secondary border-secondary text-white">
                                    <FontAwesomeIcon icon={faSearch} />
                                </span>
                                <input
                                    type="search"
                                    className="form-control bg-dark text-white border-secondary"
                                    placeholder="Search or jump to..."
                                    aria-label="Search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </form>

                        {/* Authentication Links */}
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <Link className="nav-link" to="/register">
                                    <FontAwesomeIcon icon={faUserPlus} className="me-1" /> Register
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/login">
                                    <FontAwesomeIcon icon={faSignInAlt} className="me-1" /> Login
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;