// src/services/payment.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const paymentService = {
  /**
   * Generate Kaspi QR code for payment
   * @param {string} deviceId - The device ID
   * @param {number} amount - Payment amount
   * @returns {Promise<Object>} - QR code data with URL
   */
  generatePaymentUrl: async (deviceId, amount) => {
    try {
      const response = await api.get(`/kaspi/generate-qr/${deviceId}/${amount}`);
      return response.data;
    } catch (error) {
      console.error('Error generating payment URL:', error);
      throw error;
    }
  },

  /**
   * Check payment status
   * @param {string} txnId - Transaction ID
   * @param {string} deviceId - Device ID (account)
   * @returns {Promise<Object>} - Payment status info
   */
  checkPaymentStatus: async (txnId, deviceId) => {
    try {
      // Format current date in YYYYMMDDHHMMSS format
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
  
  /**
   * Process dispensing after successful payment
   * @param {string} deviceId - Device ID
   * @param {number} tankNumber - Tank number
   * @param {number} volume - Volume in ml
   * @returns {Promise<Object>} - Dispensing operation result
   */
  dispenseChemical: async (deviceId, tankNumber, volume) => {
    try {
      const response = await api.post(`/dispensing/${deviceId}/dispense`, {
        tankNumber: parseInt(tankNumber),
        volume: parseFloat(volume)
      });
      return response.data;
    } catch (error) {
      console.error('Error initiating dispensing:', error);
      throw error;
    }
  }
};

export default paymentService;