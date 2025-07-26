// frontend/src/pages/HomePage.js
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faRocket, faFileUpload, faBookOpen, faSpinner, faUserGraduate,
    faCheckCircle, faPenFancy, faTasks // Specific icons for features
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import ThesisCard from '../components/Thesis/ThesisCard';

const HomePage = () => {
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const { user, loading: userLoading, showSnackbar } = useContext(UserContext);

    const [publicTheses, setPublicTheses] = useState([]);
    const [loadingPublicTheses, setLoadingPublicTheses] = useState(true);
    const [publicThesesError, setPublicThesesError] = useState('');

    const handleUploadClick = () => {
        if (!user) {
            showSnackbar('Please log in to upload your thesis.', 'error');
            setTimeout(() => {
                navigate('/login');
            }, 1000); // Short delay for snackbar visibility
        } else {
            navigate('/upload-thesis');
        }
    };

    const handleDownloadPublicThesis = (filePath, fileName) => {
        const fileUrl = `https://digi-thesis-ai-project.onrender.com/${filePath.replace(/\\/g, '/')}`;
        window.open(fileUrl, '_blank');
        showSnackbar(`Downloading ${fileName}...`, 'info');
    };

    const fetchPublicTheses = async () => {
        try {
            setLoadingPublicTheses(true);
            setPublicThesesError('');
            const res = await axios.get('https://digi-thesis-ai-project.onrender.com/api/theses/public');

            if (Array.isArray(res.data.theses)) {
                setPublicTheses(res.data.theses);
            } else {
                console.warn("API response 'theses' is not an array:", res.data.theses);
                setPublicTheses([]);
                showSnackbar('Received unexpected data format for public theses.', 'warning');
            }
            setLoadingPublicTheses(false);
        } catch (err) {
            console.error('Failed to fetch public theses:', err.response ? err.response.data : err.message);
            setPublicThesesError('Failed to load public submissions. Please try again.');
            setPublicTheses([]);
            showSnackbar('Failed to load public submissions.', 'error');
            setLoadingPublicTheses(false);
        }
    };

    useEffect(() => {
        fetchPublicTheses();
    }, []);

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

    const featureCardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 80,
                damping: 10
            }
        },
        hover: {
            scale: 1.05,
            boxShadow: "0px 10px 20px rgba(0,0,0,0.4)", // Darker shadow for dark theme
            transition: {
                duration: 0.3
            }
        }
    };

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
        <div className="py-5 relative overflow-hidden">
            {/* Animated Blobs - colors adjusted for dark theme */}
            <motion.div
                className="animated-blob"
                variants={floatingElementVariants}
                animate="animate"
                style={{
                    position: 'absolute',
                    top: '5%',
                    left: '15%',
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    background: 'rgba(102, 252, 241, 0.1)', // Lighter alpha for dark theme
                    filter: 'blur(70px)',
                    zIndex: 0
                }}
            ></motion.div>
            <motion.div
                className="animated-blob"
                variants={floatingElementVariants}
                animate="animate"
                style={{
                    position: 'absolute',
                    bottom: '10%',
                    right: '10%',
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    background: 'rgba(255, 165, 0, 0.08)', // Lighter alpha
                    filter: 'blur(70px)',
                    zIndex: 0,
                    animationDelay: '2s'
                }}
            ></motion.div>
            <motion.div
                className="animated-blob"
                variants={floatingElementVariants}
                animate="animate"
                style={{
                    position: 'absolute',
                    top: '30%',
                    right: '20%',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'rgba(147, 112, 219, 0.1)', // Lighter alpha
                    filter: 'blur(70px)',
                    zIndex: 0,
                    animationDelay: '4s'
                }}
            ></motion.div>
            <motion.div
                className="animated-blob"
                variants={floatingElementVariants}
                animate="animate"
                style={{
                    position: 'absolute',
                    bottom: '25%',
                    left: '5%',
                    width: '130px',
                    height: '130px',
                    borderRadius: '50%',
                    background: 'rgba(255, 99, 71, 0.07)', // Lighter alpha
                    filter: 'blur(70px)',
                    zIndex: 0,
                    animationDelay: '6s'
                }}
            ></motion.div>

            <div className="container relative z-10">
                <section className="hero-section mb-5 text-center py-5">
                    <motion.h1
                        className="display-4 fw-bold mb-3 text-light-custom"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        Build and analyze your Thesis <br /> on a <span className="text-primary-custom">Single, Collaborative Platform</span>
                    </motion.h1>

                    <motion.p
                        className="lead mb-4 text-muted-custom"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        Streamline your research, detect plagiarism, and enhance grammar with AI-powered tools.
                    </motion.p>

                    <motion.div
                        className="d-flex justify-content-center gap-3 align-items-center"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.button
                            className="btn btn-primary btn-lg shadow-lg"
                            onClick={handleUploadClick}
                            variants={itemVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <FontAwesomeIcon icon={faFileUpload} className="me-2" />
                            Upload Your Thesis
                        </motion.button>
                    </motion.div>
                </section>

                <section className="public-submissions-section dark-card-section px-4 py-5">
                    <h2 className="mb-4 text-light-custom text-center">
                        <FontAwesomeIcon icon={faBookOpen} className="me-3" /> Latest Approved Theses
                    </h2>
                    {loadingPublicTheses ? (
                        // Added 'd-flex justify-content-center align-items-center min-vh-50' for centering
                        <div className="d-flex flex-column justify-content-center align-items-center py-5 min-h-250px">
                            <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary-custom" />
                            <p className="ms-3 text-muted-custom">Loading public submissions...</p>
                        </div>
                    ) : publicThesesError ? (
                        <div className="alert alert-danger text-center">
                            <strong className="font-bold">Error!</strong>
                            <span className="block sm:inline"> {publicThesesError}</span>
                        </div>
                    ) : publicTheses.length === 0 ? (
                        <div className="text-center text-muted-custom text-lg py-5">
                            <p className="lead">No approved theses to display yet.</p>
                        </div>
                    ) : (
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                            {publicTheses.map((thesis) => (
                                <div className="col" key={thesis._id}>
                                    <ThesisCard
                                        thesis={thesis}
                                        onDownload={handleDownloadPublicThesis}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="features-section dark-card-section px-4 py-5">
                    <h2 className="mb-4 text-light-custom text-center">Key Features</h2>
                    <motion.div
                        className="row justify-content-center g-4"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        {/* Feature Cards remain the same as previous update */}
                        <motion.div className="col-md-4 col-lg-3" variants={featureCardVariants} whileHover="hover">
                            <Link to="/dashboard" className="feature-card-link">
                                <div className="feature-card">
                                    <div className="feature-icon-circle blue-icon">
                                        <FontAwesomeIcon icon={faCheckCircle} size="3x" />
                                    </div>
                                    <h4 className="text-light-custom">Plagiarism Check</h4>
                                    <p className="text-muted-custom">Ensure originality and academic integrity with advanced AI detection.</p>
                                </div>
                            </Link>
                        </motion.div>

                        <motion.div className="col-md-4 col-lg-3" variants={featureCardVariants} whileHover="hover">
                            <Link to="/dashboard" className="feature-card-link">
                                <div className="feature-card">
                                    <div className="feature-icon-circle green-icon">
                                        <FontAwesomeIcon icon={faPenFancy} size="3x" />
                                    </div>
                                    <h4 className="text-light-custom">Grammar Correction</h4>
                                    <p className="text-muted-custom">Refine your writing, improve clarity, and eliminate errors with intelligent suggestions.</p>
                                </div>
                            </Link>
                        </motion.div>

                        <motion.div className="col-md-4 col-lg-3" variants={featureCardVariants} whileHover="hover">
                            <Link to="/dashboard" className="feature-card-link">
                                <div className="feature-card">
                                    <div className="feature-icon-circle purple-icon">
                                        <FontAwesomeIcon icon={faTasks} size="3x" />
                                    </div>
                                    <h4 className="text-light-custom">Thesis Management</h4>
                                    <p className="text-muted-custom">Organize, track, and manage your research progress efficiently in one place.</p>
                                </div>
                            </Link>
                        </motion.div>
                    </motion.div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;
