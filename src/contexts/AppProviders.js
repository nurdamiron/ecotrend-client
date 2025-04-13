// src/contexts/AppProviders.js
import React from 'react';
import { AuthProvider } from './AuthContext';
import { UIProvider } from './UIContext';
import { NotificationsProvider } from './NotificationsContext';

// Combined provider component for app contexts
const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <UIProvider>
        <NotificationsProvider>
          {children}
        </NotificationsProvider>
      </UIProvider>
    </AuthProvider>
  );
};

export default AppProviders;