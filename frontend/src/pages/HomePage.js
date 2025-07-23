// frontend/src/pages/HomePage.js
import React, { useState, useRef, useEffect, useContext } from 'react'; // ADDED useEffect
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faHome, faFileUpload, faBookOpen, faFilePdf, faTags, faCalendarAlt, faUserGraduate, faSpinner } from '@fortawesome/free-solid-svg-icons'; // ADDED new icons
import { motion } from 'framer-motion';
import { UserContext } from '../context/UserContext';
import Snackbar from '../components/Common/Snackbar';
import axios from 'axios'; // ADDED axios for public fetch

const HomePage = () => {
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const { user, loading: userLoading } = useContext(UserContext);

    const [snackbar, setSnackbar] = useState({
        show: false,
        message: '',
        type: 'info',
    });

    // ADDED: State for public theses
    const [publicTheses, setPublicTheses] = useState([]);
    const [loadingPublicTheses, setLoadingPublicTheses] = useState(true);
    const [publicThesesError, setPublicThesesError] = useState('');


    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, show: false });
    };

    const handleUploadClick = () => {
        if (!user) {
            setSnackbar({
                show: true,
                message: 'Please log in to upload your thesis.',
                type: 'error',
            });
            setTimeout(() => {
                navigate('/login');
            }, snackbar.duration || 3000);
        } else {
            navigate('/upload-thesis');
        }
    };

    const handleDownloadPublicThesis = (filePath, fileName) => {
        const fileUrl = `http://localhost:5000/${filePath.replace(/\\/g, '/')}`;
        window.open(fileUrl, '_blank');
        setSnackbar({ show: true, message: `Downloading ${fileName}...`, type: 'info' });
    };

    // ADDED: Function to fetch public theses
    const fetchPublicTheses = async () => {
        try {
            setLoadingPublicTheses(true);
            setPublicThesesError('');
            const res = await axios.get('http://localhost:5000/api/theses/public');
            setPublicTheses(res.data);
            setLoadingPublicTheses(false);
        } catch (err) {
            console.error('Failed to fetch public theses:', err.response ? err.response.data : err.message);
            setPublicThesesError('Failed to load public submissions. Please try again.');
            setSnackbar({
                show: true,
                message: 'Failed to load public submissions.',
                type: 'error',
            });
            setLoadingPublicTheses(false);
        }
    };

    // ADDED: useEffect to fetch public theses on component mount
    useEffect(() => {
        fetchPublicTheses();
    }, []); // Empty dependency array means this runs once on mount

    // Define some animation variants for Framer Motion (existing)
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

    // Variants for a continuously animating background element (existing)
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

            {/* Hero Section (existing) */}
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

            {/* ADDED: Public Submissions Section */}
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
                ) : publicTheses.length === 0 ? (
                    <div className="text-center text-muted">
                        <p className="lead">No approved theses to display yet.</p>
                    </div>
                ) : (
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 px-3">
                        {publicTheses.map((thesis) => (
                            <div className="col" key={thesis._id}>
                                <div className="card h-100 shadow-sm bg-white text-dark">
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title text-primary mb-2">{thesis.title}</h5>
                                        <h6 className="card-subtitle mb-2 text-muted">
                                            <FontAwesomeIcon icon={faUserGraduate} className="me-1" />
                                            Uploaded by: {thesis.user ? thesis.user.username : 'N/A'}
                                        </h6>
                                        <h6 className="card-subtitle mb-2 text-muted">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                            Uploaded: {new Date(thesis.uploadDate).toLocaleDateString()}
                                        </h6>
                                        <p className="card-text flex-grow-1 overflow-hidden" style={{ maxHeight: '6em' }}>
                                            {thesis.abstract}
                                        </p>
                                        {thesis.keywords && thesis.keywords.length > 0 && (
                                            <p className="card-text text-muted small">
                                                <FontAwesomeIcon icon={faTags} className="me-1" />
                                                Keywords: {thesis.keywords.join(', ')}
                                            </p>
                                        )}
                                        <div className="mt-auto d-flex justify-content-end"> {/* Align download button to end */}
                                            <button
                                                className="btn btn-outline-primary btn-sm"
                                                title="Download Thesis"
                                                onClick={() => handleDownloadPublicThesis(thesis.filePath, thesis.fileName)}
                                            >
                                                <FontAwesomeIcon icon={faFilePdf} className="me-2" /> Download PDF
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Original Features Section (existing) */}
            <section className="features-section py-5 bg-light mt-5">
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
                            {/* Note: Original icons were faHome, changed to more relevant ones for demo */}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
