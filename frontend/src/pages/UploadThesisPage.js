// frontend/src/pages/UploadThesisPage.js
import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileUpload, faBook, faPencilAlt, faTags, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import Snackbar from '../components/Common/Snackbar';

const UploadThesisPage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [thesisData, setThesisData] = useState({
        title: '',
        abstract: '',
        keywords: ''
    });
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const { user, loading: userLoading } = useContext(UserContext);

    const [snackbar, setSnackbar] = useState({
        show: false,
        message: '',
        type: 'info',
    });

    const { title, abstract, keywords } = thesisData;

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, show: false });
    };

    const onThesisDataChange = e => {
        setThesisData({ ...thesisData, [e.target.name]: e.target.value });
        setSnackbar({ ...snackbar, show: false });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        console.log('Selected file:', file ? file.name : 'No file');
        setSnackbar({ ...snackbar, show: false });
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();

        setSnackbar({ ...snackbar, show: false });

        if (!user || !user.token) {
            setSnackbar({
                show: true,
                message: 'You must be logged in to upload a thesis. Redirecting to login.',
                type: 'error',
            });
            setTimeout(() => navigate('/login'), 3000);
            return;
        }

        if (!selectedFile) {
            setSnackbar({
                show: true,
                message: 'Please select a thesis file to upload.',
                type: 'error',
            });
            return;
        }

        if (!title.trim() || !abstract.trim()) {
            setSnackbar({
                show: true,
                message: 'Thesis Title and Abstract are required fields.',
                type: 'error',
            });
            return;
        }

        setIsUploading(true);

        const formDataToSend = new FormData();
        formDataToSend.append('thesisFile', selectedFile);
        formDataToSend.append('title', title.trim());
        formDataToSend.append('abstract', abstract.trim());
        formDataToSend.append('keywords', keywords.trim());

        try {
            // UPDATED: Use the live Render backend URL
            const res = await axios.post('YOUR_RENDER_BACKEND_URL/api/theses/upload', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'x-auth-token': user.token
                }
            });

            console.log('Thesis upload successful:', res.data);
            setSnackbar({
                show: true,
                message: 'Thesis uploaded successfully!',
                type: 'success',
            });
            setSelectedFile(null);
            setThesisData({ title: '', abstract: '', keywords: '' });

            setTimeout(() => {
                navigate('/dashboard');
            }, snackbar.duration || 3000);

        } catch (err) {
            console.error('Thesis upload failed:', err.response ? err.response.data : err.message);
            const errorMessage = err.response && err.response.data && err.response.data.msg
                ? err.response.data.msg
                : 'Thesis upload failed. Please try again.';
            setSnackbar({
                show: true,
                message: errorMessage,
                type: 'error',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delayChildren: 0.2,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
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


    return (
        <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: 'calc(100vh - 120px)' }}>
            <Snackbar
                message={snackbar.message}
                type={snackbar.type}
                show={snackbar.show}
                onClose={handleCloseSnackbar}
            />

            <motion.div
                className="card p-5 shadow-lg text-center"
                style={{ maxWidth: '700px', width: '90%', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <h2 className="mb-4 text-dark">
                    <FontAwesomeIcon icon={faFileUpload} className="me-2" /> Upload Your Thesis
                </h2>

                <form onSubmit={handleUploadSubmit}>
                    <motion.div className="mb-3 w-100 text-start" variants={itemVariants}>
                        <label htmlFor="title" className="form-label text-dark d-flex align-items-center">
                            <FontAwesomeIcon icon={faBook} className="me-2" /> Thesis Title
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="title"
                            name="title"
                            placeholder="Enter your thesis title"
                            value={title}
                            onChange={onThesisDataChange}
                            required
                            disabled={isUploading}
                        />
                    </motion.div>

                    <motion.div className="mb-3 w-100 text-start" variants={itemVariants}>
                        <label htmlFor="abstract" className="form-label text-dark d-flex align-items-center">
                            <FontAwesomeIcon icon={faPencilAlt} className="me-2" /> Abstract
                        </label>
                        <textarea
                            className="form-control"
                            id="abstract"
                            name="abstract"
                            rows="5"
                            placeholder="Provide a brief abstract of your thesis"
                            value={abstract}
                            onChange={onThesisDataChange}
                            required
                            disabled={isUploading}
                        ></textarea>
                    </motion.div>

                    <motion.div className="mb-3 w-100 text-start" variants={itemVariants}>
                        <label htmlFor="keywords" className="form-label text-dark d-flex align-items-center">
                            <FontAwesomeIcon icon={faTags} className="me-2" /> Keywords (comma-separated)
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="keywords"
                            name="keywords"
                            placeholder="e.g., AI, Machine Learning, Education"
                            value={keywords}
                            onChange={onThesisDataChange}
                            disabled={isUploading}
                        />
                    </motion.div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept=".pdf"
                        disabled={isUploading}
                    />

                    <motion.div
                        className="file-upload-area p-4 mb-4 border rounded-3 d-flex flex-column align-items-center justify-content-center"
                        onClick={() => !isUploading && fileInputRef.current.click()}
                        style={{ cursor: isUploading ? 'not-allowed' : 'pointer', backgroundColor: 'rgba(0,0,0,0.05)', borderColor: '#ced4da' }}
                        variants={itemVariants}
                        whileHover={{ scale: isUploading ? 1 : 1.01, borderColor: isUploading ? '#ced4da' : '#007bff' }}
                        whileTap={{ scale: isUploading ? 1 : 0.99 }}
                    >
                        <FontAwesomeIcon icon={faFileUpload} size="3x" className="mb-3 text-secondary" />
                        <p className="text-dark mb-1">
                            {selectedFile ? `Selected: ${selectedFile.name}` : "Drag & drop your thesis file here, or click to browse"}
                        </p>
                        {selectedFile && (
                            <small className="text-muted">{selectedFile.size ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ''}</small>
                        )}
                        {!selectedFile && <small className="text-muted">Only PDF files up to 50MB are allowed.</small>}
                    </motion.div>

                    <motion.button
                        type="submit"
                        className="btn btn-primary btn-lg w-100"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="me-2" /> Uploading...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faFileUpload} className="me-2" /> Upload Thesis
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default UploadThesisPage;
