// frontend/src/pages/HomePage.js
import React, { useState, useEffect, useContext, useRef } from 'react'; // Added useRef
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faRocket, faHome, faFileUpload, faBookOpen, faSpinner, faUserGraduate,
    faCheckCircle, faPenFancy, faTasks // Specific icons for features
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import ThesisCard from '../components/Thesis/ThesisCard';

const HomePage = () => {
    const fileInputRef = useRef(null); // This ref is not used in the current code, can be removed if not needed elsewhere
    const navigate = useNavigate();
    const { user, showSnackbar } = useContext(UserContext);

    const [publicTheses, setPublicTheses] = useState([]);
    const [loadingPublicTheses, setLoadingPublicTheses] = useState(true);
    const [publicThesesError, setPublicThesesError] = useState('');

    const handleUploadClick = () => {
        if (!user) {
            showSnackbar('Please log in to upload your thesis.', 'error');
            setTimeout(() => {
                navigate('/login');
            }, 1000);
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
            boxShadow: "0px 10px 20px rgba(0,0,0,0.4)",
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
        // Removed min-h-screen bg-gray-900 text-gray-100 font-inter py-5 relative overflow-hidden
        // as global background is now handled by App.js main tag.
        // Keeping relative overflow-hidden for animated blobs.
        <div className="py-5 relative overflow-hidden">
            {/* Animated Blobs - adjusted colors for dark theme */}
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

            <div className="max-w-7xl mx-auto relative z-10">
                <section className="hero-section mb-5 text-center"> {/* Added text-center for hero section */}
                    <motion.h1
                        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-3 text-gray-100"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        Build and analyze your Thesis <br /> on a <span className="text-blue-400">Single, Collaborative Platform</span>
                    </motion.h1>

                    <motion.p
                        className="text-lg sm:text-xl mb-4 text-gray-300"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        Streamline your research, detect plagiarism, and enhance grammar with AI-powered tools.
                    </motion.p>

                    <motion.div
                        className="flex justify-center gap-3 items-center"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.button
                            className="px-6 py-3 bg-blue-600 text-white rounded-md text-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-lg"
                            onClick={handleUploadClick}
                            variants={itemVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <FontAwesomeIcon icon={faFileUpload} className="mr-2" />
                            Upload Your Thesis
                        </motion.button>
                    </motion.div>
                </section>

                <section className="public-submissions-section py-8 bg-gray-800 rounded-lg shadow-xl mt-10"> {/* Dark theme card background */}
                    <h2 className="text-3xl font-bold text-gray-100 mb-6 text-center">
                        <FontAwesomeIcon icon={faBookOpen} className="mr-3" /> Latest Approved Theses
                    </h2>
                    {loadingPublicTheses ? (
                        <div className="flex justify-center items-center py-10">
                            <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-blue-400" />
                            <p className="ml-3 text-lg text-gray-300">Loading public submissions...</p>
                        </div>
                    ) : publicThesesError ? (
                        <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded relative mx-auto max-w-lg" role="alert">
                            <strong className="font-bold">Error!</strong>
                            <span className="block sm:inline"> {publicThesesError}</span>
                        </div>
                    ) : publicTheses.length === 0 ? (
                        <div className="text-center text-gray-300 text-lg py-10">
                            <p className="lead">No approved theses to display yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-3">
                            {publicTheses.map((thesis) => (
                                <ThesisCard
                                    key={thesis._id}
                                    thesis={thesis}
                                    onDownload={handleDownloadPublicThesis}
                                // ThesisCard itself will be updated to adapt to dark theme separately
                                />
                            ))}
                        </div>
                    )}
                </section>

                <section className="features-section py-8 bg-gray-800 mt-10 rounded-lg shadow-xl"> {/* Dark theme card background */}
                    <h2 className="text-3xl font-bold text-gray-100 mb-6 text-center">Key Features</h2>
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-items-center gap-6 px-3"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        {/* Plagiarism Check Feature Card (Clickable) */}
                        <motion.div className="w-full max-w-xs" variants={featureCardVariants} whileHover="hover">
                            <Link to="/dashboard" className="block h-full no-underline">
                                <div className="bg-gray-700 p-6 h-full rounded-lg shadow-md flex flex-col items-center justify-center text-center text-gray-200">
                                    <div className="feature-icon-circle mx-auto mb-4 text-blue-400">
                                        <FontAwesomeIcon icon={faCheckCircle} size="3x" />
                                    </div>
                                    <h4 className="text-xl font-semibold mb-2 text-gray-100">Plagiarism Check</h4>
                                    <p className="text-gray-300">Ensure originality and academic integrity with advanced AI detection.</p>
                                </div>
                            </Link>
                        </motion.div>

                        {/* Grammar Correction Feature Card (Clickable) */}
                        <motion.div className="w-full max-w-xs" variants={featureCardVariants} whileHover="hover">
                            <Link to="/dashboard" className="block h-full no-underline">
                                <div className="bg-gray-700 p-6 h-full rounded-lg shadow-md flex flex-col items-center justify-center text-center text-gray-200">
                                    <div className="feature-icon-circle mx-auto mb-4 text-green-400">
                                        <FontAwesomeIcon icon={faPenFancy} size="3x" />
                                    </div>
                                    <h4 className="text-xl font-semibold mb-2 text-gray-100">Grammar Correction</h4>
                                    <p className="text-gray-300">Refine your writing, improve clarity, and eliminate errors with intelligent suggestions.</p>
                                </div>
                            </Link>
                        </motion.div>

                        {/* Thesis Management Feature Card (Clickable) */}
                        <motion.div className="w-full max-w-xs" variants={featureCardVariants} whileHover="hover">
                            <Link to="/dashboard" className="block h-full no-underline">
                                <div className="bg-gray-700 p-6 h-full rounded-lg shadow-md flex flex-col items-center justify-center text-center text-gray-200">
                                    <div className="feature-icon-circle mx-auto mb-4 text-purple-400">
                                        <FontAwesomeIcon icon={faTasks} size="3x" />
                                    </div>
                                    <h4 className="text-xl font-semibold mb-2 text-gray-100">Thesis Management</h4>
                                    <p className="text-gray-300">Organize, track, and manage your research progress efficiently in one place.</p>
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
