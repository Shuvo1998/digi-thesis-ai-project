// frontend/src/App.js
import React from 'react'; // Removed useContext and useEffect
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext'; // Removed UserContext import
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadThesisPage from './pages/UploadThesisPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ViewThesisPage from './pages/ViewThesisPage';
import SearchResultsPage from './pages/SearchResultsPage'; // Assuming this page exists

// Main App component that wraps the routing and context
const AppContent = () => {
  // Removed useEffect for dark mode class
  // const { isDarkMode } = useContext(UserContext);
  // useEffect(() => {
  //     if (isDarkMode) {
  //         document.documentElement.classList.add('dark');
  //     } else {
  //         document.documentElement.classList.remove('dark');
  //     }
  // }, [isDarkMode]);

  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/upload-thesis" element={<UploadThesisPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
          <Route path="/view-thesis/:id" element={<ViewThesisPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          {/* Add other routes as needed */}
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

// Wrapper component to provide UserContext to the entire application
const App = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App;
