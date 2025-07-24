// frontend/src/components/Layout/Header.js
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpenReader, faUserPlus, faSignInAlt, faSignOutAlt, faUpload, faTachometerAlt, faSearch, faClipboardList, faUserCircle } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // UPDATED: Use the live Render backend URL for search
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-transparent py-3 sticky-top">
            <div className="container-fluid">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <FontAwesomeIcon icon={faBookOpenReader} size="2x" className="me-2 brand-icon" />
                    <span className="fw-bold fs-4">DigiThesis AI</span>
                </Link>

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

                <div className="collapse navbar-collapse ms-auto" id="navbarNav">

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
                                    <Link className="nav-link text-white" to="/dashboard">
                                        <FontAwesomeIcon icon={faTachometerAlt} className="me-1" /> Dashboard
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/upload-thesis">
                                        <FontAwesomeIcon icon={faUpload} className="me-1" /> Upload Thesis
                                    </Link>
                                </li>
                                {(user.role === 'admin' || user.role === 'supervisor') && (
                                    <li className="nav-item">
                                        <Link className="nav-link text-white" to="/admin-dashboard">
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
                                    <Link className="btn btn-outline-light" to="/login">
                                        <FontAwesomeIcon icon={faSignInAlt} className="me-2" /> Login
                                    </Link>
                                </li>
                                <li className="nav-item ms-lg-2">
                                    <Link className="btn btn-success" to="/register">
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
