// src/services/firebase-helpers.js
import { getDatabase, ref, onValue, get, update, push, set } from "firebase/database";
import app from './firebase';

const database = getDatabase(app);

/**
 * Fetch chemical details for a specific tank/container
 * @param {string} deviceId - Device ID
 * @param {string} tankId - Tank/container ID
 * @returns {Promise<Object|null>} - Chemical details or null if not found
 */
export const getChemicalDetails = async (deviceId, tankId) => {
  try {
    const containerRef = ref(database, `${deviceId}/containers/${tankId}`);
    const snapshot = await get(containerRef);
    
    if (snapshot.exists()) {
      return {
        id: tankId,
        tank_number: parseInt(tankId.replace('tank', '')),
        ...snapshot.val()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching chemical details:', error);
    throw error;
  }
};

/**
 * Subscribe to operation status updates
 * @param {string} deviceId - Device ID
 * @param {string} operationId - Operation ID
 * @param {Function} callback - Callback function for updates
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToOperationStatus = (deviceId, operationId, callback) => {
  const operationRef = ref(database, `${deviceId}/dispensing_operations/${operationId}`);
  
  const unsubscribe = onValue(operationRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });
  
  return unsubscribe;
};

/**
 * Record a new dispensing operation
 * @param {string} deviceId - Device ID
 * @param {string} tankId - Tank/container ID
 * @param {number} volume - Volume in milliliters
 * @param {string} kaspiTxnId - Kaspi transaction ID
 * @returns {Promise<string>} - Operation ID
 */
export const recordDispensingOperation = async (deviceId, tankId, volume, kaspiTxnId) => {
  try {
    const operationsRef = ref(database, `${deviceId}/dispensing_operations`);
    const newOperationRef = push(operationsRef);
    const operationId = newOperationRef.key;
    
    // Get chemical data
    const chemicalData = await getChemicalDetails(deviceId, tankId);
    
    // Generate receipt number
    const receiptNumber = `R_${deviceId}_${Date.now()}`;
    
    // Create operation data
    const operationData = {
      timestamp: new Date().toISOString(),
      status: 'pending',
      tank_number: chemicalData.tank_number,
      chemical_name: chemicalData.name,
      volume,
      price_per_liter: chemicalData.price,
      kaspi_txn_id: kaspiTxnId,
      receipt_number: receiptNumber
    };
    
    // Set operation data
    await set(newOperationRef, operationData);
    
    return operationId;
  } catch (error) {
    console.error('Error recording dispensing operation:', error);
    throw error;
  }
};

/**
 * Update container level after dispensing
 * @param {string} deviceId - Device ID
 * @param {string} tankId - Tank/container ID
 * @param {number} volume - Volume dispensed in milliliters
 * @returns {Promise<void>}
 */
export const updateTankLevel = async (deviceId, tankId, volume) => {
  try {
    const tankRef = ref(database, `${deviceId}/containers/${tankId}`);
    const snapshot = await get(tankRef);
    
    if (!snapshot.exists()) {
      throw new Error(`Container ${tankId} not found for device ${deviceId}`);
    }
    
    const tankData = snapshot.val();
    
    // Convert ml to liters
    const volumeInLiters = volume / 1000;
    
    // Calculate new level
    const currentVolumeInTank = (tankData.level / 100) * tankData.capacity;
    const newVolumeInTank = Math.max(0, currentVolumeInTank - volumeInLiters);
    const newLevel = Math.max(0, (newVolumeInTank / tankData.capacity) * 100);
    
    // Update container level
    await update(tankRef, { 
      level: newLevel,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating tank level:', error);
    throw error;
  }
};

/**
 * Update operation status
 * @param {string} deviceId - Device ID
 * @param {string} operationId - Operation ID
 * @param {string} status - New status ('pending', 'in_progress', 'success', 'failed')
 * @returns {Promise<void>}
 */
export const updateOperationStatus = async (deviceId, operationId, status) => {
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
 * Get recent operations for a device
 * @param {string} deviceId - Device ID
 * @param {number} limit - Maximum number of operations to return
 * @returns {Promise<Array>} - Array of operation objects
 */
export const getRecentOperations = async (deviceId, limit = 5) => {
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

/**
 * Create a Kaspi transaction record
 * @param {string} deviceId - Device ID
 * @param {number} amount - Transaction amount
 * @param {Object} additionalData - Additional transaction data
 * @returns {Promise<string>} - Transaction ID
 */
export const createKaspiTransaction = async (deviceId, amount, additionalData = {}) => {
  try {
    // Generate transaction ID
    const txnId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create transaction data
    const transactionData = {
      device_id: deviceId,
      amount,
      status: 'pending',
      timestamp: new Date().toISOString(),
      ...additionalData
    };
    
    // Set transaction data
    const txnRef = ref(database, `kaspi_transactions/${txnId}`);
    await set(txnRef, transactionData);
    
    return txnId;
  } catch (error) {
    console.error('Error creating Kaspi transaction:', error);
    throw error;
  }
};

/**
 * Check Kaspi transaction status
 * @param {string} txnId - Transaction ID
 * @returns {Promise<Object>} - Transaction status
 */
export const checkKaspiTransactionStatus = async (txnId) => {
  try {
    const txnRef = ref(database, `kaspi_transactions/${txnId}`);
    const snapshot = await get(txnRef);
    
    if (snapshot.exists()) {
      return {
        success: snapshot.val().status === 'success',
        data: {
          id: txnId,
          ...snapshot.val()
        }
      };
    }
    
    return {
      success: false,
      error: 'Transaction not found'
    };
  } catch (error) {
    console.error('Error checking Kaspi transaction status:', error);
    throw error;
  }
};

/**
 * Complete a dispensing operation flow
 * @param {string} deviceId - Device ID
 * @param {string} tankId - Tank/container ID
 * @param {number} volume - Volume in milliliters
 * @param {string} txnId - Transaction ID
 * @returns {Promise<Object>} - Operation result
 */
export const completeDispensingFlow = async (deviceId, tankId, volume, txnId) => {
  try {
    // Record dispensing operation
    const operationId = await recordDispensingOperation(deviceId, tankId, volume, txnId);
    
    // Update tank level
    await updateTankLevel(deviceId, tankId, volume);
    
    // Update transaction with operation ID
    const txnRef = ref(database, `kaspi_transactions/${txnId}`);
    await update(txnRef, {
      operation_id: operationId,
      status: 'success',
      updated_at: new Date().toISOString()
    });
    
    // Update operation status
    await updateOperationStatus(deviceId, operationId, 'success');
    
    return {
      success: true,
      operation_id: operationId
    };
  } catch (error) {
    console.error('Error completing dispensing flow:', error);
    throw error;
  }
};