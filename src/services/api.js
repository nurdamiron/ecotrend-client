// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Device service
export const deviceService = {
  // Get all available devices
  getAllDevices: async () => {
    try {
      const response = await api.get('/devices');
      return response.data;
    } catch (error) {
      console.error('Error fetching devices:', error);
      throw error;
    }
  },
  
  // Get device by ID
  getDeviceById: async (deviceId) => {
    try {
      const response = await api.get(`/devices/${deviceId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching device ${deviceId}:`, error);
      throw error;
    }
  },
  
  // Update device
  updateDevice: async (deviceId, deviceData) => {
    try {
      const response = await api.put(`/devices/${deviceId}`, deviceData);
      return response.data;
    } catch (error) {
      console.error(`Error updating device ${deviceId}:`, error);
      throw error;
    }
  },
  
  // Sync device with Firebase
  syncDeviceWithFirebase: async (deviceId) => {
    try {
      const response = await api.post(`/devices/${deviceId}/sync`);
      return response.data;
    } catch (error) {
      console.error(`Error syncing device ${deviceId}:`, error);
      throw error;
    }
  }
};

// Dispensing service
export const dispensingService = {
  // Get available chemicals for a device
  getAvailableChemicals: async (deviceId) => {
    try {
      const response = await api.get(`/devices/${deviceId}/chemicals`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching chemicals for device ${deviceId}:`, error);
      throw error;
    }
  },
  
  // Initiate dispensing
  dispenseChemical: async (deviceId, tankNumber, volume) => {
    try {
      const response = await api.post(`/dispensing/${deviceId}/dispense`, {
        tankNumber: parseInt(tankNumber),
        volume: parseFloat(volume)
      });
      return response.data;
    } catch (error) {
      console.error(`Error dispensing chemical from device ${deviceId}:`, error);
      throw error;
    }
  },
  
  // Get dispensing history
  getDispensingHistory: async (deviceId, limit = 10, offset = 0) => {
    try {
      const response = await api.get(`/dispensing/${deviceId}/history`, {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching dispensing history for device ${deviceId}:`, error);
      throw error;
    }
  }
};

// Kaspi service
export const kaspiService = {
  // Generate QR code for payment
  generateQR: async (deviceId, amount) => {
    try {
      const response = await api.get(`/kaspi/generate-qr/${deviceId}/${amount}`);
      return response.data;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  },
  
  // Check payment status
  checkPaymentStatus: async (txnId, deviceId) => {
    try {
      // Format date in ГГГГММДДччммсс format
      const formattedDate = new Date().toISOString()
        .replace(/[-:T.Z]/g, '')
        .slice(0, 14);
      
      const response = await api.get(`/kaspi/pay`, {
        params: {
          txn_id: txnId,
          account: deviceId,
          txn_date: formattedDate,
          sum: 0 // Value will be filled on backend
        }
      });
      
      return {
        success: response.data?.result === 0,
        data: response.data
      };
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  },
  
  // Get Kaspi API status
  getKaspiStatus: async () => {
    try {
      const response = await api.get(`/kaspi/status`);
      return response.data;
    } catch (error) {
      console.error('Error checking Kaspi API status:', error);
      throw error;
    }
  },
  
  // Initiate payment
  initiatePayment: async (deviceId, amount) => {
    try {
      // Generate unique transaction ID
      const txnId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // First check if payment can be processed
      const checkResponse = await api.get(`/kaspi/check`, {
        params: {
          txn_id: txnId,
          account: deviceId,
          sum: amount
        }
      });
      
      if (checkResponse.data && checkResponse.data.result === 0) {
        // Generate payment URL
        const response = await api.get(`/kaspi/generate-qr/${deviceId}/${amount}`);
        
        return {
          success: true,
          data: {
            ...response.data.data,
            txn_id: txnId
          }
        };
      }
      
      return {
        success: false,
        message: checkResponse.data?.comment || 'Не удалось инициировать платеж'
      };
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw error;
    }
  }
};

// Balance service
export const balanceService = {
  // Get device balance
  getDeviceBalance: async (deviceId) => {
    try {
      const response = await api.get(`/balance/${deviceId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching balance for device ${deviceId}:`, error);
      throw error;
    }
  },
  
  // Get transaction history
  getTransactionHistory: async (deviceId, limit = 10, offset = 0) => {
    try {
      const response = await api.get(`/balance/${deviceId}/transactions`, {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching transaction history for device ${deviceId}:`, error);
      throw error;
    }
  }
};

// Auth service for admin
export const authService = {
  // Login
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem('auth_token');
  },
  
  // Check auth status
  checkAuth: async () => {
    try {
      const response = await api.get('/auth/check');
      return response.data;
    } catch (error) {
      console.error('Auth check error:', error);
      // Clear token if unauthorized
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('auth_token');
      }
      throw error;
    }
  }
};

// Health check service
export const healthService = {
  // Check API health
  checkHealth: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  },
  
  // Get detailed health info
  getDetailedHealth: async () => {
    try {
      const response = await api.get('/health/detailed');
      return response.data;
    } catch (error) {
      console.error('Detailed health check error:', error);
      throw error;
    }
  }
};

export default {
  deviceService,
  dispensingService,
  kaspiService,
  balanceService,
  authService,
  healthService
};