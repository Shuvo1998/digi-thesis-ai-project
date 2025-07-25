// frontend/src/pages/AdminDashboardPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios'; // Ensure this is the correct axios instance
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faTimesCircle, faSearch, faUserCog } from '@fortawesome/free-solid-svg-icons';
import ThesisCard from '../components/Thesis/ThesisCard';
import Snackbar from '../components/Common/Snackbar'; // Assuming Snackbar is still needed locally for now

const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const { user, loading: userLoading, showSnackbar } = useContext(UserContext); // Get showSnackbar from context

    const [pendingTheses, setPendingTheses] = useState([]);
    const [loadingTheses, setLoadingTheses] = useState(true);
    const [error, setError] = useState('');
    const [showUserManagement, setShowUserManagement] = useState(false); // State to toggle user management view

    // User Management states
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [userManagementError, setUserManagementError] = useState('');
    const [userPage, setUserPage] = useState(1);
    const [userTotalPages, setUserTotalPages] = useState(1);

    // Effect to redirect if user is not authorized or not logged in
    useEffect(() => {
        if (!userLoading) { // Wait until user context has finished loading
            if (!user) {
                showSnackbar('Please log in to access the admin dashboard.', 'error');
                navigate('/login');
            } else if (user.role !== 'admin' && user.role !== 'supervisor') {
                showSnackbar('Access Denied. You do not have the required role.', 'error');
                navigate('/dashboard'); // Redirect to regular dashboard or home
            }
        }
    }, [user, userLoading, navigate, showSnackbar]);

    // Function to fetch pending theses
    const fetchPendingTheses = async () => {
        setLoadingTheses(true);
        setError('');
        try {
            // Ensure token is set before making this call.
            // UserContext's useEffect should handle axios.defaults.headers.common['x-auth-token']
            const res = await axios.get('https://digi-thesis-ai-project.onrender.com/api/theses/pending');
            setPendingTheses(res.data.theses || []); // Defensive check for array
            showSnackbar('Pending theses loaded successfully.', 'success');
        } catch (err) {
            console.error('Failed to fetch pending theses:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.msg || 'Failed to load pending theses. Please try again.');
            setPendingTheses([]); // Clear theses on error
            showSnackbar(err.response?.data?.msg || 'Failed to load pending theses: Server Error', 'error');
        } finally {
            setLoadingTheses(false);
        }
    };

    // Function to fetch all users (for admin/supervisor)
    const fetchUsers = async (page = 1) => {
        setLoadingUsers(true);
        setUserManagementError('');
        try {
            const res = await axios.get(`https://digi-thesis-ai-project.onrender.com/api/users/all?page=${page}&limit=10`);
            setUsers(res.data.users || []); // Defensive check for array
            setUserPage(res.data.currentPage || 1);
            setUserTotalPages(res.data.totalPages || 1);
            showSnackbar('Users loaded successfully.', 'success');
        } catch (err) {
            console.error('Failed to fetch users:', err.response ? err.response.data : err.message);
            setUserManagementError(err.response?.data?.msg || 'Failed to load users. Please try again.');
            setUsers([]); // Clear users on error
            showSnackbar(err.response?.data?.msg || 'Failed to load users: Server Error', 'error');
        } finally {
            setLoadingUsers(false);
        }
    };

    // Effect to fetch data only when user is loaded and authorized
    useEffect(() => {
        if (!userLoading && user && (user.role === 'admin' || user.role === 'supervisor')) {
            fetchPendingTheses();
            fetchUsers(userPage); // Fetch users when authorized
        }
    }, [user, userLoading, userPage]); // Depend on user and userLoading

    const handleApprove = async (id) => {
        try {
            await axios.put(`https://digi-thesis-ai-project.onrender.com/api/theses/approve/${id}`);
            showSnackbar('Thesis approved!', 'success');
            fetchPendingTheses(); // Refresh the list
        } catch (err) {
            console.error('Approval failed:', err.response ? err.response.data : err.message);
            showSnackbar(err.response?.data?.msg || 'Failed to approve thesis.', 'error');
        }
    };

    const handleReject = async (id) => {
        try {
            await axios.put(`https://digi-thesis-ai-project.onrender.com/api/theses/reject/${id}`);
            showSnackbar('Thesis rejected!', 'info');
            fetchPendingTheses(); // Refresh the list
        } catch (err) {
            console.error('Rejection failed:', err.response ? err.response.data : err.message);
            showSnackbar(err.response?.data?.msg || 'Failed to reject thesis.', 'error');
        }
    };

    const handlePlagiarismCheck = async (id) => {
        try {
            const res = await axios.post(`https://digi-thesis-ai-project.onrender.com/api/theses/check-plagiarism/${id}`);
            showSnackbar(res.data.msg, 'success');
            fetchPendingTheses(); // Refresh to show updated result
        } catch (err) {
            console.error('Plagiarism check failed:', err.response ? err.response.data : err.message);
            showSnackbar(err.response?.data?.msg || 'Failed to run plagiarism check.', 'error');
        }
    };

    const handleGrammarCheck = async (id) => {
        try {
            const res = await axios.post(`https://digi-thesis-ai-project.onrender.com/api/theses/check-grammar/${id}`);
            showSnackbar(res.data.msg, 'success');
            fetchPendingTheses(); // Refresh to show updated result
        } catch (err) {
            console.error('Grammar check failed:', err.response ? err.response.data : err.message);
            showSnackbar(err.response?.data?.msg || 'Failed to run grammar check.', 'error');
        }
    };

    const handleUserRoleChange = async (userId, newRole) => {
        try {
            await axios.put(`https://digi-thesis-ai-project.onrender.com/api/users/role/${userId}`, { role: newRole });
            showSnackbar(`User role updated to ${newRole}`, 'success');
            fetchUsers(userPage); // Refresh user list
        } catch (err) {
            console.error('Failed to update user role:', err.response ? err.response.data : err.message);
            showSnackbar(err.response?.data?.msg || 'Failed to update user role.', 'error');
        }
    };

    if (userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-blue-500" />
                <p className="ml-3 text-lg text-gray-600">Loading user data...</p>
            </div>
        );
    }

    // Only render dashboard content if user is authorized
    if (!user || (user.role !== 'admin' && user.role !== 'supervisor')) {
        // The useEffect above will handle redirection, so this state should be brief
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-inter">
            <div className="max-w-7xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-xl">
                <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-6">
                    Admin/Supervisor Dashboard
                </h1>

                <div className="flex justify-center mb-6 space-x-4">
                    <button
                        onClick={() => setShowUserManagement(false)}
                        className={`px-6 py-3 rounded-md text-lg font-semibold transition duration-300 ${!showUserManagement ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        <FontAwesomeIcon icon={faBookOpen} className="mr-2" /> Pending Theses
                    </button>
                    {user.role === 'admin' && ( // Only admin can see user management
                        <button
                            onClick={() => setShowUserManagement(true)}
                            className={`px-6 py-3 rounded-md text-lg font-semibold transition duration-300 ${showUserManagement ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            <FontAwesomeIcon icon={faUserCog} className="mr-2" /> User Management
                        </button>
                    )}
                </div>

                {showUserManagement && user.role === 'admin' ? (
                    // User Management Section
                    <section className="user-management-section mt-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Manage Users</h2>
                        {loadingUsers ? (
                            <div className="flex justify-center items-center h-48">
                                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-blue-500" />
                                <p className="ml-3 text-lg text-gray-600">Loading users...</p>
                            </div>
                        ) : userManagementError ? (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <strong className="font-bold">Error!</strong>
                                <span className="block sm:inline"> {userManagementError}</span>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center text-gray-600 text-lg py-10">
                                No users found.
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
                                        <thead className="bg-gray-200">
                                            <tr>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Username</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Email</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Role</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((u) => (
                                                <tr key={u._id} className="border-b border-gray-200 last:border-b-0">
                                                    <td className="py-3 px-4 text-gray-800">{u.username}</td>
                                                    <td className="py-3 px-4 text-gray-800">{u.email}</td>
                                                    <td className="py-3 px-4">
                                                        <select
                                                            value={u.role}
                                                            onChange={(e) => handleUserRoleChange(u._id, e.target.value)}
                                                            className="p-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            disabled={u._id === user.id} // Prevent changing own role
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
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-lg text-gray-700">
                                            Page {userPage} of {userTotalPages}
                                        </span>
                                        <button
                                            onClick={() => setUserPage(userPage + 1)}
                                            disabled={userPage === userTotalPages}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                ) : (
                    // Pending Theses Section
                    <section className="pending-theses-section mt-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Pending Theses for Review</h2>
                        {loadingTheses ? (
                            <div className="flex justify-center items-center h-48">
                                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-blue-500" />
                                <p className="ml-3 text-lg text-gray-600">Loading pending theses...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <strong className="font-bold">Error!</strong>
                                <span className="block sm:inline"> {error}</span>
                            </div>
                        ) : pendingTheses.length === 0 ? (
                            <div className="text-center text-gray-600 text-lg py-10">
                                No pending theses found.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pendingTheses.map((thesis) => (
                                    <ThesisCard
                                        key={thesis._id}
                                        thesis={thesis}
                                        isAdminView={true} // Indicate it's admin view for action buttons
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
            {/* Snackbar is now rendered globally by UserProvider, no need for local render */}
            {/* <Snackbar
                message={snackbar.message}
                type={snackbar.type}
                show={snackbar.show}
                onClose={handleCloseSnackbar}
            /> */}
        </div>
    );
};

export default AdminDashboardPage;
