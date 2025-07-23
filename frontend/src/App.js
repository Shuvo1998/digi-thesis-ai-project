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
import AdminDashboardPage from './pages/AdminDashboardPage'; // <-- IMPORT NEW ADMIN DASHBOARD PAGE

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
            {/* ADDED: Protected route for Admin Dashboard Page */}
            <Route
              path="/admin-dashboard"
              element={
                <PrivateRoute>
                  <AdminDashboardPage /> {/* Render the new AdminDashboardPage */}
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
