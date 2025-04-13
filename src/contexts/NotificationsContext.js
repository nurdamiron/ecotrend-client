// src/contexts/NotificationsContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from '../components/common/Notification';

// Create context
const NotificationsContext = createContext(null);

// Provider component
export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  // Add a notification
  const addNotification = useCallback((message, options = {}) => {
    const id = Date.now();
    const newNotification = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration || 5000,
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    return id;
  }, []);
  
  // Remove a notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);
  
  // Shorthand methods for specific notification types
  const success = useCallback((message, options = {}) => {
    return addNotification(message, { ...options, type: 'success' });
  }, [addNotification]);
  
  const error = useCallback((message, options = {}) => {
    return addNotification(message, { ...options, type: 'error' });
  }, [addNotification]);
  
  const warning = useCallback((message, options = {}) => {
    return addNotification(message, { ...options, type: 'warning' });
  }, [addNotification]);
  
  const info = useCallback((message, options = {}) => {
    return addNotification(message, { ...options, type: 'info' });
  }, [addNotification]);
  
  // Context value
  const value = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info
  };
  
  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <div className="eco-notifications-container">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            id={notification.id}
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={removeNotification}
          />
        ))}
      </div>
    </NotificationsContext.Provider>
  );
};

// Hook for using the context
export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === null) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};