import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import reportWebVitals from './reportWebVitals'; // Optional: for performance metrics
import './index.css'; // Keep if you want global styling
import './styles/global.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
reportWebVitals(); // Optional: for performance metrics
// If you had reportWebVitals or App.css here and don't need them globally, you can remove/adjust.