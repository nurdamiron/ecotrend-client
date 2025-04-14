// src/services/chemicalService.js
import axios from 'axios';
import { getDatabase, ref, update, get, push, remove } from 'firebase/database';
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

const chemicalService = {
  // Create a new chemical (admin only)
  createChemical: async (deviceId, chemicalData) => {
    try {
      // First check if device already has 7 chemicals
      const existingChemicals = await chemicalService.getChemicals(deviceId);
      if (existingChemicals.length >= 7) {
        throw new Error('Maximum of 7 chemicals allowed per device');
      }
      
      // Try API first
      try {
        const response = await api.post(`/devices/${deviceId}/chemicals`, chemicalData);
        return response.data;
      } catch (apiError) {
        console.warn('API error, falling back to Firebase:', apiError);
        
        // Get next available tank number
        const tankNumber = chemicalData.tank_number || (existingChemicals.length + 1);
        const tankId = `tank${tankNumber}`;
        
        // Add timestamp
        const timestamp = new Date().toISOString();
        
        // Set chemical data in Firebase
        const containerRef = ref(database, `${deviceId}/containers/${tankId}`);
        await update(containerRef, {
          ...chemicalData,
          tank_number: tankNumber,
          created_at: timestamp,
          updated_at: timestamp
        });
        
        return {
          success: true,
          data: {
            id: tankId,
            tank_number: tankNumber,
            ...chemicalData,
            created_at: timestamp,
            updated_at: timestamp
          }
        };
      }
    } catch (error) {
      console.error(`Error creating chemical for device ${deviceId}:`, error);
      throw error;
    }
  },
  
  // Get all chemicals for a device
  getChemicals: async (deviceId) => {
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
      
      const chemicals = [];
      snapshot.forEach((childSnapshot) => {
        const tankId = childSnapshot.key;
        chemicals.push({
          id: tankId,
          tank_number: parseInt(tankId.replace('tank', '')),
          ...childSnapshot.val()
        });
      });
      
      return chemicals;
    } catch (error) {
      console.error(`Error fetching chemicals for device ${deviceId}:`, error);
      throw error;
    }
  },
  
  // Get a specific chemical
  getChemical: async (deviceId, chemicalId) => {
    try {
      // Try API first
      try {
        const response = await api.get(`/devices/${deviceId}/chemicals/${chemicalId}`);
        if (response.data.success) {
          return response.data.data;
        }
      } catch (apiError) {
        console.warn('API error, falling back to Firebase:', apiError);
      }
      
      // Fallback to Firebase
      const chemicalRef = ref(database, `${deviceId}/containers/${chemicalId}`);
      const snapshot = await get(chemicalRef);
      
      if (snapshot.exists()) {
        return {
          id: chemicalId,
          tank_number: parseInt(chemicalId.replace('tank', '')),
          ...snapshot.val()
        };
      }
      
      throw new Error('Chemical not found');
    } catch (error) {
      console.error(`Error fetching chemical ${chemicalId} for device ${deviceId}:`, error);
      throw error;
    }
  },
  
  // Update a chemical (admin only)
  updateChemical: async (deviceId, chemicalId, chemicalData) => {
    try {
      // Try API first
      try {
        const response = await api.put(`/devices/${deviceId}/chemicals/${chemicalId}`, chemicalData);
        return response.data;
      } catch (apiError) {
        console.warn('API error, falling back to Firebase:', apiError);
        
        // Update timestamps
        const timestamp = new Date().toISOString();
        
        // Update chemical data in Firebase
        const chemicalRef = ref(database, `${deviceId}/containers/${chemicalId}`);
        await update(chemicalRef, {
          ...chemicalData,
          updated_at: timestamp
        });
        
        return {
          success: true,
          data: {
            id: chemicalId,
            tank_number: parseInt(chemicalId.replace('tank', '')),
            ...chemicalData,
            updated_at: timestamp
          }
        };
      }
    } catch (error) {
      console.error(`Error updating chemical ${chemicalId} for device ${deviceId}:`, error);
      throw error;
    }
  },
  
  // Delete a chemical (admin only)
  deleteChemical: async (deviceId, chemicalId) => {
    try {
      // Try API first
      try {
        const response = await api.delete(`/devices/${deviceId}/chemicals/${chemicalId}`);
        return response.data;
      } catch (apiError) {
        console.warn('API error, falling back to Firebase:', apiError);
        
        // Delete chemical from Firebase
        const chemicalRef = ref(database, `${deviceId}/containers/${chemicalId}`);
        await remove(chemicalRef);
        
        return {
          success: true,
          message: `Chemical ${chemicalId} deleted successfully`
        };
      }
    } catch (error) {
      console.error(`Error deleting chemical ${chemicalId} for device ${deviceId}:`, error);
      throw error;
    }
  },
  
  // Check if a device has reached the limit of 7 chemicals
  hasReachedChemicalLimit: async (deviceId) => {
    try {
      const chemicals = await chemicalService.getChemicals(deviceId);
      return chemicals.length >= 7;
    } catch (error) {
      console.error(`Error checking chemical limit for device ${deviceId}:`, error);
      throw error;
    }
  }
};

export default chemicalService;