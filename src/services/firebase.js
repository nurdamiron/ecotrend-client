// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, update, push, remove, onValue, off, query, orderByChild, limitToLast } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwL7A1Y2EW8vMcj_sNXWeD-B3aBbai5oA",
  authDomain: "diastest-d6240.firebaseapp.com",
  databaseURL: "https://diastest-d6240-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "diastest-d6240",
  storageBucket: "diastest-d6240.firebasestorage.app",
  messagingSenderId: "1097804903404",
  appId: "1:1097804903404:web:9153d13be4a3b0cf6586c9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ====== Device Management ======

/**
 * Get device information by ID
 * @param {string} deviceId - The device ID to fetch
 * @returns {Promise<Object|null>} - Device info or null if not found
 */
// src/services/firebase.js
const getDeviceInfo = async (deviceId) => {
  try {
    const deviceRef = ref(database, `${deviceId}/info`);
    const snapshot = await get(deviceRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error fetching device info:', error);
    throw error;
  }
};

/**
 * Get all available devices
 * @returns {Promise<Array>} - Array of device objects
 */
const getAvailableDevices = async () => {
  try {
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
    console.error('Error fetching available devices:', error);
    throw error;
  }
};

/**
 * Subscribe to device changes in real-time
 * @param {string} deviceId - Device ID to monitor
 * @param {Function} callback - Callback function for updates
 * @returns {Function} - Unsubscribe function
 */
const subscribeToDeviceChanges = (deviceId, callback) => {
  const deviceRef = ref(database, `${deviceId}`);
  
  onValue(deviceRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });
  
  // Return unsubscribe function
  return () => off(deviceRef);
};

/**
 * Update device information
 * @param {string} deviceId - Device ID to update
 * @param {Object} deviceInfo - New device information
 * @returns {Promise<void>}
 */
const updateDeviceInfo = async (deviceId, deviceInfo) => {
  try {
    const deviceRef = ref(database, `${deviceId}/info`);
    
    // Add updated timestamp
    const updatedInfo = {
      ...deviceInfo,
      updated_at: new Date().toISOString()
    };
    
    await update(deviceRef, updatedInfo);
  } catch (error) {
    console.error('Error updating device info:', error);
    throw error;
  }
};

// ====== Container/Chemical Management ======

/**
 * Get containers for a specific device
 * @param {string} deviceId - Device ID
 * @returns {Promise<Array>} - Array of container objects
 */
const getDeviceContainers = async (deviceId) => {
  try {
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
    console.error('Error fetching device containers:', error);
    throw error;
  }
};

/**
 * Update a chemical container's information
 * @param {string} deviceId - Device ID
 * @param {string} containerId - Container ID (e.g., "tank1")
 * @param {Object} containerInfo - New container information
 * @returns {Promise<void>}
 */
const updateContainer = async (deviceId, containerId, containerInfo) => {
  try {
    const containerRef = ref(database, `${deviceId}/containers/${containerId}`);
    
    // Add updated timestamp
    const updatedInfo = {
      ...containerInfo,
      updated_at: new Date().toISOString()
    };
    
    await update(containerRef, updatedInfo);
  } catch (error) {
    console.error('Error updating container:', error);
    throw error;
  }
};

/**
 * Update chemical level after dispensing
 * @param {string} deviceId - Device ID
 * @param {string} containerId - Container ID (e.g., "tank1")
 * @param {number} dispensedVolume - Volume dispensed in milliliters
 * @returns {Promise<void>}
 */
