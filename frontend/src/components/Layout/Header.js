// frontend/src/components/Layout/Header.js
import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import { UserContext } from '../../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpenReader, faUserPlus, faSignInAlt, faSignOutAlt, faUpload, faTachometerAlt, faSearch, faClipboardList, faUserCircle } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation(); // Get current location to determine active link
    const [searchQuery, setSearchQuery] = useState('');

    // Refs for detecting clicks outside the navbar collapse
    const navbarCollapseRef = useRef(null);
    const navbarTogglerRef = useRef(null);

    // Effect to handle clicks outside the collapsed navbar
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the navbar collapse is currently open (has the 'show' class)
            const isNavbarOpen = navbarCollapseRef.current && navbarCollapseRef.current.classList.contains('show');

            // If the navbar is open AND the click is outside the navbar collapse AND outside the toggler button itself
            if (
                isNavbarOpen &&
                navbarCollapseRef.current &&
                !navbarCollapseRef.current.contains(event.target) &&
                navbarTogglerRef.current &&
                !navbarTogglerRef.current.contains(event.target)
            ) {
                // Programmatically close the navbar collapse by simulating a click on the toggler.
                // This leverages Bootstrap's built-in collapse behavior.
                if (navbarTogglerRef.current) {
                    navbarTogglerRef.current.click();
                }
            }
        };

        // Add the event listener when the component mounts
        document.addEventListener('click', handleClickOutside);

        // Clean up the event listener when the component unmounts
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Helper function to determine if a link is active
    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/'; // Exact match for the home path
        }
        // For other paths, check if the current path starts with the link's path
        // This handles cases like /admin-dashboard/users also activating /admin-dashboard
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-transparent py-3 sticky-top">
            <div className="container-fluid">
                {/* Apply active class to brand link if it's the home page */}
                <Link className={`navbar-brand d-flex align-items-center ${isActive('/') ? 'active' : ''}`} to="/">
                    <FontAwesomeIcon icon={faBookOpenReader} size="2x" className="me-2 brand-icon" />
                    <span className="fw-bold fs-4">DigiThesis AI</span>
                </Link>

                <button
                    ref={navbarTogglerRef}
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

                <div
                    ref={navbarCollapseRef}
                    className="collapse navbar-collapse ms-auto"
                    id="navbarNav"
                >
                    <form className="d-flex my-2 my-lg-0 me-lg-3" role="search" onSubmit={handleSearchSubmit}>
                        <div className="input-group">
                            <input
                                className="form-control navbar-search-input"
                                type="search"
                                placeholder="Search thesis..."
                                aria-label="Search"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            <button className="btn btn-outline-light input-group-text" type="submit">
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                        </div>
                    </form>

                    <ul className="navbar-nav mb-2 mb-lg-0 align-items-lg-center">
                        {user ? (
                            <>
                                <li className="nav-item">
                                    {/* Conditionally apply 'active' class */}
                                    <Link className={`nav-link text-white ${isActive('/dashboard') ? 'active' : ''}`} to="/dashboard">
                                        <FontAwesomeIcon icon={faTachometerAlt} className="me-1" /> Dashboard
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    {/* Conditionally apply 'active' class */}
                                    <Link className={`nav-link text-white ${isActive('/upload-thesis') ? 'active' : ''}`} to="/upload-thesis">
                                        <FontAwesomeIcon icon={faUpload} className="me-1" /> Upload Thesis
                                    </Link>
                                </li>
                                {(user.role === 'admin' || user.role === 'supervisor') && (
                                    <li className="nav-item">
                                        {/* Conditionally apply 'active' class */}
                                        <Link className={`nav-link text-white ${isActive('/admin-dashboard') ? 'active' : ''}`} to="/admin-dashboard">
                                            <FontAwesomeIcon icon={faClipboardList} className="me-1" /> Admin Dashboard
                                        </Link>
                                    </li>
                                )}
                                <li className="nav-item d-flex align-items-center me-lg-2">
                                    <FontAwesomeIcon icon={faUserCircle} className="me-1 text-white" />
                                    <span className="navbar-text text-white">
                                        {user.username || user.email}
                                    </span>
                                </li>
                                <li className="nav-item ms-lg-1">
                                    <button className="btn btn-outline-light" onClick={handleLogout}>
                                        <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    {/* For buttons, using 'active-btn' for distinct styling if needed */}
                                    <Link className={`btn btn-outline-light ${isActive('/login') ? 'active-btn' : ''}`} to="/login">
                                        <FontAwesomeIcon icon={faSignInAlt} className="me-2" /> Login
                                    </Link>
                                </li>
                                <li className="nav-item ms-lg-2">
                                    {/* For buttons, using 'active-btn' for distinct styling if needed */}
                                    <Link className={`btn btn-success ${isActive('/register') ? 'active-btn' : ''}`} to="/register">
                                        <FontAwesomeIcon icon={faUserPlus} className="me-1" /> Register
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Header;
