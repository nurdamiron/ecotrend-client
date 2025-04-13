// src/components/common/ErrorMessage.js
import React, { useState, useEffect } from 'react';

const ErrorMessage = ({ message, onClose, autoClose = false, duration = 5000, type = 'error' }) => {
  const [visible, setVisible] = useState(true);
  
  // Auto close option
  useEffect(() => {
    if (autoClose && visible) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, visible]);
  
  // Handle close
  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      onClose();
    }
  };
  
  if (!visible) return null;
  
  // Determine classes based on type
  const getIconAndClass = () => {
    switch(type) {
      case 'warning':
        return {
          icon: '⚠️',
          className: 'eco-warning-message'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          className: 'eco-info-message'
        };
      case 'success':
        return {
          icon: '✅',
          className: 'eco-success-message'
        };
      case 'error':
      default:
        return {
          icon: '❌',
          className: 'eco-error-message'
        };
    }
  };
  
  const { icon, className } = getIconAndClass();
  
  return (
    <div className={`eco-message ${className}`}>
      <div className="eco-message-icon">{icon}</div>
      <div className="eco-message-content">
        {typeof message === 'string' ? (
          <p>{message}</p>
        ) : (
          message
        )}
      </div>
      {(onClose || autoClose) && (
        <button 
          type="button" 
          className="eco-message-close" 
          onClick={handleClose}
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;