// src/components/common/Notification.js
import React, { useState, useEffect } from 'react';

const Notification = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose,
  id
}) => {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration]);
  
  const handleClose = () => {
    setExiting(true);
    
    // Wait for animation to complete
    setTimeout(() => {
      setVisible(false);
      if (onClose) {
        onClose(id);
      }
    }, 300);
  };
  
  if (!visible) return null;
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };
  
  return (
    <div className={`eco-notification ${type} ${exiting ? 'exiting' : ''}`}>
      <div className="eco-notification-icon">
        {getIcon()}
      </div>
      <div className="eco-notification-content">
        {message}
      </div>
      <button 
        className="eco-notification-close" 
        onClick={handleClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export default Notification;