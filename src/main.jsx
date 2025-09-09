// main.jsx - Updated for simplified interface

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Hide loading screen when React loads
document.addEventListener('DOMContentLoaded', () => {
  const hideLoadingScreen = () => {
    const root = document.getElementById('root');
    if (root && root.children.length > 0) {
      document.body.classList.add('loaded');
    } else {
      setTimeout(hideLoadingScreen, 100);
    }
  };
  setTimeout(hideLoadingScreen, 500);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
