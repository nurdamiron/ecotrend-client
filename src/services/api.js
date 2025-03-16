// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Создание экземпляра axios с базовым URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Сервис для дозирования химикатов
export const dispensingService = {
  // Запросить доступные химикаты для устройства
  getAvailableChemicals: async (deviceId) => {
    try {
      const response = await api.get(`/devices/${deviceId}/chemicals`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении химикатов:', error);
      throw error;
    }
  },
  
  // Запросить дозирование химиката
  dispenseChemical: async (deviceId, tankNumber, volume) => {
    try {
      const response = await api.post(`/dispensing/${deviceId}/dispense`, {
        tankNumber: parseInt(tankNumber),
        volume: parseFloat(volume)
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при запросе дозирования:', error);
      throw error;
    }
  }
};

// Сервис для работы с Kaspi
export const kaspiService = {
  // Генерировать QR-код для оплаты
  generateQR: async (deviceId, amount) => {
    try {
      // Генерируем уникальный ID транзакции
      const txnId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Запрос check для проверки возможности платежа
      const response = await api.get(`/kaspi/check`, {
        params: {
          txn_id: txnId,
          account: deviceId,
          sum: amount
        }
      });
      
      if (response.data && response.data.result === 0) {
        return {
          success: true,
          data: {
            txn_id: txnId,
            device_id: deviceId,
            amount: amount,
            // Генерируем URL для QR-кода Kaspi
            qr_code_url: `https://pay.kaspi.kz/payment?service=CHEMICAL_DISPENSING&account=${deviceId}&amount=${amount}&txn_id=${txnId}`
          }
        };
      }
      
      return {
        success: false,
        message: response.data?.comment || 'Не удалось сгенерировать QR-код'
      };
    } catch (error) {
      console.error('Ошибка при генерации QR-кода:', error);
      throw error;
    }
  },

  // Проверить статус оплаты
  checkPaymentStatus: async (txnId, deviceId) => {
    try {
      // Форматируем текущую дату в формат ГГГГММДДччммсс
      const formattedDate = new Date().toISOString()
        .replace(/[-:T.Z]/g, '')
        .slice(0, 14);
      
      const response = await api.get(`/kaspi/pay`, {
        params: {
          txn_id: txnId,
          account: deviceId,
          txn_date: formattedDate,
          sum: 0 // Значение заполнится на бэкенде
        }
      });
      
      return {
        success: response.data?.result === 0,
        data: response.data
      };
    } catch (error) {
      console.error('Ошибка при проверке статуса платежа:', error);
      throw error;
    }
  }
};
