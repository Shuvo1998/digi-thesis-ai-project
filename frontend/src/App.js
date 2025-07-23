import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; // Keep existing CSS if you want, or remove if not needed

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import Header from './components/Layout/Header';
import HomePage from './pages/HomePage';
// We'll create these pages in the next steps
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import DashboardPage from './pages/DashboardPage';
// import NotFoundPage from './pages/NotFoundPage'; // Optional: for 404

function App() {
  return (
    <Router>
      <div className="App">
        {Header && <Header />} {/* Conditionally render Header if it exists */}

        <main>

          {/* Public Routes */}
          <Routes>
            <Route
              path="/"
              element={
                <HomePage />
              }
            />
            <Route path="/login" element={<h1>Login Page Content</h1>} /> {/* Placeholder */}
            <Route path="/register" element={<h1>Register Page Content</h1>} /> {/* Placeholder */}

            {/* Example of a protected route (we'll implement the actual protection later) */}
            <Route path="/dashboard" element={<h1>Dashboard Page Content (Protected)</h1>} /> {/* Placeholder */}

            {/* Catch-all for undefined routes */}
            <Route path="*" element={<h1>404: Page Not Found</h1>} />
          </Routes>
        </main>

        {/* We'll add a Footer component here later */}
      </div>
    </Router>
  );
}

export default App;