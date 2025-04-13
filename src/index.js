// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/ecoStyle.css';
import './styles/adminStyle.css';
import './styles/components.css';
import './styles/notifications.css';
import App from './App';
import AppProviders from './contexts/AppProviders';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);