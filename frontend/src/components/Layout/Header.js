// frontend/src/components/Layout/Header.js
import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBookOpenReader, faUserPlus, faSignInAlt, faSignOutAlt, faUpload,
    faTachometerAlt, faSearch, faClipboardList, faUserCircle, faTimesCircle,
    faSun, faMoon
} from '@fortawesome/free-solid-svg-icons';

const Header = () => {
    const { user, logoutUser, isDarkMode, toggleDarkMode } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');

    const navbarCollapseRef = useRef(null);
    const navbarTogglerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const isNavbarOpen = navbarCollapseRef.current && navbarCollapseRef.current.classList.contains('show');

            if (
                isNavbarOpen &&
                navbarCollapseRef.current &&
                !navbarCollapseRef.current.contains(event.target) &&
                navbarTogglerRef.current &&
                !navbarTogglerRef.current.contains(event.target)
            ) {
                if (navbarTogglerRef.current) {
                    navbarTogglerRef.current.click();
                }
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        // Adjusted classes for dark mode support
        <nav className="navbar navbar-expand-lg py-3 sticky-top 
                        bg-white text-gray-800 shadow-md 
                        dark:bg-gray-900 dark:text-gray-100 dark:shadow-lg
                        transition-colors duration-300 ease-in-out">
            <div className="container-fluid">
                <Link className={`navbar-brand d-flex align-items-center fw-bold fs-4 
                                ${isActive('/') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-100'} 
                                transition-colors duration-300`} to="/">
                    <FontAwesomeIcon icon={faBookOpenReader} size="2x" className="me-2 brand-icon" />
                    <span>DigiThesis AI</span>
                </Link>

                <button
                    ref={navbarTogglerRef}
                    className="navbar-toggler border border-gray-400 dark:border-gray-600" // Adjust toggler border
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon dark:filter dark:invert"></span> {/* Invert icon for dark mode */}
                </button>

                <div
                    ref={navbarCollapseRef}
                    className="collapse navbar-collapse ms-auto"
                    id="navbarNav"
                >
                    <form className="d-flex my-2 my-lg-0 me-lg-3" role="search" onSubmit={handleSearchSubmit}>
                        <div className="input-group search-input-group">
                            <input
                                className="form-control 
                                           bg-gray-100 text-gray-800 border-gray-300 
                                           dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 
                                           navbar-search-input"
                                type="search"
                                placeholder="Search thesis..."
                                aria-label="Search"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="btn clear-search-btn 
                                               text-gray-600 dark:text-gray-300" // Clear button icon color
                                    onClick={handleClearSearch}
                                    aria-label="Clear search"
                                >
                                    <FontAwesomeIcon icon={faTimesCircle} />
                                </button>
                            )}
                            <button className="btn btn-outline-primary 
                                           text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white 
                                           dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-400 dark:hover:text-gray-900 
                                           input-group-text" type="submit">
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                        </div>
                    </form>

                    <ul className="navbar-nav mb-2 mb-lg-0 align-items-lg-center">
                        {/* Theme Toggle Button */}
                        <li className="nav-item me-lg-2">
                            <button
                                onClick={toggleDarkMode}
                                // Adjusted classes for the button itself
                                className="btn btn-outline-secondary d-flex align-items-center justify-content-center 
                                           text-gray-700 border-gray-400 hover:bg-gray-200 
                                           dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 
                                           transition-colors duration-300"
                                aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                            >
                                <FontAwesomeIcon
                                    icon={isDarkMode ? faSun : faMoon}
                                    className={isDarkMode ? 'text-yellow-400' : 'text-indigo-600'} // Changed Moon icon color for light mode
                                    size="lg"
                                />
                            </button>
                        </li>

                        {user ? (
                            <>
                                <li className="nav-item">
                                    <Link className={`nav-link 
                                                    ${isActive('/dashboard') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-100'} 
                                                    transition-colors duration-300`} to="/dashboard">
                                        <FontAwesomeIcon icon={faTachometerAlt} className="me-1" /> Dashboard
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`nav-link 
                                                    ${isActive('/upload-thesis') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-100'} 
                                                    transition-colors duration-300`} to="/upload-thesis">
                                        <FontAwesomeIcon icon={faUpload} className="me-1" /> Upload Thesis
                                    </Link>
                                </li>
                                {(user.role === 'admin' || user.role === 'supervisor') && (
                                    <li className="nav-item">
                                        <Link className={`nav-link 
                                                        ${isActive('/admin-dashboard') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-100'} 
                                                        transition-colors duration-300`} to="/admin-dashboard">
                                            <FontAwesomeIcon icon={faClipboardList} className="me-1" /> Admin Dashboard
                                        </Link>
                                    </li>
                                )}
                                <li className="nav-item d-flex align-items-center me-lg-2">
                                    <FontAwesomeIcon icon={faUserCircle} className="me-1 
                                                     text-gray-800 dark:text-gray-100" /> {/* Adjust icon color */}
                                    <span className="navbar-text 
                                                     text-gray-800 dark:text-gray-100"> {/* Adjust text color */}
                                        {user.username || user.email}
                                    </span>
                                </li>
                                <li className="nav-item ms-lg-1">
                                    <button className="btn btn-outline-primary 
                                           text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white 
                                           dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-400 dark:hover:text-gray-900" onClick={handleLogout}>
                                        <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className={`btn btn-outline-primary 
                                                    text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white 
                                                    dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-400 dark:hover:text-gray-900 
                                                    ${isActive('/login') ? 'active-btn' : ''}`} to="/login">
                                        <FontAwesomeIcon icon={faSignInAlt} className="me-2" /> Login
                                    </Link>
                                </li>
                                <li className="nav-item ms-lg-2">
                                    <Link className={`btn btn-success 
                                                    bg-green-600 hover:bg-green-700 text-white 
                                                    dark:bg-green-700 dark:hover:bg-green-600 dark:text-gray-100 
                                                    ${isActive('/register') ? 'active-btn' : ''}`} to="/register">
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
