// frontend/src/components/Layout/Header.js
import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpenReader, faUserPlus, faSignInAlt, faSignOutAlt, faUpload, faTachometerAlt, faSearch, faClipboardList, faUserCircle } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isNavOpen, setIsNavOpen] = useState(false);
    const navbarRef = useRef(null);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
        if (window.innerWidth < 992) {
            setIsNavOpen(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        if (window.innerWidth < 992) {
            setIsNavOpen(false);
        }
    };

    const toggleNavbar = () => {
        setIsNavOpen(!isNavOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isNavOpen && navbarRef.current && !navbarRef.current.contains(event.target)) {
                setIsNavOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isNavOpen]);

    const handleNavLinkClick = () => {
        if (window.innerWidth < 992) {
            setIsNavOpen(false);
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-transparent py-3 sticky-top" ref={navbarRef}>
            <div className="container-fluid">
                {/* Brand Logo and Name */}
                <Link className="navbar-brand d-flex align-items-center" to="/" onClick={handleNavLinkClick}>
                    <FontAwesomeIcon icon={faBookOpenReader} size="2x" className="me-2 brand-icon" />
                    <span className="fw-bold fs-4">DigiThesis AI</span>
                </Link>

                {/* Navbar Toggler for Mobile */}
                <button
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

                {/* Navbar Links and Search - PUSHED TO RIGHT */}
                <div className={`collapse navbar-collapse ms-auto ${isNavOpen ? 'show' : ''}`} id="navbarNav">

                    {/* Search Form - Placed FIRST within the right-aligned group */}
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

                    {/* Navigation Links - Placed AFTER search form within the right-aligned group */}
                    <ul className="navbar-nav mb-2 mb-lg-0 align-items-lg-center">
                        {/* Conditional Links based on Authentication */}
                        {user ? (
                            <>
                                {/* My Profile Link - ADDED */}
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/profile" onClick={handleNavLinkClick}>
                                        <FontAwesomeIcon icon={faUserCircle} className="me-1" /> My Profile
                                    </Link>
                                </li>
                                {/* Dashboard Link */}
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/dashboard" onClick={handleNavLinkClick}>
                                        <FontAwesomeIcon icon={faTachometerAlt} className="me-1" /> Dashboard
                                    </Link>
                                </li>
                                {/* Upload Thesis Link */}
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/upload-thesis" onClick={handleNavLinkClick}>
                                        <FontAwesomeIcon icon={faUpload} className="me-1" /> Upload Thesis
                                    </Link>
                                </li>
                                {/* Admin Dashboard Link (Conditional by Role) */}
                                {(user.role === 'admin' || user.role === 'supervisor') && (
                                    <li className="nav-item">
                                        <Link className="nav-link text-white" to="/admin-dashboard" onClick={handleNavLinkClick}>
                                            <FontAwesomeIcon icon={faClipboardList} className="me-1" /> Admin Dashboard
                                        </Link>
                                    </li>
                                )}
                                {/* Display Username/Email */}
                                <li className="nav-item d-flex align-items-center me-lg-2">
                                    <FontAwesomeIcon icon={faUserCircle} className="me-1 text-white" />
                                    <span className="navbar-text text-white">
                                        {user.username || user.email}
                                    </span>
                                </li>
                                {/* Logout Button */}
                                <li className="nav-item ms-lg-1">
                                    <button className="btn btn-outline-light" onClick={handleLogout}>
                                        <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                {/* Login Link - Matches image "Sign in" button style */}
                                <li className="nav-item">
                                    <Link className="btn btn-outline-light" to="/login" onClick={handleNavLinkClick}>
                                        <FontAwesomeIcon icon={faSignInAlt} className="me-2" /> Login
                                    </Link>
                                </li>
                                {/* Register Link - Matches image "Sign up" button style */}
                                <li className="nav-item ms-lg-2">
                                    <Link className="btn btn-success" to="/register" onClick={handleNavLinkClick}>
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
