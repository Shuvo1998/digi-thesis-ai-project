// frontend/src/components/Layout/Header.js
import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBookOpenReader, faUserPlus, faSignInAlt, faSignOutAlt, faUpload,
    faTachometerAlt, faSearch, faClipboardList, faUserCircle, faTimesCircle,
    faSun, faMoon // Import sun and moon icons for theme toggle
} from '@fortawesome/free-solid-svg-icons';

const Header = () => {
    const { user, logoutUser, isDarkMode, toggleDarkMode } = useContext(UserContext); // Destructure isDarkMode and toggleDarkMode
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
            setSearchQuery(''); // Clear search query after submission
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
        <nav className="navbar navbar-expand-lg navbar-dark bg-transparent py-3 sticky-top">
            <div className="container-fluid">
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
                        <div className="input-group search-input-group">
                            <input
                                className="form-control navbar-search-input"
                                type="search"
                                placeholder="Search thesis..."
                                aria-label="Search"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="btn clear-search-btn"
                                    onClick={handleClearSearch}
                                    aria-label="Clear search"
                                >
                                    <FontAwesomeIcon icon={faTimesCircle} />
                                </button>
                            )}
                            <button className="btn btn-outline-light input-group-text" type="submit">
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                        </div>
                    </form>

                    <ul className="navbar-nav mb-2 mb-lg-0 align-items-lg-center">
                        {/* Theme Toggle Button */}
                        <li className="nav-item me-lg-2">
                            <button
                                onClick={toggleDarkMode}
                                className="btn btn-outline-light d-flex align-items-center justify-content-center"
                                aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                                style={{ width: '40px', height: '40px', borderRadius: '50%' }} // Basic circle button
                            >
                                <FontAwesomeIcon
                                    icon={isDarkMode ? faSun : faMoon}
                                    className={isDarkMode ? 'text-yellow-400' : 'text-gray-700'} // Tailwind colors for icons
                                    size="lg"
                                />
                            </button>
                        </li>

                        {user ? (
                            <>
                                <li className="nav-item">
                                    <Link className={`nav-link text-white ${isActive('/dashboard') ? 'active' : ''}`} to="/dashboard">
                                        <FontAwesomeIcon icon={faTachometerAlt} className="me-1" /> Dashboard
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`nav-link text-white ${isActive('/upload-thesis') ? 'active' : ''}`} to="/upload-thesis">
                                        <FontAwesomeIcon icon={faUpload} className="me-1" /> Upload Thesis
                                    </Link>
                                </li>
                                {(user.role === 'admin' || user.role === 'supervisor') && (
                                    <li className="nav-item">
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
                                    <Link className={`btn btn-outline-light ${isActive('/login') ? 'active-btn' : ''}`} to="/login">
                                        <FontAwesomeIcon icon={faSignInAlt} className="me-2" /> Login
                                    </Link>
                                </li>
                                <li className="nav-item ms-lg-2">
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
