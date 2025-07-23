// frontend/src/pages/HomePage.js
import React, { useState, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faHome, faFileUpload } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { UserContext } from '../context/UserContext';
import Snackbar from '../components/Common/Snackbar'; // <-- IMPORT SNACKBAR

const HomePage = () => {
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const { user, loading } = useContext(UserContext);

    // ADDED: State for Snackbar
    const [snackbar, setSnackbar] = useState({
        show: false,
        message: '',
        type: 'info',
    });

    // Handler to close Snackbar
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, show: false });
    };

    const handleUploadClick = () => {
        if (!user) {
            // Replaced alert with Snackbar
            setSnackbar({
                show: true,
                message: 'Please log in to upload your thesis.',
                type: 'error',
            });
            // Delay navigation slightly to allow snackbar to be seen
            setTimeout(() => {
                navigate('/login');
            }, snackbar.duration || 3000); // Use snackbar's default duration or specify
        } else {
            navigate('/upload-thesis');
        }
    };

    // Define some animation variants for Framer Motion
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.5,
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10
            }
        }
    };

    const buttonVariants = {
        hover: {
            scale: 1.05,
            boxShadow: "0px 0px 8px rgba(255,255,255,0.5)",
            transition: {
                duration: 0.3,
                yoyo: Infinity
            }
        }
    };

    // Variants for a continuously animating background element
    const floatingElementVariants = {
        animate: {
            y: ["0%", "5%", "-5%", "0%"],
            x: ["0%", "2%", "-2%", "0%"],
            rotate: [0, 5, -5, 0],
            scale: [1, 1.02, 0.98, 1],
            transition: {
                duration: 8,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "mirror"
            }
        }
    };

    return (
        <div className="homepage-container text-center py-5">
            {/* Snackbar Component */}
            <Snackbar
                message={snackbar.message}
                type={snackbar.type}
                show={snackbar.show}
                onClose={handleCloseSnackbar}
            />

            {/* Hero Section */}
            <section className="hero-section mb-5">
                {/* Animated Background Elements */}
                <motion.div
                    className="animated-blob"
                    variants={floatingElementVariants}
                    animate="animate"
                    style={{
                        position: 'absolute',
                        top: '10%',
                        left: '10%',
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        filter: 'blur(50px)',
                        zIndex: 0
                    }}
                ></motion.div>
                <motion.div
                    className="animated-blob"
                    variants={floatingElementVariants}
                    animate="animate"
                    style={{
                        position: 'absolute',
                        bottom: '15%',
                        right: '15%',
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.08)',
                        filter: 'blur(60px)',
                        zIndex: 0,
                        animationDelay: '2s'
                    }}
                ></motion.div>


                {/* Content with z-index to stay above background elements */}
                <div style={{ position: 'relative', zIndex: 1 }}>

                    {/* Animate the main heading */}
                    <motion.h1
                        className="display-4 fw-bold mb-3"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        Build and analyze your Thesis <br /> on a <span className="text-success">Single, Collaborative Platform</span>
                    </motion.h1>

                    {/* Animate the lead paragraph */}
                    <motion.p
                        className="lead mb-4"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        Streamline your research, detect plagiarism, and enhance grammar with AI-powered tools.
                    </motion.p>

                    {/* UPDATED: Thesis Upload Call to Action - now only a button */}
                    <motion.div
                        className="d-flex justify-content-center gap-3 align-items-center"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Button now always triggers the redirect logic */}
                        <motion.button
                            className="btn btn-primary btn-lg"
                            onClick={handleUploadClick} // This will now trigger the snackbar and redirect
                            variants={itemVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <FontAwesomeIcon icon={faFileUpload} className="me-2" />
                            Upload Your Thesis
                        </motion.button>
                    </motion.div>
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
        </div>
    );
};

export default HomePage;
