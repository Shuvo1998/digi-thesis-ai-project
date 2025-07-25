// frontend/src/pages/HomePage.js
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faRocket, faHome, faFileUpload, faBookOpen, faSpinner, faUserGraduate,
    faCheckCircle, faPenFancy, faTasks // Specific icons for features
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import axios from 'axios'; // Using global axios instance as per your code
import { UserContext } from '../context/UserContext';
import Snackbar from '../components/Common/Snackbar';
import ThesisCard from '../components/Thesis/ThesisCard';

const HomePage = () => {
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const { user, loading: userLoading } = useContext(UserContext);

    const [snackbar, setSnackbar] = useState({
        show: false,
        message: '',
        type: 'info',
    });

    // Initialize publicTheses as an empty array - this is crucial
    const [publicTheses, setPublicTheses] = useState([]);
    const [loadingPublicTheses, setLoadingPublicTheses] = useState(true);
    const [publicThesesError, setPublicThesesError] = useState('');

    // Helper function to show snackbar messages
    const showSnackbar = (message, type = 'info', duration = 3000) => {
        setSnackbar({ show: true, message, type, duration });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, show: false });
    };

    const handleUploadClick = () => {
        if (!user) {
            showSnackbar('Please log in to upload your thesis.', 'error');
            setTimeout(() => {
                navigate('/login');
            }, snackbar.duration || 3000);
        } else {
            navigate('/upload-thesis');
        }
    };

    const handleDownloadPublicThesis = (filePath, fileName) => {
        // Backend URL is now hardcoded as per your existing code
        const fileUrl = `https://digi-thesis-ai-project.onrender.com/${filePath.replace(/\\/g, '/')}`;
        window.open(fileUrl, '_blank');
        showSnackbar(`Downloading ${fileName}...`, 'info');
    };

    const fetchPublicTheses = async () => {
        try {
            setLoadingPublicTheses(true);
            setPublicThesesError('');
            // Backend URL is now hardcoded as per your existing code
            const res = await axios.get('https://digi-thesis-ai-project.onrender.com/api/theses/public');

            // CRITICAL FIX: Ensure res.data.theses is an array before setting state
            if (Array.isArray(res.data.theses)) {
                setPublicTheses(res.data.theses);
            } else {
                // Fallback to empty array if unexpected data format
                console.warn("API response 'theses' is not an array:", res.data.theses);
                setPublicTheses([]);
                showSnackbar('Received unexpected data format for public theses.', 'warning');
            }
            setLoadingPublicTheses(false);
        } catch (err) {
            console.error('Failed to fetch public theses:', err.response ? err.response.data : err.message);
            setPublicThesesError('Failed to load public submissions. Please try again.');
            setPublicTheses([]); // CRITICAL FIX: Set to empty array on error
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

    // New variants for feature cards
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
            boxShadow: "0px 10px 20px rgba(0,0,0,0.2)",
            transition: {
                duration: 0.3
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
            <Snackbar
                message={snackbar.message}
                type={snackbar.type}
                show={snackbar.show}
                onClose={handleCloseSnackbar}
            />

            <section className="hero-section mb-5" style={{ position: 'relative', overflow: 'hidden' }}> {/* Added relative positioning and overflow hidden */}
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
                        background: 'rgba(102, 252, 241, 0.2)',
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
                        background: 'rgba(255, 165, 0, 0.15)',
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
                        background: 'rgba(147, 112, 219, 0.18)',
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
                        background: 'rgba(255, 99, 71, 0.12)',
                        filter: 'blur(70px)',
                        zIndex: 0,
                        animationDelay: '6s'
                    }}
                ></motion.div>


                <div style={{ position: 'relative', zIndex: 1 }}>

                    <motion.h1
                        className="display-4 fw-bold mb-3"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        Build and analyze your Thesis <br /> on a <span className="text-success">Single, Collaborative Platform</span>
                    </motion.h1>

                    <motion.p
                        className="lead mb-4"
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
                            className="btn btn-primary btn-lg"
                            onClick={handleUploadClick}
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

            <section className="public-submissions-section py-5 bg-light rounded-3 shadow-lg mt-5">
                <h2 className="mb-4 text-dark">
                    <FontAwesomeIcon icon={faBookOpen} className="me-3" /> Latest Approved Theses
                </h2>
                {loadingPublicTheses ? (
                    <div className="d-flex justify-content-center align-items-center py-5">
                        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
                        <p className="ms-3 text-dark">Loading public submissions...</p>
                    </div>
                ) : publicThesesError ? (
                    <div className="alert alert-danger text-center">{publicThesesError}</div>
                ) : (
                    // CRITICAL FIX: Ensure publicTheses is an array before checking length
                    publicTheses && publicTheses.length === 0 ? (
                        <div className="text-center text-muted">
                            <p className="lead">No approved theses to display yet.</p>
                        </div>
                    ) : (
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 px-3">
                            {publicTheses.map((thesis) => (
                                <div className="col" key={thesis._id}>
                                    <ThesisCard
                                        thesis={thesis}
                                        onDownload={handleDownloadPublicThesis}
                                    />
                                </div>
                            ))}
                        </div>
                    )
                )}
            </section>

            <section className="features-section py-5 bg-light mt-5">
                <h2 className="mb-4 text-dark">Key Features</h2>
                <motion.div
                    className="row justify-content-center g-4"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    {/* Plagiarism Check Feature Card (Clickable) */}
                    <motion.div className="col-md-4 col-lg-3" variants={featureCardVariants} whileHover="hover">
                        <Link to="/dashboard" className="feature-card-link"> {/* Link to Dashboard */}
                            <div className="card p-4 h-100">
                                <div className="feature-icon-circle mx-auto mb-3">
                                    <FontAwesomeIcon icon={faCheckCircle} size="3x" />
                                </div>
                                <h4 className="text-dark">Plagiarism Check</h4>
                                <p className="text-muted">Ensure originality and academic integrity with advanced AI detection.</p>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Grammar Correction Feature Card (Clickable) */}
                    <motion.div className="col-md-4 col-lg-3" variants={featureCardVariants} whileHover="hover">
                        <Link to="/dashboard" className="feature-card-link"> {/* Link to Dashboard */}
                            <div className="card p-4 h-100">
                                <div className="feature-icon-circle mx-auto mb-3">
                                    <FontAwesomeIcon icon={faPenFancy} size="3x" />
                                </div>
                                <h4 className="text-dark">Grammar Correction</h4>
                                <p className="text-muted">Refine your writing, improve clarity, and eliminate errors with intelligent suggestions.</p>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Thesis Management Feature Card (Clickable) */}
                    <motion.div className="col-md-4 col-lg-3" variants={featureCardVariants} whileHover="hover">
                        <Link to="/dashboard" className="feature-card-link"> {/* Link to Dashboard */}
                            <div className="card p-4 h-100">
                                <div className="feature-icon-circle mx-auto mb-3">
                                    <FontAwesomeIcon icon={faTasks} size="3x" />
                                </div>
                                <h4 className="text-dark">Thesis Management</h4>
                                <p className="text-muted">Organize, track, and manage your research progress efficiently in one place.</p>
                            </div>
                        </Link>
                    </motion.div>
                </motion.div>
            </section>
        </div>
    );
};

export default HomePage;
