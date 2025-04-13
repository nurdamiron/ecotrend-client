// scripts/init-firebase-data.js
// Скрипт для инициализации Firebase тестовыми данными
// Запускать командой: node scripts/init-firebase-data.js

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');

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

// Тестовые данные для инициализации
const testData = {
  // Устройства с информацией
  'DEVICE-001': {
    info: {
      name: 'EcoTrend Dispenser 1',
      location: 'ТЦ Мега, 1 этаж',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    containers: {
      tank1: {
        name: 'Средство для мытья посуды',
        description: 'Экологичное средство с лимоном для мытья посуды',
        price: 800,
        level: 75,
        capacity: 20,
        tank_number: 1,
        batch_number: 'BATCH001',
        expiration_date: new Date(2026, 0, 1).toISOString()
      },
      tank2: {
        name: 'Средство для стирки',
        description: 'Концентрированное средство для стирки',
        price: 1200,
        level: 90,
        capacity: 20,
        tank_number: 2,
        batch_number: 'BATCH002',
        expiration_date: new Date(2026, 0, 1).toISOString()
      }
    },
    dispensing_operations: {
      'op1234567890': {
        timestamp: new Date().toISOString(),
        tank_number: 1,
        chemical_name: 'Средство для мытья посуды',
        volume: 500,
        price_per_liter: 800,
        status: 'success',
        kaspi_txn_id: 'TXN12345',
        receipt_number: `R_DEVICE-001_${Date.now()}`
      }
    }
  },
  
  'DEVICE-002': {
    info: {
      name: 'EcoTrend Dispenser 2',
      location: 'ТЦ Keruen, 2 этаж',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    containers: {
      tank1: {
        name: 'Жидкое мыло',
        description: 'Антибактериальное жидкое мыло',
        price: 900,
        level: 85,
        capacity: 20,
        tank_number: 1,
        batch_number: 'BATCH003',
        expiration_date: new Date(2026, 0, 1).toISOString()
      },
      tank2: {
        name: 'Гель для душа',
        description: 'Натуральный гель для душа',
        price: 1100,
        level: 92,
        capacity: 20,
        tank_number: 2,
        batch_number: 'BATCH004',
        expiration_date: new Date(2026, 0, 1).toISOString()
      }
    }
  },
  
  // Транзакции Kaspi
  kaspi_transactions: {
    'TXN12345': {
      device_id: 'DEVICE-001',
      amount: 400,
      timestamp: new Date().toISOString(),
      status: 'success',
      operation_id: 'op1234567890'
    }
  },
  
  // Системные настройки
  system: {
    settings: {
      maintenance_mode: false,
      version: '1.0.0'
    }
  }
};

// Функция для инициализации базы данных
async function initializeDatabase() {
  try {
    console.log('Инициализация базы данных тестовыми данными...');
    
    // Записываем данные в базу
    for (const [key, value] of Object.entries(testData)) {
      if (key !== 'kaspi_transactions' && key !== 'system') {
        console.log(`Создание устройства: ${key}`);
        await set(ref(database, key), value);
      }
    }
    
    // Записываем транзакции
    console.log('Создание транзакций Kaspi');
    await set(ref(database, 'kaspi_transactions'), testData.kaspi_transactions);
    
    // Записываем системные настройки
    console.log('Создание системных настроек');
    await set(ref(database, 'system'), testData.system);
    
    console.log('База данных успешно инициализирована!');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
    process.exit(1);
  }
}

// Запускаем инициализацию
initializeDatabase();