// frontend/src/pages/UploadThesisPage.js
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faFilePdf, faSpinner, faBook } from '@fortawesome/free-solid-svg-icons';

const UploadThesisPage = () => {
    const navigate = useNavigate();
    const { user, loading: userLoading, showSnackbar } = useContext(UserContext);

    const [formData, setFormData] = useState({
        title: '',
        abstract: '',
        keywords: '', // Comma-separated string
        authorName: '',
        department: '',
        submissionYear: '',
        isPublic: true, // Default to public
        thesisFile: null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { title, abstract, keywords, authorName, department, submissionYear, isPublic, thesisFile } = formData;

    // Redirect if user is not logged in
    useEffect(() => {
        if (!userLoading && !user) {
            showSnackbar('Please log in to upload a thesis.', 'error');
            navigate('/login');
        }
    }, [user, userLoading, navigate, showSnackbar]);

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const onFileChange = e => {
        setFormData({ ...formData, thesisFile: e.target.files[0] });
        if (error) setError('');
    };

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!thesisFile) {
            setError('Please select a PDF file to upload.');
            showSnackbar('Please select a PDF file to upload.', 'error');
            setLoading(false);
            return;
        }

        const data = new FormData();
        data.append('title', title);
        data.append('abstract', abstract);
        data.append('keywords', keywords); // Send as string, backend will split
        data.append('authorName', authorName);
        data.append('department', department);
        data.append('submissionYear', submissionYear);
        data.append('isPublic', isPublic);
        data.append('thesisFile', thesisFile);

        try {
            // Axios default header (x-auth-token) is set by UserContext
            const res = await axios.post('https://digi-thesis-ai-project.onrender.com/api/theses/upload', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            showSnackbar(res.data.msg || 'Thesis uploaded successfully!', 'success');
            setFormData({
                title: '', abstract: '', keywords: '', authorName: '', department: '',
                submissionYear: '', isPublic: true, thesisFile: null,
            }); // Clear form
            document.getElementById('thesisFile').value = ''; // Clear file input
        } catch (err) {
            console.error('Upload failed:', err.response ? err.response.data : err.message);
            const errorMessage = err.response && err.response.data && err.response.data.msg
                ? err.response.data.msg
                : (err.response && err.response.data && err.response.data.errors && err.response.data.errors[0] && err.response.data.errors[0].msg)
                    ? err.response.data.errors[0].msg
                    : 'Upload failed. Please try again.';
            setError(errorMessage);
            showSnackbar(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 font-inter">
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-blue-400" />
                <p className="ml-3 text-lg text-gray-300">Loading user data...</p>
            </div>
        );
    }

    // If user is not authenticated after loading, display nothing (redirection handled by useEffect)
    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-900 font-inter p-4"> {/* Dark theme background */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full"> {/* Dark theme card background */}
                <h2 className="text-center mb-6 text-gray-100 text-3xl font-bold">
                    <FontAwesomeIcon icon={faUpload} className="mr-3 text-blue-400" /> Upload Your Thesis
                </h2>
                {error && <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
                <form onSubmit={onSubmit}>
                    {/* Title */}
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-gray-300 text-sm font-bold mb-2">Title</label>
                        <input
                            type="text"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-100 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500"
                            id="title"
                            name="title"
                            value={title}
                            onChange={onChange}
                            placeholder="e.g., A Novel Approach to AI in Education"
                            required
                        />
                    </div>

                    {/* Abstract */}
                    <div className="mb-4">
                        <label htmlFor="abstract" className="block text-gray-300 text-sm font-bold mb-2">Abstract</label>
                        <textarea
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-100 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 h-32"
                            id="abstract"
                            name="abstract"
                            value={abstract}
                            onChange={onChange}
                            placeholder="Provide a concise summary of your thesis..."
                            required
                        ></textarea>
                    </div>

                    {/* Keywords */}
                    <div className="mb-4">
                        <label htmlFor="keywords" className="block text-gray-300 text-sm font-bold mb-2">Keywords (comma-separated)</label>
                        <input
                            type="text"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-100 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500"
                            id="keywords"
                            name="keywords"
                            value={keywords}
                            onChange={onChange}
                            placeholder="e.g., AI, Education, Machine Learning"
                            required
                        />
                    </div>

                    {/* Author Name */}
                    <div className="mb-4">
                        <label htmlFor="authorName" className="block text-gray-300 text-sm font-bold mb-2">Author Name</label>
                        <input
                            type="text"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-100 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500"
                            id="authorName"
                            name="authorName"
                            value={authorName}
                            onChange={onChange}
                            placeholder="e.g., John Doe"
                            required
                        />
                    </div>

                    {/* Department */}
                    <div className="mb-4">
                        <label htmlFor="department" className="block text-gray-300 text-sm font-bold mb-2">Department</label>
                        <input
                            type="text"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-100 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500"
                            id="department"
                            name="department"
                            value={department}
                            onChange={onChange}
                            placeholder="e.g., Computer Science"
                            required
                        />
                    </div>

                    {/* Submission Year */}
                    <div className="mb-4">
                        <label htmlFor="submissionYear" className="block text-gray-300 text-sm font-bold mb-2">Submission Year</label>
                        <input
                            type="number"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-100 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500"
                            id="submissionYear"
                            name="submissionYear"
                            value={submissionYear}
                            onChange={onChange}
                            placeholder="e.g., 2023"
                            required
                        />
                    </div>

                    {/* Is Public Checkbox */}
                    <div className="mb-4 flex items-center">
                        <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                            id="isPublic"
                            name="isPublic"
                            checked={isPublic}
                            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                        />
                        <label htmlFor="isPublic" className="ml-2 block text-gray-300 text-sm">Make Publicly Accessible</label>
                    </div>

                    {/* Thesis File Upload */}
                    <div className="mb-6">
                        <label htmlFor="thesisFile" className="block text-gray-300 text-sm font-bold mb-2">
                            <FontAwesomeIcon icon={faFilePdf} className="mr-2" />Upload PDF File
                        </label>
                        <input
                            type="file"
                            className="block w-full text-sm text-gray-300
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-500 file:text-white
                            hover:file:bg-blue-600
                            file:transition file:duration-200
                            bg-gray-700 rounded-md cursor-pointer" // Tailwind file input styling
                            id="thesisFile"
                            name="thesisFile"
                            accept=".pdf"
                            onChange={onFileChange}
                            required
                        />
                        {thesisFile && (
                            <p className="mt-2 text-sm text-gray-400">Selected file: {thesisFile.name}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-center">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition duration-200"
                            disabled={loading}
                        >
                            {loading ? (
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                            ) : (
                                <FontAwesomeIcon icon={faUpload} className="mr-2" />
                            )}
                            {loading ? 'Uploading...' : 'Submit Thesis'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadThesisPage;
