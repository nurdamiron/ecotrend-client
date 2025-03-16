// src/contexts/UIContext.js
import React, { createContext, useContext, useState } from 'react';

// Создаем контекст
const UIContext = createContext(null);

// Провайдер контекста
export const UIProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  // Переключение темной темы
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    
    // Добавляем/удаляем класс для body
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('darkMode', !darkMode);
  };
  
  // Инициализация темы из localStorage при монтировании
  React.useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  // Добавление уведомления
  const addNotification = (notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      ...notification
    };
    
    setNotifications([...notifications, newNotification]);
    
    // Автоматическое удаление через timeout
    if (notification.autoClose !== false) {
      const duration = notification.duration || 5000;
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  };
  
  // Удаление уведомления
  const removeNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };
  
  // Предоставляем контекст
  const value = {
    darkMode,
    toggleDarkMode,
    notifications,
    addNotification,
    removeNotification
  };
  
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

// Хук для использования контекста
export const useUI = () => {
  const context = useContext(UIContext);
  if (context === null) {
    throw new Error('useUI должен использоваться внутри UIProvider');
  }
  return context;
};