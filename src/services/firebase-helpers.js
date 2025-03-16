// src/firebase-helpers.js
import { getDatabase, ref, onValue, get, update, push } from "firebase/database";
import app from './firebase';

const database = getDatabase(app);

/**
 * Получение информации о средстве в контейнере
 * @param {string} deviceId - ID устройства
 * @param {string} tankId - ID контейнера
 * @returns {Promise<Object|null>} - Данные о средстве
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
    console.error('Ошибка при получении данных о средстве:', error);
    throw error;
  }
};

/**
 * Подписка на обновления статуса операции
 * @param {string} deviceId - ID устройства
 * @param {string} operationId - ID операции
 * @param {Function} callback - Функция обратного вызова для получения обновлений
 * @returns {Function} - Функция для отмены подписки
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
 * Запись информации о новой операции в Firebase
 * @param {string} deviceId - ID устройства
 * @param {string} tankId - ID контейнера
 * @param {number} volume - Объем средства в мл
 * @param {string} kaspiTxnId - ID транзакции Kaspi
 * @returns {Promise<string>} - ID новой операции
 */
export const recordDispensingOperation = async (deviceId, tankId, volume, kaspiTxnId) => {
  try {
    const operationsRef = ref(database, `${deviceId}/dispensing_operations`);
    const newOperationRef = push(operationsRef);
    const operationId = newOperationRef.key;
    
    // Получаем данные о химикате
    const chemicalData = await getChemicalDetails(deviceId, tankId);
    
    // Текущая дата и время
    const timestamp = new Date().toISOString();
    
    // Данные операции
    const operationData = {
      timestamp,
      status: 'pending', // initial status
      tank_number: chemicalData.tank_number,
      chemical_name: chemicalData.name,
      volume,
      price_per_liter: chemicalData.price,
      kaspi_txn_id: kaspiTxnId,
      receipt_number: `R_${deviceId}_${Date.now()}`
    };
    
    // Записываем данные операции
    await update(ref(database, `${deviceId}/dispensing_operations/${operationId}`), operationData);
    
    return operationId;
  } catch (error) {
    console.error('Ошибка при записи операции дозирования:', error);
    throw error;
  }
};

/**
 * Обновление уровня содержимого в баке после дозирования
 * @param {string} deviceId - ID устройства
 * @param {string} tankId - ID контейнера
 * @param {number} volume - Объем (в мл) отдозированного средства
 * @returns {Promise<void>}
 */
export const updateTankLevel = async (deviceId, tankId, volume) => {
  try {
    // Получаем текущие данные о баке
    const tankRef = ref(database, `${deviceId}/containers/${tankId}`);
    const snapshot = await get(tankRef);
    
    if (!snapshot.exists()) {
      throw new Error(`Бак ${tankId} не найден для устройства ${deviceId}`);
    }
    
    const tankData = snapshot.val();
    
    // Вычисляем новый уровень
    // Предполагаем, что capacity в литрах, а volume в мл
    const volumeInLiters = volume / 1000;
    const currentVolumeInTank = (tankData.level / 100) * tankData.capacity;
    const newVolumeInTank = currentVolumeInTank - volumeInLiters;
    const newLevel = Math.max(0, (newVolumeInTank / tankData.capacity) * 100);
    
    // Обновляем уровень в базе данных
    await update(tankRef, { level: newLevel });
    
  } catch (error) {
    console.error('Ошибка при обновлении уровня в баке:', error);
    throw error;
  }
};

/**
 * Обновление статуса операции дозирования
 * @param {string} deviceId - ID устройства
 * @param {string} operationId - ID операции
 * @param {string} status - Новый статус ('pending', 'in_progress', 'success', 'failed')
 * @returns {Promise<void>}
 */
export const updateOperationStatus = async (deviceId, operationId, status) => {
  try {
    const operationRef = ref(database, `${deviceId}/dispensing_operations/${operationId}`);
    await update(operationRef, { status });
  } catch (error) {
    console.error('Ошибка при обновлении статуса операции:', error);
    throw error;
  }
};

/**
 * Получить список последних операций для устройства
 * @param {string} deviceId - ID устройства
 * @param {number} limit - Максимальное количество операций
 * @returns {Promise<Array>} - Массив операций
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
    
    // Сортируем по времени (новые сначала) и ограничиваем количество
    return operations
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
      
  } catch (error) {
    console.error('Ошибка при получении недавних операций:', error);
    throw error;
  }
};