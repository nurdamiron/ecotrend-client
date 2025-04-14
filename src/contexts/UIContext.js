// src/contexts/UIContext.js
import React, { createContext, useContext, useState } from 'react';

// Create context
const UIContext = createContext(null);

// Types of notifications
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Provider component
export const UIProvider = ({ children }) => {
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  
  // Mobile menu state for global control
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Loading state for global spinner
  const [globalLoading, setGlobalLoading] = useState(false);
  
  // Modal state for global modals
  const [globalModal, setGlobalModal] = useState({
    isOpen: false,
    title: '',
    content: null,
    size: 'medium',
    onClose: () => {}
  });
  
  // Add notification
  const addNotification = (notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      type: notification.type || NOTIFICATION_TYPES.INFO,
      message: notification.message,
      title: notification.title || getDefaultTitle(notification.type),
      autoClose: notification.autoClose !== false,
      duration: notification.duration || 5000
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove notification after duration
    if (newNotification.autoClose) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
    
    return id;
  };
  
  // Get default title based on notification type
  const getDefaultTitle = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return 'Успешно';
      case NOTIFICATION_TYPES.ERROR:
        return 'Ошибка';
      case NOTIFICATION_TYPES.WARNING:
        return 'Предупреждение';
      case NOTIFICATION_TYPES.INFO:
      default:
        return 'Информация';
    }
  };
  
  // Remove notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };
  
  // Open global modal
  const openModal = ({ title, content, size = 'medium', onClose = () => {} }) => {
    setGlobalModal({
      isOpen: true,
      title,
      content,
      size,
      onClose: () => {
        setGlobalModal(prev => ({ ...prev, isOpen: false }));
        onClose();
      }
    });
  };
  
  // Close global modal
  const closeModal = () => {
    setGlobalModal(prev => ({ ...prev, isOpen: false }));
  };
  
  // Set global loading state
  const setLoading = (isLoading) => {
    setGlobalLoading(isLoading);
  };
  
  // Provide context values
  const value = {
    notifications,
    addNotification,
    removeNotification,
    mobileMenuOpen,
    toggleMobileMenu,
    globalLoading,
    setLoading,
    openModal,
    closeModal,
    globalModal
  };
  
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

// Hook for using UI context
export const useUI = () => {
  const context = useContext(UIContext);
  if (context === null) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};