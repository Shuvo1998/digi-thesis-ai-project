// frontend/src/pages/AdminDashboardPage.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSpinner,
    faUserCog,
    faBookOpen,
    faSyncAlt
} from '@fortawesome/free-solid-svg-icons';
import ThesisCard from '../components/Thesis/ThesisCard';

const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const { user, loading: userLoading, showSnackbar } = useContext(UserContext);

    const [pendingTheses, setPendingTheses] = useState([]);
    const [loadingTheses, setLoadingTheses] = useState(true);
    const [error, setError] = useState('');

    const [showUserManagement, setShowUserManagement] = useState(false);

    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [userManagementError, setUserManagementError] = useState('');
    const [userPage, setUserPage] = useState(1);
    const [userTotalPages, setUserTotalPages] = useState(1);

    const fetchPendingTheses = useCallback(async () => {
        setLoadingTheses(true);
        setError('');
        try {
            const res = await axios.get('https://digi-thesis-ai-project.onrender.com/api/theses/pending');
            setPendingTheses(Array.isArray(res.data.theses) ? res.data.theses : []);
        } catch (err) {
            console.error('Failed to fetch pending theses:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.msg || 'Failed to load pending theses. Please try again.');
            setPendingTheses([]);
            showSnackbar(err.response?.data?.msg || 'Failed to load pending theses: Server Error', 'error');
        } finally {
            setLoadingTheses(false);
        }
    }, [showSnackbar]);

    const fetchUsers = useCallback(async (page = 1) => {
        setLoadingUsers(true);
        setUserManagementError('');
        try {
            const res = await axios.get(`https://digi-thesis-ai-project.onrender.com/api/users/all?page=${page}&limit=10`);
            setUsers(Array.isArray(res.data.users) ? res.data.users : []);
            setUserPage(res.data.currentPage || 1);
            setUserTotalPages(res.data.totalPages || 1);
        } catch (err) {
            console.error('Failed to fetch users:', err.response ? err.response.data : err.message);
            setUserManagementError(err.response?.data?.msg || 'Failed to load users. Please try again.');
            setUsers([]);
            showSnackbar(err.response?.data?.msg || 'Failed to load users: Server Error', 'error');
        } finally {
            setLoadingUsers(false);
        }
    }, [showSnackbar]);

    const handleApprove = useCallback(async (id) => {
        try {
            await axios.put(`https://digi-thesis-ai-project.onrender.com/api/theses/approve/${id}`);
            showSnackbar('Thesis approved!', 'success');
            fetchPendingTheses();
        } catch (err) {
            console.error('Approval failed:', err.response ? err.response.data : err.message);
            showSnackbar(err.response?.data?.msg || 'Failed to approve thesis.', 'error');
        }
    }, [showSnackbar, fetchPendingTheses]);

    const handleReject = useCallback(async (id) => {
        try {
            await axios.put(`https://digi-thesis-ai-project.onrender.com/api/theses/reject/${id}`);
            showSnackbar('Thesis rejected!', 'info');
            fetchPendingTheses();
        } catch (err) {
            console.error('Rejection failed:', err.response ? err.response.data : err.message);
            showSnackbar(err.response?.data?.msg || 'Failed to reject thesis.', 'error');
        }
    }, [showSnackbar, fetchPendingTheses]);

    const handlePlagiarismCheck = useCallback(async (id) => {
        try {
            const res = await axios.post(`https://digi-thesis-ai-project.onrender.com/api/theses/check-plagiarism/${id}`);
            showSnackbar(res.data.msg, 'success');
            fetchPendingTheses();
        } catch (err) {
            console.error('Plagiarism check failed:', err.response ? err.response.data : err.message);
            showSnackbar(err.response?.data?.msg || 'Failed to run plagiarism check.', 'error');
        }
    }, [showSnackbar, fetchPendingTheses]);

    const handleGrammarCheck = useCallback(async (id) => {
        try {
            const res = await axios.post(`https://digi-thesis-ai-project.onrender.com/api/theses/check-grammar/${id}`);
            showSnackbar(res.data.msg, 'success');
            fetchPendingTheses();
        } catch (err) {
            console.error('Grammar check failed:', err.response ? err.response.data : err.message);
            showSnackbar(err.response?.data?.msg || 'Failed to run grammar check.', 'error');
        }
    }, [showSnackbar, fetchPendingTheses]);

    const handleUserRoleChange = useCallback(async (userId, newRole) => {
        try {
            await axios.put(`https://digi-thesis-ai-project.onrender.com/api/users/role/${userId}`, { role: newRole });
            showSnackbar(`User role updated to ${newRole}`, 'success');
            fetchUsers(userPage);
        } catch (err) {
            console.error('Failed to update user role:', err.response ? err.response.data : err.message);
            showSnackbar(err.response?.data?.msg || 'Failed to update user role.', 'error');
        }
    }, [showSnackbar, fetchUsers, userPage]);

    useEffect(() => {
        if (!userLoading) {
            if (!user) {
                showSnackbar('Please log in to access the admin dashboard.', 'error');
                navigate('/login');
            } else if (user.role !== 'admin' && user.role !== 'supervisor') {
                showSnackbar('Access Denied. You do not have the required role.', 'error');
                navigate('/dashboard');
            }
        }
    }, [user, userLoading, navigate, showSnackbar]);

    useEffect(() => {
        if (!userLoading && user && (user.role === 'admin' || user.role === 'supervisor')) {
            if (showUserManagement) {
                fetchUsers(userPage);
            } else {
                fetchPendingTheses();
            }
        }
    }, [user, userLoading, userPage, showUserManagement, fetchPendingTheses, fetchUsers]);

    useEffect(() => {
        setUserPage(1);
    }, [showUserManagement]);

    if (userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 font-inter"> {/* Changed bg-gray-100 to bg-gray-900 */}
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-blue-400" /> {/* Adjusted spinner color */}
                <p className="ml-3 text-lg text-gray-300">Loading user data...</p> {/* Adjusted text color */}
            </div>
        );
    }

    if (!user || (user.role !== 'admin' && user.role !== 'supervisor')) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8 font-inter"> {/* Changed bg-gray-100 to bg-gray-900 */}
            <div className="max-w-7xl mx-auto bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl"> {/* Changed bg-white to bg-gray-800 */}
                <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-100 mb-6"> {/* Changed text-gray-800 to text-gray-100 */}
                    Admin/Supervisor Dashboard
                </h1>

                <div className="flex justify-center mb-6 space-x-4">
                    <button
                        onClick={() => setShowUserManagement(false)}
                        className={`px-6 py-3 rounded-md text-lg font-semibold transition duration-300 ${!showUserManagement ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
                    >
                        <FontAwesomeIcon icon={faBookOpen} className="mr-2" /> Pending Theses
                    </button>
                    {user.role === 'admin' && (
                        <button
                            onClick={() => setShowUserManagement(true)}
                            className={`px-6 py-3 rounded-md text-lg font-semibold transition duration-300 ${showUserManagement ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
                        >
                            <FontAwesomeIcon icon={faUserCog} className="mr-2" /> User Management
                        </button>
                    )}
                </div>

                {showUserManagement && user.role === 'admin' ? (
                    <section className="user-management-section mt-8">
                        <h2 className="text-2xl font-bold text-gray-100 mb-4 text-center">Manage Users</h2> {/* Changed text-gray-800 to text-gray-100 */}
                        <div className="flex justify-center mb-4">
                            <button
                                onClick={() => fetchUsers(userPage)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-200"
                            >
                                <FontAwesomeIcon icon={faSyncAlt} className="mr-2" /> Refresh Users
                            </button>
                        </div>
                        {loadingUsers ? (
                            <div className="flex justify-center items-center h-48">
                                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-blue-400" /> {/* Adjusted spinner color */}
                                <p className="ml-3 text-lg text-gray-300">Loading users...</p> {/* Adjusted text color */}
                            </div>
                        ) : userManagementError ? (
                            <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded relative" role="alert"> {/* Adjusted error alert colors */}
                                <strong className="font-bold">Error!</strong>
                                <span className="block sm:inline"> {userManagementError}</span>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center text-gray-300 text-lg py-10"> {/* Changed text-gray-600 to text-gray-300 */}
                                <p className="lead">No users found in the database (excluding yourself).</p>
                                <p className="text-sm text-gray-400">New users will appear here after registration.</p> {/* Adjusted text color */}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-gray-700 rounded-lg shadow overflow-hidden"> {/* Changed bg-white to bg-gray-700 */}
                                        <thead className="bg-gray-600"> {/* Changed bg-gray-200 to bg-gray-600 */}
                                            <tr>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-100">Username</th> {/* Changed to text-gray-100 */}
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-100">Email</th>    {/* Changed to text-gray-100 */}
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-100">Role</th>     {/* Changed to text-gray-100 */}
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-100">Actions</th>  {/* Changed to text-gray-100 */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((u) => (
                                                <tr key={u._id} className="border-b border-gray-500 last:border-b-0"> {/* Adjusted border color */}
                                                    <td className="py-3 px-4 text-gray-200">{u.username}</td> {/* Changed to text-gray-200 */}
                                                    <td className="py-3 px-4 text-gray-200">{u.email}</td>    {/* Changed to text-gray-200 */}
                                                    <td className="py-3 px-4">
                                                        <select
                                                            value={u.role}
                                                            onChange={(e) => handleUserRoleChange(u._id, e.target.value)}
                                                            className="p-2 border rounded-md bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
                                                            disabled={u._id === user.id}
                                                        >
                                                            <option value="user">User</option>
                                                            <option value="supervisor">Supervisor</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {/* Add more user actions here if needed */}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {userTotalPages > 1 && (
                                    <div className="flex justify-center items-center space-x-4 mt-6">
                                        <button
                                            onClick={() => setUserPage(userPage - 1)}
                                            disabled={userPage === 1}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-lg text-gray-300"> {/* Adjusted text color */}
                                            Page {userPage} of {userTotalPages}
                                        </span>
                                        <button
                                            onClick={() => setUserPage(userPage + 1)}
                                            disabled={userPage === userTotalPages}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                ) : (
                    <section className="pending-theses-section mt-8">
                        <h2 className="text-2xl font-bold text-gray-100 mb-4 text-center">Pending Theses for Review</h2> {/* Changed text-gray-800 to text-gray-100 */}
                        <div className="flex justify-center mb-4">
                            <button
                                onClick={fetchPendingTheses}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-200"
                            >
                                <FontAwesomeIcon icon={faSyncAlt} className="mr-2" /> Refresh Theses
                            </button>
                        </div>
                        {loadingTheses ? (
                            <div className="flex justify-center items-center h-48">
                                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-blue-400" /> {/* Adjusted spinner color */}
                                <p className="ml-3 text-lg text-gray-300">Loading pending theses...</p> {/* Adjusted text color */}
                            </div>
                        ) : error ? (
                            <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded relative" role="alert"> {/* Adjusted error alert colors */}
                                <strong className="font-bold">Error!</strong>
                                <span className="block sm:inline"> {error}</span>
                            </div>
                        ) : pendingTheses.length === 0 ? (
                            <div className="text-center text-gray-300 text-lg py-10"> {/* Changed text-gray-600 to text-gray-300 */}
                                <p className="lead">No pending theses found.</p>
                                <p className="text-sm text-gray-400">New submissions will appear here for your review.</p> {/* Adjusted text color */}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pendingTheses.map((thesis) => (
                                    <ThesisCard
                                        key={thesis._id}
                                        thesis={thesis}
                                        isAdminView={true}
                                        onApprove={handleApprove}
                                        onReject={handleReject}
                                        onPlagiarismCheck={handlePlagiarismCheck}
                                        onGrammarCheck={handleGrammarCheck}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
};

export default AdminDashboardPage;
