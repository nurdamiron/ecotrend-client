// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import app from '../services/firebase';

// Firebase auth
const auth = getAuth(app);
const database = getDatabase(app);

// Create context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check if user has admin rights
  const checkAdminStatus = useCallback(async (user) => {
    if (!user) {
      setIsAdmin(false);
      return false;
    }
    
    try {
      const adminRef = ref(database, `admins/${user.uid}`);
      const snapshot = await get(adminRef);
      
      const hasAdminRights = snapshot.exists() && snapshot.val().role === 'admin';
      setIsAdmin(hasAdminRights);
      return hasAdminRights;
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      return false;
    }
  }, []);
  
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
    
    // Set up Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await checkAdminStatus(user);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    
    return unsubscribe;
  }, [checkAdminStatus]);
  
  // Initialize auth on component mount
  useEffect(() => {
    const unsubscribe = checkAuthentication();
    
    // Clean up the listener on unmount
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [checkAuthentication]);
  
  // Login with email/password
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await checkAdminStatus(userCredential.user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
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