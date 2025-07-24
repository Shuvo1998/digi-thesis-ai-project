// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import components and pages
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/Routing/PrivateRoute';
import UploadThesisPage from './pages/UploadThesisPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ViewThesisPage from './pages/ViewThesisPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage'; // <-- IMPORT NEW PROFILE PAGE

// Import global styles and Bootstrap CSS
import './styles/global.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />

        <main className="flex-grow-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/thesis/:id" element={<ViewThesisPage />} />
            <Route path="/search" element={<SearchPage />} />

            {/* Protected Routes (Wrap with PrivateRoute) */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/upload-thesis"
              element={
                <PrivateRoute>
                  <UploadThesisPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <PrivateRoute>
                  <AdminDashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile" // <-- ADDED: Protected route for user profile
              element={
                <PrivateRoute>
                  <ProfilePage /> {/* Render the new ProfilePage */}
                </PrivateRoute>
              }
            />

            <Route path="*" element={<h1>404: Page Not Found</h1>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
