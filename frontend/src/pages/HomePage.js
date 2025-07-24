// frontend/src/pages/HomePage.js
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faRocket, faHome, faFileUpload, faBookOpen, faSpinner, faUserGraduate
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import axios from 'axios';
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
        // UPDATED: Use the live Render backend URL
        const fileUrl = `https://digi-thesis-ai-project.onrender.com/${filePath.replace(/\\/g, '/')}`;
        window.open(fileUrl, '_blank');
        setSnackbar({ show: true, message: `Downloading ${fileName}...`, type: 'info' });
    };

    const fetchPublicTheses = async () => {
        try {
            setLoadingPublicTheses(true);
            setPublicThesesError('');
            // UPDATED: Use the live Render backend URL
            const res = await axios.get('https://digi-thesis-ai-project.onrender.com/api/theses/public');
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

            <section className="hero-section mb-5">
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
                ) : publicTheses.length === 0 ? (
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
                )}
            </section>

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
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