const updateContainerLevel = async (deviceId, containerId, dispensedVolume) => {
  try {
    const containerRef = ref(database, `${deviceId}/containers/${containerId}`);
    const snapshot = await get(containerRef);
    
    if (!snapshot.exists()) {
      throw new Error(`Container ${containerId} not found for device ${deviceId}`);
    }
    
    const containerData = snapshot.val();
    
    // Convert ml to liters
    const volumeInLiters = dispensedVolume / 1000;
    
    // Calculate new level
    const currentVolumeInTank = (containerData.level / 100) * containerData.capacity;
    const newVolumeInTank = Math.max(0, currentVolumeInTank - volumeInLiters);
    const newLevel = Math.max(0, (newVolumeInTank / containerData.capacity) * 100);
    
    // Update container level
    await update(containerRef, { 
      level: newLevel,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating container level:', error);
    throw error;
  }
};

// ====== Dispensing Operations ======

/**
 * Record a new dispensing operation
 * @param {string} deviceId - Device ID
 * @param {Object} operationData - Operation data
 * @returns {Promise<string>} - Operation ID
 */
const recordDispensingOperation = async (deviceId, operationData) => {
  try {
    const operationsRef = ref(database, `${deviceId}/dispensing_operations`);
    const newOperationRef = push(operationsRef);
    
    // Add timestamp if not provided
    const completeData = {
      ...operationData,
      timestamp: operationData.timestamp || new Date().toISOString()
    };
    
    await set(newOperationRef, completeData);
    return newOperationRef.key;
  } catch (error) {
    console.error('Error recording dispensing operation:', error);
    throw error;
  }
};

/**
 * Get dispensing operation by ID
 * @param {string} deviceId - Device ID
 * @param {string} operationId - Operation ID
 * @returns {Promise<Object|null>} - Operation data or null if not found
 */
const getDispensingOperation = async (deviceId, operationId) => {
  try {
    const operationRef = ref(database, `${deviceId}/dispensing_operations/${operationId}`);
    const snapshot = await get(operationRef);
    
    return snapshot.exists() ? {
      id: operationId,
      ...snapshot.val()
    } : null;
  } catch (error) {
    console.error('Error fetching dispensing operation:', error);
    throw error;
  }
};

/**
 * Update dispensing operation status
 * @param {string} deviceId - Device ID
 * @param {string} operationId - Operation ID
 * @param {string} status - New status
 * @returns {Promise<void>}
 */
const updateOperationStatus = async (deviceId, operationId, status) => {
  try {
    const operationRef = ref(database, `${deviceId}/dispensing_operations/${operationId}`);
    await update(operationRef, { 
      status,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating operation status:', error);
    throw error;
  }
};

/**
 * Get recent dispensing operations for a device
 * @param {string} deviceId - Device ID
 * @param {number} limit - Maximum number of operations to return
 * @returns {Promise<Array>} - Array of operation objects
 */
const getRecentOperations = async (deviceId, limit = 10) => {
  try {
    const operationsRef = ref(database, `${deviceId}/dispensing_operations`);
    const snapshot = await get(operationsRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const operations = [];
    snapshot.forEach(childSnapshot => {
      operations.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    
    // Sort by timestamp (newest first) and limit
    return operations
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
      
  } catch (error) {
    console.error('Error fetching recent operations:', error);
    throw error;
  }
};

// ====== Payment/Transaction Management ======

/**
 * Create a new Kaspi transaction record
 * @param {string} deviceId - Device ID
 * @param {number} amount - Transaction amount
 * @param {Object} additionalData - Additional transaction data
 * @returns {Promise<string>} - Transaction ID
 */
const createKaspiTransaction = async (deviceId, amount, additionalData = {}) => {
  try {
    const txnId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const txnRef = ref(database, `kaspi_transactions/${txnId}`);
    
    const transactionData = {
      device_id: deviceId,
      amount,
      status: 'pending',
      timestamp: new Date().toISOString(),
      ...additionalData
    };
    
    await set(txnRef, transactionData);
    return txnId;
  } catch (error) {
    console.error('Error creating Kaspi transaction:', error);
    throw error;
  }
};

/**
 * Update Kaspi transaction status
 * @param {string} txnId - Transaction ID
 * @param {string} status - New status
 * @param {Object} additionalData - Additional data to update
 * @returns {Promise<void>}
 */
const updateKaspiTransactionStatus = async (txnId, status, additionalData = {}) => {
  try {
    const txnRef = ref(database, `kaspi_transactions/${txnId}`);
    
    await update(txnRef, {
      status,
      updated_at: new Date().toISOString(),
      ...additionalData
    });
  } catch (error) {
    console.error('Error updating Kaspi transaction status:', error);
    throw error;
  }
};

/**
 * Get transaction by ID
 * @param {string} txnId - Transaction ID
 * @returns {Promise<Object|null>} - Transaction data or null if not found
 */
const getKaspiTransaction = async (txnId) => {
  try {
    const txnRef = ref(database, `kaspi_transactions/${txnId}`);
    const snapshot = await get(txnRef);
    
    return snapshot.exists() ? {
      id: txnId,
      ...snapshot.val()
    } : null;
  } catch (error) {
    console.error('Error fetching Kaspi transaction:', error);
    throw error;
  }
};

// ====== System Settings ======

/**
 * Get system settings
 * @returns {Promise<Object>} - System settings
 */
const getSystemSettings = async () => {
  try {
    const settingsRef = ref(database, 'system/settings');
    const snapshot = await get(settingsRef);
    
    return snapshot.exists() ? snapshot.val() : {};
  } catch (error) {
    console.error('Error fetching system settings:', error);
    throw error;
  }
};

/**
 * Update system settings
 * @param {Object} settings - New settings
 * @returns {Promise<void>}
 */
const updateSystemSettings = async (settings) => {
  try {
    const settingsRef = ref(database, 'system/settings');
    await update(settingsRef, settings);
  } catch (error) {
    console.error('Error updating system settings:', error);
    throw error;
  }
};

// ====== Analytics ======

/**
 * Get analytics data
 * @param {Date} startDate - Start date for analytics
 * @param {Date} endDate - End date for analytics
 * @returns {Promise<Object>} - Analytics data
 */
const getAnalyticsData = async (startDate, endDate) => {
  try {
    const analyticsData = {
      totalRevenue: 0,
      totalOperations: 0,
      deviceUsage: {},
      chemicalUsage: {}
    };
    
    // Get all devices
    const devices = await getAvailableDevices();
    
    // Aggregate operations data
    for (const device of devices) {
      const deviceId = device.id;
      const operationsRef = ref(database, `${deviceId}/dispensing_operations`);
      const snapshot = await get(operationsRef);
      
      if (!snapshot.exists()) continue;
      
      snapshot.forEach((opSnapshot) => {
        const operation = opSnapshot.val();
        const opDate = new Date(operation.timestamp);
        
        // Check if operation is within date range
        if (opDate >= startDate && opDate <= endDate && operation.status === 'success') {
          // Calculate revenue
          const pricePerLiter = operation.price_per_liter || 0;
          const volumeInLiters = (operation.volume || 0) / 1000;
          const revenue = pricePerLiter * volumeInLiters;
          
          // Update analytics
          analyticsData.totalRevenue += revenue;
          analyticsData.totalOperations += 1;
          
          // Device usage
          analyticsData.deviceUsage[deviceId] = (analyticsData.deviceUsage[deviceId] || 0) + 1;
          
          // Chemical usage
          const chemicalName = operation.chemical_name || 'Unknown';
          analyticsData.chemicalUsage[chemicalName] = (analyticsData.chemicalUsage[chemicalName] || 0) + 1;
        }
      });
    }
    
    return analyticsData;
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};

// Export Firebase service functions
export const firebaseService = {
  // Device management
  getDeviceInfo,
  getAvailableDevices,
  subscribeToDeviceChanges,
  updateDeviceInfo,
  
  // Container management
  getDeviceContainers,
  updateContainer,
  updateContainerLevel,
  
  // Dispensing operations
  recordDispensingOperation,
  getDispensingOperation,
  updateOperationStatus,
  getRecentOperations,
  
  // Payment/Transaction
  createKaspiTransaction,
  updateKaspiTransactionStatus,
  getKaspiTransaction,
  
  // System
  getSystemSettings,
  updateSystemSettings,
  
  // Analytics
  getAnalyticsData
};

// Export Firebase instances
export { app, database };

export default app;