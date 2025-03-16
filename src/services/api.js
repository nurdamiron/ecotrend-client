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
  // Запросить дозирование химиката
  dispenseChemical: async (deviceId, tankNumber, volume) => {
    try {
      const response = await api.post(`/dispensing/${deviceId}/dispense`, {
        tankNumber: parseInt(tankNumber),
        volume: parseFloat(volume)
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Получить список доступных химикатов
  getAvailableChemicals: async (deviceId) => {
    try {
      const response = await api.get(`/devices/${deviceId}/chemicals`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Сервис для работы с Kaspi
export const kaspiService = {
  // Генерировать QR-код для оплаты
  generateQR: async (deviceId, amount) => {
    try {
      const response = await api.get(`/kaspi/payment?command=check&txn_id=${Date.now()}&account=${deviceId}&sum=${amount}`);
      // Если проверка успешна, запрашиваем URL для QR-кода
      if (response.data && response.data.result === 0) {
        return {
          success: true,
          data: {
            device_id: deviceId,
            amount,
            qr_code_url: `https://pay.kaspi.kz/payment?service=CHEMICAL_DISPENSING&account=${deviceId}&amount=${amount}&txn_id=${Date.now()}`
          }
        };
      }
      return {
        success: false,
        message: response.data.comment || 'Не удалось сгенерировать QR-код'
      };
    } catch (error) {
      throw error;
    }
  },

  // Проверить статус оплаты
  checkPaymentStatus: async (txnId, deviceId) => {
    try {
      const response = await api.get(`/kaspi/payment?command=pay&txn_id=${txnId}&account=${deviceId}`);
      return {
        success: response.data.result === 0,
        data: response.data
      };
    } catch (error) {
      throw error;
    }
  }
};

export default {
  dispensingService,
  kaspiService
};