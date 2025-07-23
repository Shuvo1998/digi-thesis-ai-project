// frontend/src/pages/UploadThesisPage.js
import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileUpload, faBook, faPencilAlt, faTags, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import Snackbar from '../components/Common/Snackbar'; // Assuming Snackbar is in this path

const UploadThesisPage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [thesisData, setThesisData] = useState({
        title: '',
        abstract: '',
        keywords: ''
    });
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');
    const [isUploading, setIsUploading] = useState(false); // New state for upload in progress

    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const { user, loading: userLoading } = useContext(UserContext); // Get user and loading from context

    // State for Snackbar notifications
    const [snackbar, setSnackbar] = useState({
        show: false,
        message: '',
        type: 'info',
    });

    // Destructure thesisData for easier access
    const { title, abstract, keywords } = thesisData;

    // Handler to close Snackbar
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, show: false });
    };

    // Handler for text input changes
    const onThesisDataChange = e => {
        setThesisData({ ...thesisData, [e.target.name]: e.target.value });
        // Clear all feedback messages when user starts typing
        setUploadError('');
        setUploadSuccess('');
        setSnackbar({ ...snackbar, show: false });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        console.log('Selected file:', file ? file.name : 'No file');
        // Clear all feedback messages when a new file is selected
        setUploadError('');
        setUploadSuccess('');
        setSnackbar({ ...snackbar, show: false });
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission

        setUploadError(''); // Clear previous errors
        setUploadSuccess(''); // Clear previous success messages
        setSnackbar({ ...snackbar, show: false }); // Clear previous snackbar

        // This page is protected by PrivateRoute, so 'user' should exist here.
        // However, a final check here is good practice.
        if (!user || !user.token) {
            setSnackbar({
                show: true,
                message: 'You must be logged in to upload a thesis. Redirecting to login.',
                type: 'error',
            });
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        if (!selectedFile) {
            setUploadError('Please select a thesis file to upload.');
            setSnackbar({
                show: true,
                message: 'Please select a thesis file to upload.',
                type: 'error',
            });
            return;
        }

        // Basic client-side validation for required text fields
        if (!title.trim() || !abstract.trim()) { // Use .trim() to check for empty strings
            setUploadError('Thesis Title and Abstract are required fields.');
            setSnackbar({
                show: true,
                message: 'Thesis Title and Abstract are required fields.',
                type: 'error',
            });
            return;
        }

        setIsUploading(true); // Set uploading state to true

        const formDataToSend = new FormData();
        formDataToSend.append('thesisFile', selectedFile); // 'thesisFile' must match backend Multer fieldname
        formDataToSend.append('title', title.trim()); // Trim whitespace
        formDataToSend.append('abstract', abstract.trim()); // Trim whitespace
        formDataToSend.append('keywords', keywords.trim()); // Trim whitespace

        try {
            const res = await axios.post('http://localhost:5000/api/theses/upload', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                    'x-auth-token': user.token // Send the JWT token for authentication
                }
            });

            console.log('Thesis upload successful:', res.data);
            setUploadSuccess('Thesis uploaded successfully!');
            setSnackbar({
                show: true,
                message: 'Thesis uploaded successfully!',
                type: 'success',
            });
            // Clear form fields after successful upload
            setSelectedFile(null);
            setThesisData({ title: '', abstract: '', keywords: '' });

            // ADDED: Redirect to dashboard after successful upload and snackbar display
            setTimeout(() => {
                navigate('/dashboard');
            }, snackbar.duration || 3000); // Use snackbar's default duration or specify

        } catch (err) {
            console.error('Thesis upload failed:', err.response ? err.response.data : err.message);
            const errorMessage = err.response && err.response.data && err.response.data.msg
                ? err.response.data.msg // Backend error message (e.g., "Only PDF files allowed!")
                : 'Thesis upload failed. Please try again.';
            setUploadError(errorMessage);
            setSnackbar({
                show: true,
                message: errorMessage,
                type: 'error',
            });
        } finally {
            setIsUploading(false); // Reset uploading state
        }
    };

    // Framer Motion variants (can be shared or defined here)
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
            {/* Snackbar Component */}
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

                <form onSubmit={handleUploadSubmit}> {/* Form for submission */}
                    {/* Thesis Title Input */}
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
                            disabled={isUploading} // Disable while uploading
                        />
                    </motion.div>

                    {/* Thesis Abstract Input */}
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
                            disabled={isUploading} // Disable while uploading
                        ></textarea>
                    </motion.div>

                    {/* Keywords Input */}
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
                            disabled={isUploading} // Disable while uploading
                        />
                    </motion.div>

                    {/* Hidden File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept=".pdf"
                        disabled={isUploading} // Disable while uploading
                    />

                    {/* File Selection Area */}
                    <motion.div
                        className="file-upload-area p-4 mb-4 border rounded-3 d-flex flex-column align-items-center justify-content-center"
                        onClick={() => !isUploading && fileInputRef.current.click()} // Prevent click while uploading
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

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        className="btn btn-primary btn-lg w-100"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        disabled={isUploading} // Disable button while uploading
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
