// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadThesisPage from './pages/UploadThesisPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ViewThesisPage from './pages/ViewThesisPage';
import SearchResultsPage from './pages/SearchResultsPage'; // Keep this import now

const AppContent = () => {
  return (
    <Router>
      <Header />
      {/* Apply the dark gradient background to the main content area */}
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 font-inter">
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

const App = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App;
