// scripts/firebase-migration.js
// This script helps to initialize and migrate your Firebase database structure
// Run with Node.js: node scripts/firebase-migration.js

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get } = require('firebase/database');

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

// Sample data for initialization
const sampleData = {
  devices: {
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
    }
  },
  admins: {
    'admin123': {
      email: 'admin@ecotrend.kz',
      role: 'admin',
      name: 'Администратор'
    }
  },
  kaspi_transactions: {
    'TXN12345': {
      device_id: 'DEVICE-001',
      amount: 400,
      timestamp: new Date().toISOString(),
      status: 'success',
      operation_id: 'op1234567890'
    }
  },
  system: {
    settings: {
      maintenance_mode: false,
      version: '1.0.0'
    },
    analytics: {
      total_dispensed: 500,
      total_revenue: 400
    }
  }
};

// Function to check if data exists
async function checkDataExists() {
  try {
    const rootRef = ref(database);
    const snapshot = await get(rootRef);
    
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking if data exists:', error);
    return false;
  }
}

// Function to migrate existing data format
async function migrateExistingData() {
  try {
    // Check if we have data in old format (directly at root level)
    const rootRef = ref(database);
    const snapshot = await get(rootRef);
    
    if (!snapshot.exists()) {
      console.log('No data to migrate. Database is empty.');
      return false;
    }
    
    const data = snapshot.val();
    const newStructure = { devices: {} };
    let migrationNeeded = false;
    
    // Check for direct device IDs at root level
    for (const key in data) {
      if (key.startsWith('DEVICE-') || key.match(/^[A-Z]+-\d+$/)) {
        console.log(`Found device at root level: ${key}`);
        migrationNeeded = true;
        
        // Check if this device has containers and info
        const deviceData = data[key];
        newStructure.devices[key] = {
          info: deviceData.info || {
            name: `Device ${key}`,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          containers: deviceData.containers || {},
          dispensing_operations: deviceData.dispensing_operations || {}
        };
      }
    }
    
    // Check if we need to move admin data
    if (data.admins) {
      newStructure.admins = data.admins;
    }
    
    // Check if we need to move system data
    if (data.system) {
      newStructure.system = data.system;
    }
    
    // Check if we need to move transaction data
    if (data.kaspi_transactions) {
      newStructure.kaspi_transactions = data.kaspi_transactions;
    }
    
    if (migrationNeeded) {
      console.log('Migration needed. Migrating data to new structure...');
      
      // Set new structure (this will overwrite existing data!)
      const confirmed = await confirmMigration();
      if (confirmed) {
        await set(rootRef, newStructure);
        console.log('Migration completed successfully!');
        return true;
      } else {
        console.log('Migration cancelled by user.');
        return false;
      }
    } else {
      console.log('No migration needed. Data already in correct structure.');
      return false;
    }
  } catch (error) {
    console.error('Error migrating data:', error);
    return false;
  }
}

// Function to get confirmation from user before migration
async function confirmMigration() {
  // In a real script, you'd use readline or similar to get user input
  // For demo purposes, we'll just return true
  console.log('WARNING: This will restructure your database and might overwrite data.');
  console.log('Please make a backup before continuing.');
  
  // Simulate user confirmation
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Confirmation: Y (simulated)');
      resolve(true);
    }, 1000);
  });
}

// Function to initialize database with sample data
async function initializeDatabase() {
  try {
    const rootRef = ref(database);
    await set(rootRef, sampleData);
    console.log('Database initialized with sample data!');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

// Main migration function
async function runMigration() {
  console.log('Checking if database already has data...');
  
  const hasData = await checkDataExists();
  
  if (hasData) {
    console.log('Database has existing data. Checking if migration is needed...');
    const migrated = await migrateExistingData();
    
    if (!migrated) {
      console.log('No migration performed.');
    }
  } else {
    console.log('Database is empty. Initializing with sample data...');
    await initializeDatabase();
  }
  
  console.log('Migration process completed.');
  process.exit(0);
}

// Run the migration
runMigration();