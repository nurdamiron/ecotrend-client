import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, onValue } from "firebase/database";

// Используем вашу конфигурацию Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAwL7A1Y2EW8vMcj_sNXWeD-B3aBbai5oA",
  authDomain: "diastest-d6240.firebaseapp.com",
  databaseURL: "https://diastest-d6240-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "diastest-d6240",
  storageBucket: "diastest-d6240.firebasestorage.app",
  messagingSenderId: "1097804903404",
  appId: "1:1097804903404:web:9b8175d209d156c96586c9"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Сервис для работы с Firebase
export const firebaseService = {
  // Получить информацию об устройстве
  getDeviceInfo: async (deviceId) => {
    try {
      const deviceRef = ref(database, `${deviceId}/info`);
      const snapshot = await get(deviceRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Ошибка при получении информации об устройстве:', error);
      throw error;
    }
  },
  
  // Получить информацию о контейнерах устройства
  getDeviceContainers: async (deviceId) => {
    try {
      const containersRef = ref(database, `${deviceId}/containers`);
      const snapshot = await get(containersRef);
      
      if (!snapshot.exists()) return [];
      
      const containers = snapshot.val();
      // Преобразуем объект в массив объектов с добавлением id
      return Object.entries(containers).map(([id, data]) => ({
        id,
        tank_number: parseInt(id.replace('tank', '')),
        ...data
      }));
    } catch (error) {
      console.error('Ошибка при получении контейнеров устройства:', error);
      throw error;
    }
  },
  
  // Получить список доступных устройств
  getAvailableDevices: async () => {
    try {
      // Получаем все устройства из корня базы данных
      const dbRef = ref(database);
      const snapshot = await get(dbRef);
      
      if (!snapshot.exists()) return [];
      
      const data = snapshot.val();
      const devices = [];
      
      // Фильтруем системные ключи и добавляем только устройства
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'system' && key !== 'analytics' && key !== 'kaspi_transactions' && value.info) {
          devices.push({
            id: key,
            ...value.info
          });
        }
      });
      
      return devices;
    } catch (error) {
      console.error('Ошибка при получении списка устройств:', error);
      throw error;
    }
  },
  
  // Слушатель изменений устройства в реальном времени
  subscribeToDeviceChanges: (deviceId, callback) => {
    const deviceRef = ref(database, `${deviceId}`);
    return onValue(deviceRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    });
  }
};

export default app;