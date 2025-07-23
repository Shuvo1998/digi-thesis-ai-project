// frontend/src/pages/HomePage.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faHome } from '@fortawesome/free-solid-svg-icons';

// You might import a motion component if using Framer Motion
// import { motion } from 'framer-motion';

const HomePage = () => {
    return (
        <div className="homepage-container text-center py-5">
            {/* Hero Section */}
            <section className="hero-section mb-5">
                {/* Example: A div for animated background elements */}
                <div className="animated-background-elements">
                    {/* These would be divs or SVGs with CSS animations */}
                    {/* <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="floating-element-1"></motion.div> */}
                    {/* <motion.div animate={{ x: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 7 }} className="floating-element-2"></motion.div> */}
                </div>

                <h1 className="display-4 fw-bold mb-3">
                    Build and analyze your Thesis <br /> on a <span className="text-success">Single, Collaborative Platform</span>
                </h1>
                <p className="lead mb-4">
                    Streamline your research, detect plagiarism, and enhance grammar with AI-powered tools.
                </p>

                <div className="d-flex justify-content-center gap-3">
                    <input
                        type="email"
                        className="form-control w-25"
                        placeholder="Enter your university email"
                    />
                    <button className="btn btn-success btn-lg">
                        <FontAwesomeIcon icon={faRocket} className="me-2" /> Get Started Now
                    </button>
                    {/* Add another button like "Explore Features" or "Try AI Demo" */}
                </div>
            </section>

            {/* Placeholder for other sections */}
            <section className="features-section py-5 bg-light">
                <h2 className="mb-4">Key Features</h2>
                <div className="row justify-content-center">
                    <div className="col-md-3">
                        <div className="card p-3 mb-3">
                            <FontAwesomeIcon icon={faHome} size="3x" className="mb-3" />
                            <h4>Plagiarism Check</h4>
                            <p>Ensure originality with advanced AI detection.</p>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card p-3 mb-3">
                            <FontAwesomeIcon icon={faHome} size="3x" className="mb-3" />
                            <h4>Grammar Correction</h4>
                            <p>Improve your writing with intelligent suggestions.</p>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card p-3 mb-3">
                            <FontAwesomeIcon icon={faHome} size="3x" className="mb-3" />
                            <h4>Thesis Management</h4>
                            <p>Organize and track your research progress.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Further sections: Testimonials, CTA, etc. */}
        </div>
    );
};

export default HomePage;