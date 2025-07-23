// frontend/src/components/Layout/Header.js
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch, faSignInAlt, faUserPlus, faSignOutAlt,
    faHome, faUserCircle, faGraduationCap, faTasks
} from '@fortawesome/free-solid-svg-icons';

import { UserContext } from '../../context/UserContext';

const Header = () => {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isNavOpen, setIsNavOpen] = useState(false);

    const navCollapseRef = useRef(null);
    const navTogglerRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsNavOpen(false);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        console.log('Searching for:', searchQuery);
        setIsNavOpen(false);
        // Future: navigate(`/search?q=${searchQuery}`);
    };

    const toggleNavbar = () => {
        setIsNavOpen(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isNavOpen &&
                navCollapseRef.current && !navCollapseRef.current.contains(event.target) &&
                navTogglerRef.current && !navTogglerRef.current.contains(event.target)) {
                setIsNavOpen(false);
            }
        };

        if (isNavOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isNavOpen]);


    return (
        <header className="navbar navbar-expand-lg navbar-dark bg-transparent py-3">
            <div className="container-fluid">
                <Link className="navbar-brand d-flex align-items-center" to="/" onClick={() => setIsNavOpen(false)}>
                    <FontAwesomeIcon icon={faGraduationCap} className="me-2 fa-2x brand-icon" />
                    <span className="fw-bold fs-4">DigiThesis AI</span>
                </Link>

                <button
                    ref={navTogglerRef}
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded={isNavOpen}
                    aria-label="Toggle navigation"
                    onClick={toggleNavbar}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div
                    ref={navCollapseRef}
                    className={`collapse navbar-collapse ${isNavOpen ? 'show' : ''}`}
                    id="navbarNav"
                >
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
                        {/* Home Link (removed as per previous request) */}

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
                        {!user ? (
                            <>
                                <li className="nav-item me-2">
                                    <Link className="btn btn-outline-light" to="/login" onClick={() => setIsNavOpen(false)}>
                                        <FontAwesomeIcon icon={faSignInAlt} className="me-2" /> Login
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="btn btn-success" to="/register" onClick={() => setIsNavOpen(false)}>
                                        <FontAwesomeIcon icon={faUserPlus} className="me-2" /> Register
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item me-2">
                                    <Link className="btn btn-outline-light" to="/dashboard" onClick={() => setIsNavOpen(false)}>
                                        <FontAwesomeIcon icon={faUserCircle} className="me-2" /> My Theses
                                    </Link>
                                </li>
                                {(user.role === 'admin' || user.role === 'supervisor') && (
                                    <li className="nav-item me-2">
                                        <Link className="btn btn-outline-info" to="/admin-dashboard" onClick={() => setIsNavOpen(false)}>
                                            <FontAwesomeIcon icon={faTasks} className="me-2" /> Admin Dashboard
                                        </Link>
                                    </li>
                                )}
                                <li className="nav-item">
                                    <button className="btn btn-danger" onClick={handleLogout}>
                                        <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Logout ({user.username || user.email}) {/* RE-ADDED USER INFO */}
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
