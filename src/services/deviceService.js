// src/services/deviceService.js
import axios from 'axios';
import { getDatabase, ref, get } from 'firebase/database';
import app from './firebase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const database = getDatabase(app);

// Create axios instance with auth interceptor
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

const deviceService = {
  // Get all devices
  getAllDevices: async () => {
    try {
      // Try API first
      try {
        const response = await api.get('/devices');
        if (response.data.success) {
          return response.data.data.devices;
        }
      } catch (apiError) {
        console.warn('API error, falling back to Firebase:', apiError);
      }
      
      // Fallback to Firebase
      const dbRef = ref(database);
      const snapshot = await get(dbRef);
      
      if (!snapshot.exists()) return [];
      
      const data = snapshot.val();
      const devices = [];
      
      // Filter system keys and add only devices
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'system' && key !== 'analytics' && key !== 'kaspi_transactions' && key !== 'admins' && value.info) {
          devices.push({
            id: key,
            ...value.info
          });
        }
      });
      
      return devices;
    } catch (error) {
      console.error('Error fetching devices:', error);
      throw error;
    }
  },
  
  // Get device by ID
  getDeviceById: async (deviceId) => {
    try {
      // Try API first
      try {
        const response = await api.get(`/devices/${deviceId}`);
        if (response.data.success) {
          return response.data.data;
        }
      } catch (apiError) {
        console.warn('API error, falling back to Firebase:', apiError);
      }
      
      // Fallback to Firebase
      const deviceRef = ref(database, `${deviceId}/info`);
      const snapshot = await get(deviceRef);
      
      if (snapshot.exists()) {
        return {
          id: deviceId,
          ...snapshot.val()
        };
      }
      
      throw new Error('Device not found');
    } catch (error) {
      console.error(`Error fetching device ${deviceId}:`, error);
      throw error;
    }
  },
  
  // Create new device (admin only)
  createDevice: async (deviceData) => {
    try {
      const response = await api.post('/devices/register', deviceData);
      return response.data;
    } catch (error) {
      console.error('Error creating device:', error);
      throw error;
    }
  },
  
  // Update device (admin only)
  updateDevice: async (deviceId, deviceData) => {
    try {
      const response = await api.put(`/devices/${deviceId}`, deviceData);
      return response.data;
    } catch (error) {
      console.error(`Error updating device ${deviceId}:`, error);
      throw error;
    }
  },
  
  // Delete device (admin only)
  deleteDevice: async (deviceId) => {
    try {
      const response = await api.delete(`/devices/${deviceId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting device ${deviceId}:`, error);
      throw error;
    }
  },
  
  // Get device chemicals
  getDeviceChemicals: async (deviceId) => {
    try {
      // Try API first
      try {
        const response = await api.get(`/devices/${deviceId}/chemicals`);
        if (response.data.success) {
          return response.data.data.chemicals;
        }
      } catch (apiError) {
        console.warn('API error, falling back to Firebase:', apiError);
      }
      
      // Fallback to Firebase
      const containersRef = ref(database, `${deviceId}/containers`);
      const snapshot = await get(containersRef);
      
      if (!snapshot.exists()) return [];
      
      const containers = [];
      snapshot.forEach((containerSnapshot) => {
        const containerId = containerSnapshot.key;
        const tankNumber = parseInt(containerId.replace('tank', ''));
        
        containers.push({
          id: containerId,
          tank_number: tankNumber,
          ...containerSnapshot.val()
        });
      });
      
      return containers;
    } catch (error) {
      console.error(`Error fetching chemicals for device ${deviceId}:`, error);
      throw error;
    }
  },
  
  // Get device status
  getDeviceStatus: async (deviceId) => {
    try {
      const response = await api.get(`/devices/${deviceId}/status`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching status for device ${deviceId}:`, error);
      throw error;
    }
  }
};

export default deviceService;