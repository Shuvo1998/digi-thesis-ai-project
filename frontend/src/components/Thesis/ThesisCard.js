// frontend/src/components/Thesis/ThesisCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faDownload, faCheckCircle, faTimesCircle, faTrash, faPenFancy,
    faClipboardCheck, faUserGraduate, faBuilding, faCalendarAlt, faGlobe,
    faSpinner // <--- ADDED THIS IMPORT
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const ThesisCard = ({
    thesis,
    isOwnerOrAdmin = false, // Default to false if not provided
    checkingPlagiarismId = null,
    checkingGrammarId = null,
    onDownload,
    onApprove,
    onReject,
    onDelete,
    onPlagiarismCheck,
    onGrammarCheck
}) => {
    const cardVariants = {
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
            scale: 1.02, // Slightly less aggressive hover for individual cards
            boxShadow: "0px 8px 15px rgba(0,0,0,0.15)", // Subtle shadow on hover
            transition: {
                duration: 0.2
            }
        }
    };

    const buttonVariants = {
        hover: { scale: 1.05 },
        tap: { scale: 0.95 }
    };

    const statusColors = {
        pending: 'bg-warning text-dark',
        approved: 'bg-success text-white',
        rejected: 'bg-danger text-white',
    };

    const downloadFile = () => {
        if (onDownload) {
            onDownload(thesis.filePath, thesis.fileName);
        } else {
            // Fallback for public theses where onDownload might not be passed explicitly
            // Backend URL is now hardcoded
            const fileUrl = `https://digi-thesis-ai-project.onrender.com/${thesis.filePath.replace(/\\/g, '/')}`;
            window.open(fileUrl, '_blank');
        }
    };

    return (
        <motion.div
            className="card thesis-card-custom h-100 d-flex flex-column"
            variants={cardVariants}
            whileHover="hover"
            initial="hidden"
            animate="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
            <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">
                        <Link to={`/thesis/${thesis._id}`} className="thesis-title-link">
                            {thesis.title}
                        </Link>
                    </h5>
                    <span className={`badge ${statusColors[thesis.status]} ms-3`}>
                        {thesis.status.charAt(0).toUpperCase() + thesis.status.slice(1)}
                    </span>
                </div>

                {/* NEW: Author, Department, Year */}
                <div className="mb-2 text-dark text-start">
                    <p className="card-text mb-1 small text-muted">
                        <FontAwesomeIcon icon={faUserGraduate} className="me-2" />
                        <strong>Author:</strong> {thesis.authorName}
                    </p>
                    <p className="card-text mb-1 small text-muted">
                        <FontAwesomeIcon icon={faBuilding} className="me-2" />
                        <strong>Department:</strong> {thesis.department}
                    </p>
                    <p className="card-text mb-1 small text-muted">
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                        <strong>Year:</strong> {thesis.submissionYear}
                    </p>
                    {thesis.isPublic && (
                        <p className="card-text mb-1 small text-muted">
                            <FontAwesomeIcon icon={faGlobe} className="me-2" />
                            <strong>Visibility:</strong> Public
                        </p>
                    )}
                </div>

                <p className="card-text text-muted text-start flex-grow-1">
                    {thesis.abstract.substring(0, 150)}{thesis.abstract.length > 150 ? '...' : ''}
                </p>

                {thesis.keywords && thesis.keywords.length > 0 && (
                    <div className="mb-3 text-start">
                        {thesis.keywords.map((keyword, index) => (
                            <span key={index} className="badge bg-secondary me-1 mb-1">
                                {keyword}
                            </span>
                        ))}
                    </div>
                )}

                {/* Plagiarism and Grammar Results */}
                {(thesis.plagiarismResult && thesis.plagiarismResult !== 'Not checked') && (
                    <div className="plagiarism-result mb-2 text-start text-dark">
                        <strong>Plagiarism:</strong> {thesis.plagiarismResult}
                    </div>
                )}
                {(thesis.grammarResult && thesis.grammarResult !== 'Not checked') && (
                    <div className="grammar-result mb-2 text-start text-dark">
                        <strong>Grammar:</strong> {thesis.grammarResult}
                    </div>
                )}

                <div className="mt-auto d-flex flex-wrap justify-content-center gap-2">
                    <motion.button
                        className="btn btn-outline-primary btn-sm"
                        onClick={downloadFile}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        <FontAwesomeIcon icon={faDownload} className="me-1" /> Download
                    </motion.button>

                    {isOwnerOrAdmin && thesis.status === 'pending' && (
                        <>
                            <motion.button
                                className="btn btn-success btn-sm"
                                onClick={() => onApprove(thesis._id)}
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                <FontAwesomeIcon icon={faCheckCircle} className="me-1" /> Approve
                            </motion.button>
                            <motion.button
                                className="btn btn-danger btn-sm"
                                onClick={() => onReject(thesis._id)}
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                <FontAwesomeIcon icon={faTimesCircle} className="me-1" /> Reject
                            </motion.button>
                            <motion.button
                                className="btn btn-info btn-sm"
                                onClick={() => onPlagiarismCheck(thesis._id)}
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                disabled={checkingPlagiarismId === thesis._id}
                            >
                                {checkingPlagiarismId === thesis._id ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin className="me-1" /> Checking...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faClipboardCheck} className="me-1" /> Plagiarism Check
                                    </>
                                )}
                            </motion.button>
                            <motion.button
                                className="btn btn-secondary btn-sm"
                                onClick={() => onGrammarCheck(thesis._id)}
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                disabled={checkingGrammarId === thesis._id}
                            >
                                {checkingGrammarId === thesis._id ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin className="me-1" /> Checking...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faPenFancy} className="me-1" /> Grammar Check
                                    </>
                                )}
                            </motion.button>
                        </>
                    )}

                    {isOwnerOrAdmin && onDelete && ( // Only show delete if onDelete prop is provided (e.g., on Dashboard)
                        <motion.button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => onDelete(thesis._id)}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <FontAwesomeIcon icon={faTrash} className="me-1" /> Delete
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ThesisCard;
