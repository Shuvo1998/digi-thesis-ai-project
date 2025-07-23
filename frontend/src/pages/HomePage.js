// frontend/src/pages/HomePage.js
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faHome, faFileUpload } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const HomePage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        console.log('Selected file:', event.target.files[0]?.name);
    };

    const handleUploadClick = () => {
        // --- Future Logic Placeholder ---
        // Check if the user is logged in here.
        // Example (requires UserContext):
        // const { user } = useContext(UserContext);
        // if (!user) {
        //   navigate('/login'); // Redirect to login page if not logged in
        //   return;
        // }
        // --- End Future Logic Placeholder ---

        if (selectedFile) {
            // If a file is already selected, proceed with "upload" action
            console.log('Attempting to upload file:', selectedFile.name);
            alert(`Simulating upload of: ${selectedFile.name}. Backend integration comes later!`);
            setSelectedFile(null); // Clear selected file after "upload"
        } else {
            // If no file is selected, open the file dialog
            fileInputRef.current.click();
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
        },
        tap: { scale: 0.95 }
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

                    {/* UPDATED: Thesis Upload/Login Call to Action */}
                    {/* New wrapper for the bordered look */}
                    <motion.div
                        className="upload-thesis-box d-flex flex-column align-items-center justify-content-center p-4 rounded-3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            accept=".pdf,.docx,.doc"
                        />

                        {/* Display selected file name / prompt */}
                        <motion.div
                            className="file-display mb-3"
                            variants={itemVariants}
                        >
                            <p className="text-white mb-1">
                                {selectedFile ? `Selected: ${selectedFile.name}` : "Drag & drop your thesis here, or click to choose file"}
                            </p>
                            {selectedFile && (
                                <small className="text-muted">{selectedFile.size ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ''}</small>
                            )}
                        </motion.div>


                        {/* Button to trigger file selection or initiate upload */}
                        <motion.button
                            className="btn btn-primary btn-lg" // Kept as btn-primary
                            onClick={handleUploadClick}
                            variants={itemVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <FontAwesomeIcon icon={faFileUpload} className="me-2" />
                            Upload Thesis
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