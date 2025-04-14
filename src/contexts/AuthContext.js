// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

// Create context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check auth state on component mount
  const checkAuthentication = useCallback(async () => {
    setLoading(true);
    
    // Load deviceId from localStorage
    const storedDeviceId = localStorage.getItem('deviceId');
    if (storedDeviceId) {
      setDeviceId(storedDeviceId);
    }
    
    // Load transaction from localStorage
    const storedTransaction = localStorage.getItem('lastTransaction');
    if (storedTransaction) {
      try {
        setLastTransaction(JSON.parse(storedTransaction));
      } catch (error) {
        console.error('Error parsing transaction data:', error);
        localStorage.removeItem('lastTransaction');
      }
    }
    
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Verify token with backend
        const authData = await authService.checkAuth();
        if (authData.user) {
          setCurrentUser(authData.user);
          setIsAdmin(authData.user.isAdmin || false);
        } else {
          // Token invalid or expired
          setCurrentUser(null);
          setIsAdmin(false);
          localStorage.removeItem('auth_token');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setCurrentUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Initialize auth on component mount
  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);
  
  // Login with email/password
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      
      if (response.user) {
        setCurrentUser(response.user);
        setIsAdmin(response.user.isAdmin || false);
        return true;
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  // Logout
  const logout = async () => {
    try {
      authService.logout();
      setCurrentUser(null);
      setIsAdmin(false);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };
  
  // Set current device for client side
  const setCurrentDevice = (id) => {
    setDeviceId(id);
    if (id) {
      localStorage.setItem('deviceId', id);
    } else {
      localStorage.removeItem('deviceId');
    }
  };
  
  // Save transaction info
  const saveTransaction = (transaction) => {
    setLastTransaction(transaction);
    
    if (transaction) {
      localStorage.setItem('lastTransaction', JSON.stringify(transaction));
    } else {
      localStorage.removeItem('lastTransaction');
    }
  };
  
  // Provide context values
  const value = {
    currentUser,
    isAdmin,
    loading,
    deviceId,
    lastTransaction,
    login,
    logout,
    setCurrentDevice,
    saveTransaction,
    checkAuthentication
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};