// frontend/src/components/Thesis/ThesisCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserGraduate, faCalendarAlt, faTags, faFilePdf, faSpinner,
    faEdit, faTrashAlt, faDownload, faSearch, faLanguage, faCheckCircle, faTimesCircle
} from '@fortawesome/free-solid-svg-icons';

const ThesisCard = ({
    thesis,
    isOwnerOrAdmin = false,
    checkingPlagiarismId = null,
    checkingGrammarId = null,
    onPlagiarismCheck,
    onGrammarCheck,
    onDownload,
    onEdit,
    onDelete,
    onApprove,
    onReject
}) => {

    const statusClasses = {
        'approved': 'bg-success',
        'rejected': 'bg-danger',
        'pending': 'bg-warning text-dark'
    };

    // Helper function for download to use the correct base URL
    const handleDownloadInternal = (filePath, fileName) => {
        // UPDATED: Use the live Render backend URL
        const fileUrl = `https://digi-thesis-ai-project.onrender.com/${filePath.replace(/\\/g, '/')}`;
        window.open(fileUrl, '_blank');
        // If an external onDownload handler is provided, call it too
        if (onDownload) {
            onDownload(filePath, fileName);
        }
    };


    return (
        <div className="card h-100 shadow-sm bg-white text-dark thesis-card-custom">
            <div className="card-body d-flex flex-column">
                <Link to={`/thesis/${thesis._id}`} className="text-decoration-none">
                    <h5 className="card-title text-primary mb-2 thesis-title-link">{thesis.title}</h5>
                </Link>
                <h6 className="card-subtitle mb-2 text-muted">
                    <FontAwesomeIcon icon={faUserGraduate} className="me-1" />
                    Uploaded by: {thesis.user ? thesis.user.username : 'N/A'}
                    {thesis.user && thesis.user.email && ` (${thesis.user.email})`}
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

                {thesis.plagiarismResult && (
                    <div className="plagiarism-result mt-3 mb-2 p-2 border rounded-3 bg-light-subtle text-start overflow-auto" style={{ maxHeight: '100px', fontSize: '0.9em' }}>
                        <strong className="text-info">Plagiarism Check Result:</strong>
                        <p className="mb-0">{thesis.plagiarismResult}</p>
                    </div>
                )}

                {thesis.grammarResult && (
                    <div className="grammar-result mt-3 mb-2 p-2 border rounded-3 bg-light-subtle text-start overflow-auto" style={{ maxHeight: '100px', fontSize: '0.9em' }}>
                        <strong className="text-info">Grammar Check Result:</strong>
                        <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{thesis.grammarResult}</p>
                    </div>
                )}

                <div className="mt-auto d-flex flex-wrap justify-content-between align-items-center pt-3 border-top">
                    <span className={`badge ${statusClasses[thesis.status] || 'bg-secondary'}`}>
                        Status: {thesis.status.charAt(0).toUpperCase() + thesis.status.slice(1)}
                    </span>
                    <div className="d-flex flex-wrap gap-2 mt-2 mt-md-0">

                        {isOwnerOrAdmin && (onPlagiarismCheck && (
                            <button
                                className="btn btn-info btn-sm"
                                title="Check Plagiarism"
                                onClick={() => onPlagiarismCheck(thesis._id)}
                                disabled={checkingPlagiarismId === thesis._id || checkingGrammarId === thesis._id}
                            >
                                {checkingPlagiarismId === thesis._id ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin className="me-1" /> Checking...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faSearch} className="me-1" /> Plagiarism
                                    </>
                                )}
                            </button>
                        ))}

                        {isOwnerOrAdmin && (onGrammarCheck && (
                            <button
                                className="btn btn-warning text-dark btn-sm"
                                title="Check Grammar"
                                onClick={() => onGrammarCheck(thesis._id)}
                                disabled={checkingGrammarId === thesis._id || checkingPlagiarismId === thesis._id}
                            >
                                {checkingGrammarId === thesis._id ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin className="me-1" /> Checking...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faLanguage} className="me-1" /> Grammar
                                    </>
                                )}
                            </button>
                        ))}

                        {/* Use the internal handler for download */}
                        {onDownload && (
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                title="Download Thesis"
                                onClick={() => handleDownloadInternal(thesis.filePath, thesis.fileName)}
                            >
                                <FontAwesomeIcon icon={faDownload} />
                            </button>
                        )}

                        {isOwnerOrAdmin && (onEdit && (
                            <button
                                className="btn btn-outline-primary btn-sm"
                                title="Edit Thesis"
                                onClick={() => onEdit(thesis._id)}
                            >
                                <FontAwesomeIcon icon={faEdit} />
                            </button>
                        ))}

                        {isOwnerOrAdmin && (onDelete && (
                            <button
                                className="btn btn-outline-danger btn-sm"
                                title="Delete Thesis"
                                onClick={() => onDelete(thesis._id)}
                            >
                                <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                        ))}

                        {onApprove && (
                            <button
                                className="btn btn-success btn-sm"
                                title="Approve Thesis"
                                onClick={() => onApprove(thesis._id)}
                            >
                                <FontAwesomeIcon icon={faCheckCircle} className="me-2" /> Approve
                            </button>
                        )}

                        {onReject && (
                            <button
                                className="btn btn-danger btn-sm"
                                title="Reject Thesis"
                                onClick={() => onReject(thesis._id)}
                            >
                                <FontAwesomeIcon icon={faTimesCircle} className="me-2" /> Reject
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThesisCard;
