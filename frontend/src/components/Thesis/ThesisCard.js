// frontend/src/components/Thesis/ThesisCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserGraduate, faCalendarAlt, faTags, faFilePdf, faSpinner,
    faEdit, faTrashAlt, faDownload, faSearch, faLanguage, faCheckCircle, faTimesCircle
} from '@fortawesome/free-solid-svg-icons';

// ThesisCard component receives props for data and actions
const ThesisCard = ({
    thesis,
    isOwnerOrAdmin = false, // To show/hide action buttons for owner/admin
    checkingPlagiarismId = null, // For plagiarism button loading state
    checkingGrammarId = null,    // For grammar button loading state
    onPlagiarismCheck, // Handler for plagiarism button
    onGrammarCheck,    // Handler for grammar button
    onDownload,        // Handler for download button
    onEdit,            // Handler for edit button
    onDelete,          // Handler for delete button
    onApprove,         // Handler for approve button (Admin Dashboard)
    onReject           // Handler for reject button (Admin Dashboard)
}) => {

    const statusClasses = {
        'approved': 'bg-success',
        'rejected': 'bg-danger',
        'pending': 'bg-warning text-dark'
    };

    return (
        <div className="card h-100 shadow-sm bg-white text-dark thesis-card-custom">
            <div className="card-body d-flex flex-column">
                {/* Link the title to the ViewThesisPage */}
                <Link to={`/thesis/${thesis._id}`} className="text-decoration-none">
                    <h5 className="card-title text-primary mb-2 thesis-title-link">{thesis.title}</h5>
                </Link>
                <h6 className="card-subtitle mb-2 text-muted">
                    <FontAwesomeIcon icon={faUserGraduate} className="me-1" />
                    Uploaded by: {thesis.user ? thesis.user.username : 'N/A'}
                    {thesis.user && thesis.user.email && ` (${thesis.user.email})`} {/* Show email if available */}
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

                {/* Plagiarism Result Display */}
                {thesis.plagiarismResult && (
                    <div className="plagiarism-result mt-3 mb-2 p-2 border rounded-3 bg-light-subtle text-start overflow-auto" style={{ maxHeight: '100px', fontSize: '0.9em' }}>
                        <strong className="text-info">Plagiarism Check Result:</strong>
                        <p className="mb-0">{thesis.plagiarismResult}</p>
                    </div>
                )}

                {/* Grammar Result Display */}
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
                        {/* Action Buttons - conditional based on props */}

                        {/* Plagiarism Check Button (only for owner/admin/supervisor) */}
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

                        {/* Grammar Check Button (only for owner/admin/supervisor) */}
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

                        {/* Download Button (available for all views that pass the handler) */}
                        {onDownload && (
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                title="Download Thesis"
                                onClick={() => onDownload(thesis.filePath, thesis.fileName)}
                            >
                                <FontAwesomeIcon icon={faDownload} />
                            </button>
                        )}

                        {/* Edit Button (only for owner) */}
                        {isOwnerOrAdmin && (onEdit && (
                            <button
                                className="btn btn-outline-primary btn-sm"
                                title="Edit Thesis"
                                onClick={() => onEdit(thesis._id)}
                            >
                                <FontAwesomeIcon icon={faEdit} />
                            </button>
                        ))}

                        {/* Delete Button (only for owner) */}
                        {isOwnerOrAdmin && (onDelete && (
                            <button
                                className="btn btn-outline-danger btn-sm"
                                title="Delete Thesis"
                                onClick={() => onDelete(thesis._id)}
                            >
                                <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                        ))}

                        {/* Approve Button (only for Admin Dashboard) */}
                        {onApprove && (
                            <button
                                className="btn btn-success btn-sm"
                                title="Approve Thesis"
                                onClick={() => onApprove(thesis._id)}
                            >
                                <FontAwesomeIcon icon={faCheckCircle} className="me-2" /> Approve
                            </button>
                        )}

                        {/* Reject Button (only for Admin Dashboard) */}
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
