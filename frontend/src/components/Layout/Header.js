// frontend/src/components/Layout/Header.js
import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBookOpenReader, faUserPlus, faSignInAlt, faSignOutAlt, faUpload,
    faTachometerAlt, faSearch, faClipboardList, faUserCircle, faTimesCircle
} from '@fortawesome/free-solid-svg-icons';

const Header = () => {
    // CRITICAL FIX: Destructure logoutUser instead of logout
    const { user, logoutUser } = useContext(UserContext);
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
        // CRITICAL FIX: Call logoutUser from context
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
        // Changed navbar background to a dark shade, added padding
        <nav className="navbar navbar-expand-lg navbar-dark bg-gray-800 py-4 sticky-top shadow-md">
            <div className="container-fluid max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> {/* Added max-width and padding */}
                <Link className={`navbar-brand flex items-center ${isActive('/') ? 'text-blue-400' : 'text-gray-100'}`} to="/"> {/* Adjusted text colors */}
                    <FontAwesomeIcon icon={faBookOpenReader} size="2x" className="mr-2 text-blue-400" /> {/* Adjusted icon color */}
                    <span className="font-bold text-2xl sm:text-3xl">DigiThesis AI</span> {/* Adjusted font size */}
                </Link>

                <button
                    ref={navbarTogglerRef}
                    className="navbar-toggler focus:outline-none focus:ring-2 focus:ring-blue-500" // Tailwind focus ring
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
                    className="collapse navbar-collapse lg:justify-end" // Adjusted alignment for larger screens
                    id="navbarNav"
                >
                    <form className="flex my-2 lg:my-0 lg:mr-3 w-full lg:w-auto" role="search" onSubmit={handleSearchSubmit}> {/* Flexbox for search */}
                        <div className="relative flex-grow"> {/* Relative for absolute positioning of clear button */}
                            <input
                                className="form-control px-4 py-2 rounded-md border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" // Dark theme input
                                type="search"
                                placeholder="Search thesis..."
                                aria-label="Search"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none" // Positioning and dark theme colors
                                    onClick={handleClearSearch}
                                    aria-label="Clear search"
                                >
                                    <FontAwesomeIcon icon={faTimesCircle} />
                                </button>
                            )}
                            <button className="absolute right-0 top-0 h-full px-3 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition duration-200 flex items-center justify-center" type="submit"> {/* Positioning and dark theme colors */}
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                        </div>
                    </form>

                    <ul className="navbar-nav flex flex-col lg:flex-row lg:items-center lg:space-x-4 mt-2 lg:mt-0"> {/* Flexbox for nav items */}
                        {user ? (
                            <>
                                <li className="nav-item">
                                    <Link className={`nav-link px-3 py-2 rounded-md text-gray-200 hover:bg-gray-700 transition duration-200 ${isActive('/dashboard') ? 'bg-gray-700 text-white' : ''}`} to="/dashboard"> {/* Dark theme nav link */}
                                        <FontAwesomeIcon icon={faTachometerAlt} className="mr-2" /> Dashboard
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`nav-link px-3 py-2 rounded-md text-gray-200 hover:bg-gray-700 transition duration-200 ${isActive('/upload-thesis') ? 'bg-gray-700 text-white' : ''}`} to="/upload-thesis"> {/* Dark theme nav link */}
                                        <FontAwesomeIcon icon={faUpload} className="mr-2" /> Upload Thesis
                                    </Link>
                                </li>
                                {(user.role === 'admin' || user.role === 'supervisor') && (
                                    <li className="nav-item">
                                        <Link className={`nav-link px-3 py-2 rounded-md text-gray-200 hover:bg-gray-700 transition duration-200 ${isActive('/admin-dashboard') ? 'bg-gray-700 text-white' : ''}`} to="/admin-dashboard"> {/* Dark theme nav link */}
                                            <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Admin Dashboard
                                        </Link>
                                    </li>
                                )}
                                <li className="nav-item flex items-center px-3 py-2 text-gray-200"> {/* Dark theme text */}
                                    <FontAwesomeIcon icon={faUserCircle} className="mr-2 text-blue-400" /> {/* Adjusted icon color */}
                                    <span className="font-semibold">
                                        {user.username || user.email}
                                    </span>
                                </li>
                                <li className="nav-item">
                                    <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 w-full lg:w-auto" onClick={handleLogout}> {/* Dark theme logout button */}
                                        <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 ${isActive('/login') ? 'bg-blue-700' : ''}`} to="/login"> {/* Dark theme button link */}
                                        <FontAwesomeIcon icon={faSignInAlt} className="mr-2" /> Login
                                    </Link>
                                </li>
                                <li className="nav-item lg:ml-2 mt-2 lg:mt-0"> {/* Added margin for spacing */}
                                    <Link className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 ${isActive('/register') ? 'bg-green-700' : ''}`} to="/register"> {/* Dark theme button link */}
                                        <FontAwesomeIcon icon={faUserPlus} className="mr-2" /> Register
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
