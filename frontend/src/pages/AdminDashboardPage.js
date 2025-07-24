// frontend/src/pages/AdminDashboardPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import Snackbar from '../components/Common/Snackbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // ADDED: Import FontAwesomeIcon component
import {
    faCheckCircle, faTimesCircle, faDownload, faSpinner,
    faClipboardList, faUserGraduate, faCalendarAlt, faTags, faFilePdf,
    faUsers, faUserCircle, faEnvelope, faUserEdit, faChevronLeft, faChevronRight // Added icons for pagination
} from '@fortawesome/free-solid-svg-icons';
import ThesisCard from '../components/Thesis/ThesisCard';

const AdminDashboardPage = () => {
    const { user, loading: userLoading } = useContext(UserContext);
    const navigate = useNavigate();

    // State for pending theses tab
    const [pendingTheses, setPendingTheses] = useState([]);
    const [loadingPendingTheses, setLoadingPendingTheses] = useState(true);
    const [pendingThesesError, setPendingThesesError] = useState('');
    // Pagination state for pending theses
    const [currentPendingPage, setCurrentPendingPage] = useState(1);
    const [pendingItemsPerPage, setPendingItemsPerPage] = useState(10);
    const [totalPendingPages, setTotalPendingPages] = useState(1);
    const [totalPendingThesesCount, setTotalPendingThesesCount] = useState(0);

    // State for all users tab
    const [allUsers, setAllUsers] = useState([]);
    const [loadingAllUsers, setLoadingAllUsers] = useState(true);
    const [allUsersError, setAllUsersError] = useState('');
    // Pagination state for all users
    const [currentUsersPage, setCurrentUsersPage] = useState(1);
    const [usersItemsPerPage, setUsersItemsPerPage] = useState(10);
    const [totalUsersPages, setTotalUsersPages] = useState(1);
    const [totalUsersCount, setTotalUsersCount] = useState(0);

    // State for active tab
    const [activeTab, setActiveTab] = useState('pendingTheses'); // 'pendingTheses' or 'allUsers'

    const [snackbar, setSnackbar] = useState({
        show: false,
        message: '',
        type: 'info',
    });

    const [checkingPlagiarismId, setCheckingPlagiarismId] = useState(null); // For plagiarism button loading state
    const [checkingGrammarId, setCheckingGrammarId] = useState(null);    // For grammar button loading state

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, show: false });
    };

    // Function to check authorization and redirect if needed
    const checkAuthorization = () => {
        if (!userLoading && (!user || (user.role !== 'admin' && user.role !== 'supervisor'))) {
            setPendingThesesError('Access Denied: You do not have permission to view this page.');
            setAllUsersError('Access Denied: You do not have permission to view this page.');
            setSnackbar({
                show: true,
                message: 'Access Denied: You do not have permission to view this page.',
                type: 'error',
            });
            // IMPORTANT: Set loading states to false here if authorization fails
            setLoadingPendingTheses(false);
            setLoadingAllUsers(false);
            // Redirect if not authorized after a short delay
            setTimeout(() => navigate('/'), 3000);
            return false;
        }
        return true;
    };

    // Function to fetch pending theses with pagination
    const fetchPendingTheses = async (page = currentPendingPage, limit = pendingItemsPerPage) => {
        if (!checkAuthorization()) return;

        try {
            setLoadingPendingTheses(true);
            setPendingThesesError('');
            const res = await axios.get(`http://localhost:5000/api/theses/pending?page=${page}&limit=${limit}`, {
                headers: {
                    'x-auth-token': user.token,
                },
            });
            setPendingTheses(res.data.theses);
            setCurrentPendingPage(res.data.currentPage);
            setTotalPendingPages(res.data.totalPages);
            setTotalPendingThesesCount(res.data.totalTheses);
        } catch (err) {
            console.error('Failed to fetch pending theses:', err.response ? err.response.data : err.message);
            setPendingThesesError('Failed to load pending theses. Please try again.');
            setSnackbar({
                show: true,
                message: 'Failed to load pending theses. Please try again.',
                type: 'error',
            });
        } finally {
            setLoadingPendingTheses(false); // Ensure loading is always set to false
        }
    };

    // Function to fetch all users with pagination
    const fetchAllUsers = async (page = currentUsersPage, limit = usersItemsPerPage) => {
        if (!checkAuthorization()) return;

        try {
            setLoadingAllUsers(true);
            setAllUsersError('');
            const res = await axios.get(`http://localhost:5000/api/users/all?page=${page}&limit=${limit}`, {
                headers: {
                    'x-auth-token': user.token,
                },
            });
            setAllUsers(res.data.users);
            setCurrentUsersPage(res.data.currentPage);
            setTotalUsersPages(res.data.totalPages);
            setTotalUsersCount(res.data.totalUsers);
        } catch (err) {
            console.error('Failed to fetch all users:', err.response ? err.response.data : err.message);
            setAllUsersError('Failed to load user list. Please try again.');
            setSnackbar({
                show: true,
                message: 'Failed to load user list. Please try again.',
                type: 'error',
            });
        } finally {
            setLoadingAllUsers(false); // Ensure loading is always set to false
        }
    };

    // Handle User Role Update
    const handleUserRoleChange = async (userId, newRole) => {
        // Prevent admin/supervisor from changing their own role
        if (user.id === userId) {
            setSnackbar({ show: true, message: 'You cannot change your own role.', type: 'error' });
            return;
        }
        // Optional: Prevent supervisors from changing admin roles
        if (user.role === 'supervisor' && newRole === 'admin') {
            setSnackbar({ show: true, message: 'Supervisors cannot promote to admin role.', type: 'error' });
            return;
        }
        if (user.role === 'supervisor' && allUsers.find(u => u._id === userId)?.role === 'admin') {
            setSnackbar({ show: true, message: 'Supervisors cannot change administrator roles.', type: 'error' });
            return;
        }


        try {
            const res = await axios.put(`http://localhost:5000/api/users/role/${userId}`, { role: newRole }, {
                headers: {
                    'x-auth-token': user.token,
                },
            });
            setSnackbar({ show: true, message: res.data.msg, type: 'success' });
            fetchAllUsers(); // Re-fetch user list to reflect changes
        } catch (err) {
            console.error('Failed to update user role:', err.response ? err.response.data : err.message);
            const errorMessage = err.response && err.response.data && err.response.data.errors
                ? err.response.data.errors[0].msg
                : 'Failed to update user role. Please try again.';
            setSnackbar({ show: true, message: errorMessage, type: 'error' });
        }
    };


    // Fetch data based on active tab and user context changes
    useEffect(() => {
        if (!userLoading && user) {
            if (activeTab === 'pendingTheses') {
                fetchPendingTheses(currentPendingPage, pendingItemsPerPage);
            } else if (activeTab === 'allUsers') {
                fetchAllUsers(currentUsersPage, usersItemsPerPage);
            }
        } else if (!userLoading && !user) {
            // If user context has loaded and user is not authenticated, check authorization
            checkAuthorization();
        }
    }, [user, userLoading, activeTab, currentPendingPage, pendingItemsPerPage, currentUsersPage, usersItemsPerPage]); // Added pagination states to dependencies

    const handleApprove = async (thesisId) => {
        if (!checkAuthorization()) return;
        try {
            await axios.put(`http://localhost:5000/api/theses/approve/${thesisId}`, {}, {
                headers: {
                    'x-auth-token': user.token,
                },
            });
            setSnackbar({ show: true, message: 'Thesis approved successfully!', type: 'success' });
            fetchPendingTheses(); // Re-fetch current page of pending theses
        } catch (err) {
            console.error('Failed to approve thesis:', err.response ? err.response.data : err.message);
            setSnackbar({ show: true, message: 'Failed to approve thesis. Please try again.', type: 'error' });
        }
    };

    const handleReject = async (thesisId) => {
        if (!checkAuthorization()) return;
        // Changed window.confirm to a Snackbar for consistency. You can implement a custom modal if needed.
        setSnackbar({
            show: true,
            message: 'Are you sure you want to reject this thesis? This action cannot be undone.',
            type: 'warning',
            duration: 5000, // Give user time to see the message
            onClose: async () => { // Action to perform if user "confirms" by letting snackbar close
                // This is a simplified "confirmation". For true confirmation, a modal is better.
                // For now, if they don't click away, we assume they proceed.
                try {
                    await axios.put(`http://localhost:5000/api/theses/reject/${thesisId}`, {}, {
                        headers: {
                            'x-auth-token': user.token,
                        },
                    });
                    setSnackbar({ show: true, message: 'Thesis rejected successfully!', type: 'success' });
                    fetchPendingTheses(); // Re-fetch current page of pending theses
                } catch (err) {
                    console.error('Failed to reject thesis:', err.response ? err.response.data : err.message);
                    setSnackbar({ show: true, message: 'Failed to reject thesis. Please try again.', type: 'error' });
                }
            }
        });
    };


    const handleDownload = (filePath, fileName) => {
        const fileUrl = `http://localhost:5000/${filePath.replace(/\\/g, '/')}`;
        window.open(fileUrl, '_blank');
        setSnackbar({ show: true, message: `Downloading ${fileName}...`, type: 'info' });
    };

    // --- Handle Plagiarism Check ---
    const handlePlagiarismCheck = async (thesisId) => {
        setCheckingPlagiarismId(thesisId);
        setSnackbar({ show: false, message: '', type: 'info' });

        if (!user || !user.token) {
            setSnackbar({ show: true, message: 'You must be logged in to perform this action.', type: 'error' });
            setCheckingPlagiarismId(null);
            return;
        }

        try {
            const res = await axios.post(`http://localhost:5000/api/theses/check-plagiarism/${thesisId}`, {}, {
                headers: {
                    'x-auth-token': user.token,
                },
            });
            setSnackbar({ show: true, message: res.data.msg, type: 'success' });
            // Re-fetch list to update the plagiarismResult on the card
            fetchPendingTheses(currentPendingPage, pendingItemsPerPage); // Re-fetch current page
        } catch (err) {
            console.error('Plagiarism check failed:', err.response ? err.response.data : err.message);
            const errorMessage = err.response && err.response.data && err.response.data.msg
                ? err.response.data.msg
                : 'Plagiarism check failed. Please try again.';
            setSnackbar({ show: true, message: errorMessage, type: 'error' });
        } finally {
            setCheckingPlagiarismId(null);
        }
    };

    // --- Handle Grammar Check ---
    const handleGrammarCheck = async (thesisId) => {
        setCheckingGrammarId(thesisId);
        setSnackbar({ show: false, message: '', type: 'info' });

        if (!user || !user.token) {
            setSnackbar({ show: true, message: 'You must be logged in to perform this action.', type: 'error' });
            setCheckingGrammarId(null);
            return;
        }

        try {
            const res = await axios.post(`http://localhost:5000/api/theses/check-grammar/${thesisId}`, {}, {
                headers: {
                    'x-auth-token': user.token,
                },
            });
            setSnackbar({ show: true, message: res.data.msg, type: 'success' });
            // Re-fetch list to update the grammarResult on the card
            fetchPendingTheses(currentPendingPage, pendingItemsPerPage); // Re-fetch current page
        } catch (err) {
            console.error('Grammar check failed:', err.response ? err.response.data : err.message);
            const errorMessage = err.response && err.response.data && err.response.data.msg
                ? err.response.data.msg
                : 'Grammar check failed. Please try again.';
            setSnackbar({ show: true, message: errorMessage, type: 'error' });
        } finally {
            setCheckingGrammarId(null);
        }
    };


    if (userLoading || loadingPendingTheses || loadingAllUsers) { // Combined loading states
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
                <p className="ms-3 text-white">Loading Admin Dashboard...</p>
            </div>
        );
    }

    // Render access denied state if checkAuthorization returns false
    if (!user || (user.role !== 'admin' && user.role !== 'supervisor')) {
        return (
            <div className="container py-5 text-center">
                <Snackbar message={snackbar.message} type={snackbar.type} show={snackbar.show} onClose={handleCloseSnackbar} />
                <h1 className="text-danger mb-4">Access Denied</h1>
                <p className="lead text-white">{pendingThesesError || allUsersError}</p>
                <p className="text-white-50">Please ensure you are logged in with an administrator or supervisor account.</p>
            </div>
        );
    }

    // Pagination controls component (reusable)
    const PaginationControls = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange }) => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }

        return (
            <nav className="d-flex justify-content-between align-items-center mt-4">
                <div className="d-flex align-items-center">
                    <span className="text-white-50 me-2">Items per page:</span>
                    <select
                        className="form-select form-select-sm bg-dark text-white"
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
                        style={{ width: 'auto' }}
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
                <ul className="pagination justify-content-center m-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link bg-dark text-white border-secondary" onClick={() => onPageChange(currentPage - 1)}>
                            <FontAwesomeIcon icon={faChevronLeft} /> Previous
                        </button>
                    </li>
                    {pageNumbers.map((number) => (
                        <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                            <button
                                className={`page-link ${currentPage === number ? 'bg-primary border-primary' : 'bg-dark text-white border-secondary'}`}
                                onClick={() => onPageChange(number)}
                            >
                                {number}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link bg-dark text-white border-secondary" onClick={() => onPageChange(currentPage + 1)}>
                            Next <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </li>
                </ul>
                <div className="text-white-50">
                    Total: {totalItems}
                </div>
            </nav>
        );
    };


    return (
        <div className="container py-5">
            <Snackbar message={snackbar.message} type={snackbar.type} show={snackbar.show} onClose={handleCloseSnackbar} />

            <h1 className="text-center mb-5 text-white">
                <FontAwesomeIcon icon={faClipboardList} className="me-3" /> Admin Dashboard
            </h1>

            {/* Tab Navigation */}
            <ul className="nav nav-tabs nav-justified mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'pendingTheses' ? 'active' : ''} text-white`}
                        onClick={() => setActiveTab('pendingTheses')}
                        style={{ backgroundColor: activeTab === 'pendingTheses' ? 'rgba(0, 123, 255, 0.7)' : 'rgba(0,0,0,0.3)', borderColor: 'transparent' }}
                    >
                        <FontAwesomeIcon icon={faClipboardList} className="me-2" /> Pending Theses
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'allUsers' ? 'active' : ''} text-white`}
                        onClick={() => setActiveTab('allUsers')}
                        style={{ backgroundColor: activeTab === 'allUsers' ? 'rgba(0, 123, 255, 0.7)' : 'rgba(0,0,0,0.3)', borderColor: 'transparent' }}
                    >
                        <FontAwesomeIcon icon={faUsers} className="me-2" /> All Users
                    </button>
                </li>
            </ul>

            {/* Tab Content */}
            <div className="tab-content">
                {/* Pending Theses Tab Content */}
                {activeTab === 'pendingTheses' && (
                    <div className="tab-pane fade show active">
                        {loadingPendingTheses ? (
                            <div className="d-flex justify-content-center align-items-center py-5">
                                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
                                <p className="ms-3 text-white">Loading pending theses...</p>
                            </div>
                        ) : pendingThesesError ? (
                            <div className="alert alert-danger text-center">{pendingThesesError}</div>
                        ) : pendingTheses.length === 0 ? (
                            <div className="text-center text-white-50">
                                <p className="lead">No pending theses found at the moment.</p>
                                <p>Great job! All theses are up-to-date.</p>
                            </div>
                        ) : (
                            <>
                                <div className="row row-cols-1 g-4">
                                    {pendingTheses.map((thesis) => (
                                        <div className="col" key={thesis._id}>
                                            <ThesisCard
                                                thesis={thesis}
                                                isOwnerOrAdmin={true} // Admin/Supervisor has owner-like permissions for checks
                                                checkingPlagiarismId={checkingPlagiarismId}
                                                checkingGrammarId={checkingGrammarId}
                                                onPlagiarismCheck={handlePlagiarismCheck}
                                                onGrammarCheck={handleGrammarCheck}
                                                onDownload={handleDownload}
                                                onApprove={handleApprove}
                                                onReject={handleReject}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <PaginationControls
                                    currentPage={currentPendingPage}
                                    totalPages={totalPendingPages}
                                    totalItems={totalPendingThesesCount}
                                    itemsPerPage={pendingItemsPerPage}
                                    onPageChange={setCurrentPendingPage}
                                    onItemsPerPageChange={(limit) => {
                                        setPendingItemsPerPage(limit);
                                        setCurrentPendingPage(1); // Reset to first page when items per page changes
                                    }}
                                />
                            </>
                        )}
                    </div>
                )}

                {/* All Users Tab Content */}
                {activeTab === 'allUsers' && (
                    <div className="tab-pane fade show active">
                        {loadingAllUsers ? (
                            <div className="d-flex justify-content-center align-items-center py-5">
                                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
                                <p className="ms-3 text-white">Loading users...</p>
                            </div>
                        ) : allUsersError ? (
                            <div className="alert alert-danger text-center">{allUsersError}</div>
                        ) : allUsers.length === 0 ? (
                            <div className="text-center text-white-50">
                                <p className="lead">No users found.</p>
                            </div>
                        ) : (
                            <>
                                <div className="table-responsive">
                                    <table className="table table-striped table-hover bg-light text-dark rounded-3 overflow-hidden shadow-sm">
                                        <thead className="table-primary">
                                            <tr>
                                                <th scope="col">#</th>
                                                <th scope="col">Username</th>
                                                <th scope="col">Email</th>
                                                <th scope="col">Role</th>
                                                <th scope="col">Actions</th> {/* Added Actions column */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allUsers.map((userItem, index) => (
                                                <tr key={userItem._id}>
                                                    <th scope="row">{(currentUsersPage - 1) * usersItemsPerPage + index + 1}</th>
                                                    <td><FontAwesomeIcon icon={faUserCircle} className="me-2" />{userItem.username}</td>
                                                    <td><FontAwesomeIcon icon={faEnvelope} className="me-2" />{userItem.email}</td>
                                                    <td>
                                                        <span className={`badge ${userItem.role === 'admin' ? 'bg-danger' : userItem.role === 'supervisor' ? 'bg-info' : 'bg-secondary'}`}>
                                                            {userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {/* Role selection dropdown */}
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={userItem.role}
                                                            onChange={(e) => handleUserRoleChange(userItem._id, e.target.value)}
                                                            disabled={user.id === userItem._id || (user.role === 'supervisor' && userItem.role === 'admin')} // Disable if changing own role or supervisor trying to change admin
                                                        >
                                                            <option value="user">User</option>
                                                            <option value="supervisor">Supervisor</option>
                                                            {user.role === 'admin' && <option value="admin">Admin</option>} {/* Only admin can assign admin role */}
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <PaginationControls
                                    currentPage={currentUsersPage}
                                    totalPages={totalUsersPages}
                                    totalItems={totalUsersCount}
                                    itemsPerPage={usersItemsPerPage}
                                    onPageChange={setCurrentUsersPage}
                                    onItemsPerPageChange={(limit) => {
                                        setUsersItemsPerPage(limit);
                                        setCurrentUsersPage(1); // Reset to first page when items per page changes
                                    }}
                                />
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboardPage;
