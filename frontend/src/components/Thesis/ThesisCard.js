// frontend/src/components/Thesis/ThesisCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faDownload, faEye, faUser, faGraduationCap, faCalendarAlt, faFilePdf,
    faCheckCircle, faTimesCircle, faTrash, faPenFancy,
    faClipboardCheck, faBuilding, faGlobe, faSpinner, // ADDED MISSING ICONS HERE
    faUserGraduate // Ensure this is also imported if used directly
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

    // Bootstrap status colors (will be overridden by custom CSS if needed)
    const statusColors = {
        pending: 'bg-warning text-dark', // Bootstrap classes
        approved: 'bg-success text-white',
        rejected: 'bg-danger text-white',
    };

    const downloadFile = () => {
        if (onDownload) {
            onDownload(thesis.filePath, thesis.fileName);
        } else {
            // Fallback for public theses where onDownload might not be passed explicitly
            const fileUrl = `https://digi-thesis-ai-project.onrender.com/${thesis.filePath.replace(/\\/g, '/')}`;
            window.open(fileUrl, '_blank');
        }
    };

    return (
        <motion.div
            className="card h-100 d-flex flex-column thesis-card"
            variants={cardVariants}
            whileHover="hover"
            initial="hidden"
            animate="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
            <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">
                        <Link to={`/view-thesis/${thesis._id}`} className="thesis-title-link text-light-custom">
                            {thesis.title}
                        </Link>
                    </h5>
                    <span className={`badge ${statusColors[thesis.status]} ms-3`}>
                        {thesis.status.charAt(0).toUpperCase() + thesis.status.slice(1)}
                    </span>
                </div>

                {/* Author, Department, Year, Visibility - using custom text classes */}
                <div className="mb-2 text-start">
                    <p className="card-text mb-1 small text-muted-custom">
                        <FontAwesomeIcon icon={faUserGraduate} className="me-2 text-primary-custom" />
                        <strong>Author:</strong> {thesis.authorName}
                    </p>
                    <p className="card-text mb-1 small text-muted-custom">
                        <FontAwesomeIcon icon={faBuilding} className="me-2 text-primary-custom" />
                        <strong>Department:</strong> {thesis.department}
                    </p>
                    <p className="card-text mb-1 small text-muted-custom">
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary-custom" />
                        <strong>Year:</strong> {thesis.submissionYear}
                    </p>
                    {thesis.isPublic && (
                        <p className="card-text mb-1 small text-muted-custom">
                            <FontAwesomeIcon icon={faGlobe} className="me-2 text-primary-custom" />
                            <strong>Visibility:</strong> Public
                        </p>
                    )}
                </div>

                {/* Abstract - using custom text classes */}
                <p className="card-text text-start flex-grow-1 text-muted-custom">
                    {thesis.abstract.substring(0, 150)}{thesis.abstract.length > 150 ? '...' : ''}
                </p>

                {thesis.keywords && thesis.keywords.length > 0 && (
                    <div className="mb-3 text-start">
                        {thesis.keywords.map((keyword, index) => (
                            <span key={index} className="badge bg-secondary-custom me-1 mb-1">
                                {keyword}
                            </span>
                        ))}
                    </div>
                )}

                {/* Plagiarism and Grammar Results - using custom text classes */}
                {(thesis.plagiarismResult && thesis.plagiarismResult !== 'Not checked') && (
                    <div className="plagiarism-result mb-2 text-start text-light-custom">
                        <strong>Plagiarism:</strong> {thesis.plagiarismResult}
                    </div>
                )}
                {(thesis.grammarResult && thesis.grammarResult !== 'Not checked') && (
                    <div className="grammar-result mb-2 text-start text-light-custom">
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

                    {isOwnerOrAdmin && onDelete && (
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
