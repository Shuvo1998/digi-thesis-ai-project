// frontend/src/components/Thesis/ThesisCard.js
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faDownload, faEye, faEdit, faTrashAlt, faCheckCircle, faTimesCircle,
    faHourglassHalf, faGraduationCap, faCalendarAlt, faBook, faUser, faFilePdf,
    faSearch, faPenFancy, faClipboardList, faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const ThesisCard = ({
    thesis,
    isAdminView = false,
    isOwnerOrAdmin = false,
    onApprove,
    onReject,
    onPlagiarismCheck,
    onGrammarCheck,
    onDownload,
    onEdit,
    onDelete,
    checkingPlagiarismId,
    checkingGrammarId,
}) => {
    const getStatusClasses = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-600 text-white';
            case 'rejected':
                return 'bg-red-600 text-white';
            case 'pending':
                return 'bg-yellow-600 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return faCheckCircle;
            case 'rejected':
                return faTimesCircle;
            case 'pending':
                return faHourglassHalf;
            default:
                return faBook;
        }
    };

    const isPlagiarismChecking = checkingPlagiarismId === thesis._id;
    const isGrammarChecking = checkingGrammarId === thesis._id;

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden h-full flex flex-col transform transition-transform duration-300 hover:scale-105"> {/* Dark theme card background */}
            <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-100 mr-4">{thesis.title}</h3> {/* Dark theme text */}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(thesis.status)}`}>
                        <FontAwesomeIcon icon={getStatusIcon(thesis.status)} className="mr-1" />
                        {thesis.status.charAt(0).toUpperCase() + thesis.status.slice(1)}
                    </span>
                </div>
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">{thesis.abstract}</p> {/* Dark theme text */}
                <div className="text-gray-400 text-sm mb-2"> {/* Dark theme text */}
                    <p><FontAwesomeIcon icon={faUser} className="mr-2 text-blue-400" />Author: {thesis.authorName}</p>
                    <p><FontAwesomeIcon icon={faGraduationCap} className="mr-2 text-green-400" />Department: {thesis.department}</p>
                    <p><FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-purple-400" />Year: {thesis.submissionYear}</p>
                    <p><FontAwesomeIcon icon={faBook} className="mr-2 text-yellow-400" />Keywords: {thesis.keywords.join(', ')}</p>
                </div>

                {/* AI Results Section */}
                {(thesis.plagiarismResult || thesis.grammarResult) && (
                    <div className="mt-4 p-3 bg-gray-700 rounded-md text-sm text-gray-200"> {/* Dark theme background and text */}
                        {thesis.plagiarismResult && (
                            <p className="mb-1"><FontAwesomeIcon icon={faSearch} className="mr-2 text-red-400" />
                                <span className="font-semibold">Plagiarism:</span> {thesis.plagiarismResult}</p>
                        )}
                        {thesis.grammarResult && (
                            <p><FontAwesomeIcon icon={faPenFancy} className="mr-2 text-indigo-400" />
                                <span className="font-semibold">Grammar:</span> {thesis.grammarResult}</p>
                        )}
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-gray-700 flex flex-wrap gap-2 justify-end"> {/* Dark theme border */}
                {/* View Thesis Button */}
                <Link to={`/view-thesis/${thesis._id}`} className="flex-1 min-w-[120px]">
                    <button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center justify-center text-sm"
                    >
                        <FontAwesomeIcon icon={faEye} className="mr-2" /> View
                    </button>
                </Link>

                {/* Download Button */}
                {onDownload && thesis.filePath && (
                    <button
                        onClick={() => onDownload(thesis.filePath, thesis.fileName)}
                        className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center justify-center text-sm"
                    >
                        <FontAwesomeIcon icon={faDownload} className="mr-2" /> Download
                    </button>
                )}

                {/* Admin/Owner Actions */}
                {isAdminView && thesis.status === 'pending' && onApprove && (
                    <button
                        onClick={() => onApprove(thesis._id)}
                        className="flex-1 min-w-[120px] bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center justify-center text-sm"
                    >
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-2" /> Approve
                    </button>
                )}
                {isAdminView && thesis.status === 'pending' && onReject && (
                    <button
                        onClick={() => onReject(thesis._id)}
                        className="flex-1 min-w-[120px] bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center justify-center text-sm"
                    >
                        <FontAwesomeIcon icon={faTimesCircle} className="mr-2" /> Reject
                    </button>
                )}

                {/* AI Check Buttons (visible to admin/owner) */}
                {(isAdminView || isOwnerOrAdmin) && (
                    <>
                        {onPlagiarismCheck && (
                            <button
                                onClick={() => onPlagiarismCheck(thesis._id)}
                                className="flex-1 min-w-[120px] bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center justify-center text-sm"
                                disabled={isPlagiarismChecking}
                            >
                                {isPlagiarismChecking ? (
                                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                ) : (
                                    <FontAwesomeIcon icon={faSearch} className="mr-2" />
                                )}
                                Plagiarism
                            </button>
                        )}
                        {onGrammarCheck && (
                            <button
                                onClick={() => onGrammarCheck(thesis._id)}
                                className="flex-1 min-w-[120px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center justify-center text-sm"
                                disabled={isGrammarChecking}
                            >
                                {isGrammarChecking ? (
                                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                ) : (
                                    <FontAwesomeIcon icon={faPenFancy} className="mr-2" />
                                )}
                                Grammar
                            </button>
                        )}
                    </>
                )}

                {/* Owner-specific actions (Edit/Delete) */}
                {isOwnerOrAdmin && (
                    <>
                        {onEdit && (
                            <button
                                onClick={() => onEdit(thesis._id)}
                                className="flex-1 min-w-[120px] bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center justify-center text-sm"
                            >
                                <FontAwesomeIcon icon={faEdit} className="mr-2" /> Edit
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(thesis._id)}
                                className="flex-1 min-w-[120px] bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center justify-center text-sm"
                            >
                                <FontAwesomeIcon icon={faTrashAlt} className="mr-2" /> Delete
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ThesisCard;
