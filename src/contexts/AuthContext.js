// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Создаем контекст
const AuthContext = createContext(null);

// Провайдер контекста
export const AuthProvider = ({ children }) => {
  const [deviceId, setDeviceId] = useState(null);
  const [lastTransaction, setLastTransaction] = useState(null);
  
  // Получаем deviceId из localStorage при загрузке
  useEffect(() => {
    const storedDeviceId = localStorage.getItem('deviceId');
    if (storedDeviceId) {
      setDeviceId(storedDeviceId);
    }
  }, []);
  
  // Сохраняем deviceId в localStorage при изменении
  useEffect(() => {
    if (deviceId) {
      localStorage.setItem('deviceId', deviceId);
    }
  }, [deviceId]);
  
  // Функция для установки текущего устройства
  const setCurrentDevice = (id) => {
    setDeviceId(id);
  };
  
  // Функция для сохранения информации о последней транзакции
  const saveTransaction = (transaction) => {
    setLastTransaction(transaction);
    
    // Сохраняем в localStorage для восстановления при перезагрузке
    if (transaction) {
      localStorage.setItem('lastTransaction', JSON.stringify(transaction));
    } else {
      localStorage.removeItem('lastTransaction');
    }
  };
  
  // Получаем информацию о последней транзакции при загрузке
  useEffect(() => {
    const storedTransaction = localStorage.getItem('lastTransaction');
    if (storedTransaction) {
      try {
        setLastTransaction(JSON.parse(storedTransaction));
      } catch (error) {
        console.error('Ошибка при разборе данных о транзакции:', error);
        localStorage.removeItem('lastTransaction');
      }
    }
  }, []);
  
  // Предоставляем контекст
  const value = {
    deviceId,
    setCurrentDevice,
    lastTransaction,
    saveTransaction
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Хук для использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};