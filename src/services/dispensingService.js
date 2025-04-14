// src/services/dispensingService.js
import axios from 'axios';
import { getDatabase, ref, push, set, update, get } from 'firebase/database';
import app from './firebase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const database = getDatabase(app);

// Create axios instance
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

const dispensingService = {
  // Calculate cost for dispensing
  calculateCost: async (deviceId, tankNumber, volume) => {
    try {
      // Try API first
      try {
        const response = await api.post('/dispensing/calculate', {
          device_id: deviceId,
          tank_number: tankNumber,
          volume
        });
        
        if (response.data.success) {
          return response.data;
        }
      } catch (apiError) {
        console.warn('API error, falling back to Firebase:', apiError);
      }
      
      // Fallback to Firebase
      const tankId = `tank${tankNumber}`;
      const chemicalRef = ref(database, `${deviceId}/containers/${tankId}`);
      const snapshot = await get(chemicalRef);
      
      if (!snapshot.exists()) {
        throw new Error('Chemical not found');
      }
      
      const chemical = snapshot.val();
      const pricePerLiter = chemical.price || 0;
      const totalCost = (pricePerLiter * volume / 1000).toFixed(0);
      
      return {
        success: true,
        data: {
          session_id: `SESSION-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          device_id: deviceId,
          tank_number: tankNumber,
          chemical_name: chemical.name,
          volume,
          price_per_liter: pricePerLiter,
          total_cost: totalCost
        }
      };
    } catch (error) {
      console.error('Error calculating cost:', error);
      throw error;
    }
  },
  
  // Initiate dispensing
  dispenseChemical: async (deviceId, tankNumber, volume) => {
    try {
      // Try API first
      try {
        const response = await api.post(`/dispensing/${deviceId}/dispense`, {
          tankNumber: parseInt(tankNumber),
          volume: parseFloat(volume)
        });
        
        if (response.data.success) {
          return response.data;
        }
      } catch (apiError) {
        console.warn('API error, falling back to Firebase:', apiError);
      }
      
      // Fallback to Firebase
      // 1. Get chemical info
      const tankId = `tank${tankNumber}`;
      const chemicalRef = ref(database, `${deviceId}/containers/${tankId}`);
      const chemicalSnapshot = await get(chemicalRef);
      
      if (!chemicalSnapshot.exists()) {
        throw new Error('Chemical not found');
      }
      
      const chemical = chemicalSnapshot.val();
      
      // 2. Create operation record
      const operationsRef = ref(database, `${deviceId}/dispensing_operations`);
      const newOperationRef = push(operationsRef);
      const operationId = newOperationRef.key;
      
      // Generate receipt number
      const receiptNumber = `R_${deviceId}_${Date.now()}`;
      
      // Calculate price
      const pricePerLiter = chemical.price || 0;
      const totalCost = (pricePerLiter * volume / 1000).toFixed(0);
      
      // Create operation data
      const operationData = {
        timestamp: new Date().toISOString(),
        status: 'success',
        tank_number: parseInt(tankNumber),
        chemical_name: chemical.name,
        volume,
        price_per_liter: pricePerLiter,
        receipt_number: receiptNumber
      };
      
      // Set operation data
      await set(newOperationRef, operationData);
      
      // 3. Update tank level
      const volumeInLiters = volume / 1000;
      const currentVolumeInTank = (chemical.level / 100) * chemical.capacity;
      const newVolumeInTank = Math.max(0, currentVolumeInTank - volumeInLiters);
      const newLevel = Math.max(0, (newVolumeInTank / chemical.capacity) * 100);
      
      await update(chemicalRef, { 
        level: newLevel,
        updated_at: new Date().toISOString()
      });
      
      return {
        success: true,
        data: {
          device_id: deviceId,
          tank_number: tankNumber,
          chemical_name: chemical.name,
          volume,
          amount: totalCost,
          receipt_number: receiptNumber
        }
      };
    } catch (error) {
      console.error('Error initiating dispensing:', error);
      throw error;
    }
  },
  
  // Get dispensing history
  getDispensingHistory: async (deviceId, limit = 10, offset = 0) => {
    try {
      // Try API first
      try {
        const response = await api.get(`/dispensing/history/${deviceId}`, {
          params: { limit, offset }
        });
        
        if (response.data.success) {
          return response.data;
        }
      } catch (apiError) {
        console.warn('API error, falling back to Firebase:', apiError);
      }
      
      // Fallback to Firebase
      const operationsRef = ref(database, `${deviceId}/dispensing_operations`);
      const snapshot = await get(operationsRef);
      
      if (!snapshot.exists()) {
        return {
          success: true,
          data: {
            device_id: deviceId,
            operations: [],
            pagination: {
              limit,
              offset
            }
          }
        };
      }
      
      const operations = [];
      snapshot.forEach(childSnapshot => {
        operations.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      // Sort by timestamp (newest first)
      const sortedOperations = operations.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      
      // Apply pagination
      const paginatedOperations = sortedOperations.slice(offset, offset + limit);
      
      return {
        success: true,
        data: {
          device_id: deviceId,
          operations: paginatedOperations,
          pagination: {
            limit,
            offset,
            total: operations.length
          }
        }
      };
    } catch (error) {
      console.error('Error fetching dispensing history:', error);
      throw error;
    }
  },
  
  // Check dispensing status
  checkDispensingStatus: async (sessionId) => {
    try {
      // Try API first
      try {
        const response = await api.get(`/dispensing/status/${sessionId}`);
        
        if (response.data.success) {
          return response.data;
        }
      } catch (apiError) {
        console.warn('API error:', apiError);
      }
      
      // We can't really fallback to Firebase here since we need 
      // session tracking from the backend
      throw new Error('Failed to check dispensing status');
    } catch (error) {
      console.error('Error checking dispensing status:', error);
      throw error;
    }
  }
};

export default dispensingService;