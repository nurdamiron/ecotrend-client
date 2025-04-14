// src/components/common/NotificationSystem.js
import React, { useState, useEffect } from 'react';
import { useUI, NOTIFICATION_TYPES } from '../../contexts/UIContext';

const NotificationSystem = () => {
  const { notifications, removeNotification } = useUI();
  
  // State to track notification animations
  const [notificationStates, setNotificationStates] = useState({});
  
  // Update animation states when notifications change
  useEffect(() => {
    // Only track ids that exist in the notifications array
    const currentIds = notifications.map(n => n.id);
    
    setNotificationStates(prevStates => {
      const newStates = { ...prevStates };
      
      // Initialize new notifications with 'entering' state
      notifications.forEach(notification => {
        if (!prevStates[notification.id]) {
          newStates[notification.id] = 'entering';
        }
      });
      
      // Remove ids that are no longer in notifications
      Object.keys(newStates).forEach(id => {
        if (!currentIds.includes(id)) {
          delete newStates[id];
        }
      });
      
      return newStates;
    });
    
    // Start enter animation for new notifications
    notifications.forEach(notification => {
      if (!notificationStates[notification.id]) {
        setTimeout(() => {
          setNotificationStates(prev => ({
            ...prev,
            [notification.id]: 'entered'
          }));
        }, 10);
      }
    });
  }, [notifications]); // Remove notificationStates from dependencies
  
  // Handle notification close
  const handleCloseNotification = (id) => {
    // Start exit animation
    setNotificationStates(prev => ({
      ...prev,
      [id]: 'exiting'
    }));
    
    // Remove notification after animation completes
    setTimeout(() => {
      removeNotification(id);
    }, 300);
  };
  
  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return '✅';
      case NOTIFICATION_TYPES.ERROR:
        return '❌';
      case NOTIFICATION_TYPES.WARNING:
        return '⚠️';
      case NOTIFICATION_TYPES.INFO:
      default:
        return 'ℹ️';
    }
  };
  
  // No notifications to display
  if (notifications.length === 0) {
    return null;
  }
  
  return (
    <div className="eco-notification-container">
      {notifications.map(notification => (
        <div 
          key={notification.id}
          className={`eco-notification eco-notification-${notification.type} eco-notification-${notificationStates[notification.id] || 'entering'}`}
        >
          <div className="eco-notification-icon">
            {getNotificationIcon(notification.type)}
          </div>
          
          <div className="eco-notification-content">
            {notification.title && (
              <div className="eco-notification-title">{notification.title}</div>
            )}
            <div className="eco-notification-message">{notification.message}</div>
          </div>
          
          <button 
            className="eco-notification-close"
            onClick={() => handleCloseNotification(notification.id)}
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;