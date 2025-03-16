// src/contexts/AppProviders.js
import React from 'react';
import { AuthProvider } from './AuthContext';
import { UIProvider } from './UIContext';

// Объединяем все провайдеры в один компонент
const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <UIProvider>
        {children}
      </UIProvider>
    </AuthProvider>
  );
};

export default AppProviders;