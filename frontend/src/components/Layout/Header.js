// frontend/src/components/Layout/Header.js
import React, { useState, useEffect, useRef, useContext } from 'react'; // Import useState, useEffect, useRef
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faRocket, faSignInAlt, faUserPlus, faSignOutAlt, faTachometerAlt } from '@fortawesome/free-solid-svg-icons';

import { UserContext } from '../../context/UserContext';

const Header = () => {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    // State to manage navbar collapse visibility
    const [isNavOpen, setIsNavOpen] = useState(false); // New state for navbar open/close

    // Refs for the navbar collapse div and the toggler button
    const navCollapseRef = useRef(null);
    const navTogglerRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsNavOpen(false); // Close navbar on logout
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        console.log('Searching for:', searchQuery);
        setIsNavOpen(false); // Close navbar after search
        // navigate(`/search?q=${searchQuery}`);
    };

    // Function to toggle navbar state
    const toggleNavbar = () => {
        setIsNavOpen(prev => !prev);
    };

    // useEffect to handle clicks outside the navbar
    useEffect(() => {
        const handleClickOutside = (event) => {
            // If the navbar is open AND
            // the click is not on the navbar collapse element AND
            // the click is not on the toggler button
            if (isNavOpen &&
                navCollapseRef.current && !navCollapseRef.current.contains(event.target) &&
                navTogglerRef.current && !navTogglerRef.current.contains(event.target)) {
                setIsNavOpen(false); // Close the navbar
            }
        };

        // Add event listener when the navbar is open
        if (isNavOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Cleanup function: remove event listener when component unmounts or navbar closes
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isNavOpen]); // Re-run effect when isNavOpen changes


    return (
        <header className="navbar navbar-expand-lg navbar-dark bg-transparent py-3">
            <div className="container-fluid">
                {/* Brand/Logo */}
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <FontAwesomeIcon icon={faRocket} className="me-2 fa-2x brand-icon" />
                    <span className="fw-bold fs-4">DigiThesis AI</span>
                </Link>

                {/* Navbar Toggler for mobile */}
                <button
                    ref={navTogglerRef} // Attach ref to the toggler button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse" // Keep these for Bootstrap's visual class toggling
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded={isNavOpen} // Control aria-expanded based on state
                    aria-label="Toggle navigation"
                    onClick={toggleNavbar} // Use our custom toggle function
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Navbar Links and Search */}
                {/* Control 'show' class based on isNavOpen state */}
                <div
                    ref={navCollapseRef} // Attach ref to the collapsible div
                    className={`collapse navbar-collapse ${isNavOpen ? 'show' : ''}`}
                    id="navbarNav"
                >
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
                        {/* Search Bar */}
                        <li className="nav-item me-3">
                            <form className="d-flex" onSubmit={handleSearchSubmit}>
                                <input
                                    className="form-control me-2 navbar-search-input"
                                    type="search"
                                    placeholder="Search thesis..."
                                    aria-label="Search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button className="btn btn-outline-light" type="submit">
                                    <FontAwesomeIcon icon={faSearch} />
                                </button>
                            </form>
                        </li>

                        {/* Conditional Navigation Links */}
                        {!user ? ( // If user is NOT logged in
                            <>
                                <li className="nav-item me-2">
                                    <Link className="btn btn-outline-light" to="/login" onClick={() => setIsNavOpen(false)}> {/* Close on click */}
                                        <FontAwesomeIcon icon={faSignInAlt} className="me-2" /> Login
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="btn btn-success" to="/register" onClick={() => setIsNavOpen(false)}> {/* Close on click */}
                                        <FontAwesomeIcon icon={faUserPlus} className="me-2" /> Register
                                    </Link>
                                </li>
                            </>
                        ) : ( // If user IS logged in
                            <>
                                <li className="nav-item me-2">
                                    <Link className="btn btn-outline-light" to="/dashboard" onClick={() => setIsNavOpen(false)}> {/* Close on click */}
                                        <FontAwesomeIcon icon={faTachometerAlt} className="me-2" /> Dashboard
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-danger" onClick={handleLogout}>
                                        <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Logout ({user.username || user.email})
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </header>
    );
};

export default Header;