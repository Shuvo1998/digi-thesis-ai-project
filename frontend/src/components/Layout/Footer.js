// frontend/src/components/Layout/Footer.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons'; // Example icon for footer

const Footer = () => {
    return (
        <footer className="footer bg-dark text-white-50 py-3 mt-auto"> {/* mt-auto pushes it to the bottom */}
            <div className="container text-center">
                {/* REMOVED: text-muted class */}
                <span className="text-white"> {/* Changed to text-white for clear visibility */}
                    &copy; {new Date().getFullYear()} DigiThesis AI. All rights reserved. Made with <FontAwesomeIcon icon={faHeart} className="text-danger" />
                </span>
            </div>
        </footer>
    );
};

export default Footer;