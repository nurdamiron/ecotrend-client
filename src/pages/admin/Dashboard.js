// src/pages/admin/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import { firebaseService } from '../../services/firebase';
import { getDatabase, ref, get } from 'firebase/database';

const Dashboard = () => {
  const [statistics, setStatistics] = useState({
    totalDevices: 0,
    activeDevices: 0,
    totalOperations: 0,
    totalRevenue: 0
  });
  
  const [recentOperations, setRecentOperations] = useState([]);
  const [lowStockChemicals, setLowStockChemicals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch devices
        const devices = await firebaseService.getAvailableDevices();
        const activeDevices = devices.filter(device => device.status === 'active');
        
        // Fetch operations data
        const db = getDatabase();
        const recentOpsPromises = devices.map(async (device) => {
          try {
            const opsRef = ref(db, `${device.id}/dispensing_operations`);
            const snapshot = await get(opsRef);
            
            if (!snapshot.exists()) return [];
            
            const ops = [];
            snapshot.forEach(childSnapshot => {
              ops.push({
                id: childSnapshot.key,
                deviceId: device.id,
                ...childSnapshot.val()
              });
            });
            
            return ops;
          } catch (err) {
            console.error(`Error fetching operations for device ${device.id}:`, err);
            return [];
          }
        });
        
        const allOperations = (await Promise.all(recentOpsPromises)).flat();
        
        // Calculate total revenue
        const totalRevenue = allOperations.reduce((sum, op) => {
          const pricePerLiter = op.price_per_liter || 0;
          const volumeInLiters = (op.volume || 0) / 1000; // Convert ml to liters
          return sum + (pricePerLiter * volumeInLiters);
        }, 0);
        
        // Sort by timestamp (newest first) and limit to 10
        const sortedOperations = allOperations
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 10);
        
        // Find low stock chemicals
        const lowStockItems = [];
        for (const device of devices) {
          try {
            const containers = await firebaseService.getDeviceContainers(device.id);
            containers.forEach(container => {
              if (container.level < 20) { // Less than 20% remaining
                lowStockItems.push({
                  deviceId: device.id,
                  deviceName: device.name || device.id,
                  tankId: container.id,
                  tankNumber: container.tank_number,
                  chemicalName: container.name,
                  level: container.level
                });
              }
            });
          } catch (err) {
            console.error(`Error fetching containers for device ${device.id}:`, err);
          }
        }
        
        // Update state with fetched data
        setStatistics({
          totalDevices: devices.length,
          activeDevices: activeDevices.length,
          totalOperations: allOperations.length,
          totalRevenue: totalRevenue
        });
        
        setRecentOperations(sortedOperations);
        setLowStockChemicals(lowStockItems);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Ошибка при загрузке данных дашборда');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <AdminLayout title="Загрузка дашборда...">
        <div className="eco-loader-container">
          <Loader size="large" text="Загрузка данных..." />
        </div>
      </AdminLayout>
    );
  }
  
  if (error) {
    return (
      <AdminLayout title="Дашборд">
        <ErrorMessage message={error} />
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title="Дашборд">
      {/* Statistics cards */}
      <div className="eco-stats-grid">
        <div className="eco-stats-card">
          <div className="eco-stats-icon">🔧</div>
          <div className="eco-stats-info">
            <h3>Всего устройств</h3>
            <div className="eco-stats-value">{statistics.totalDevices}</div>
          </div>
        </div>
        
        <div className="eco-stats-card">
          <div className="eco-stats-icon">✅</div>
          <div className="eco-stats-info">
            <h3>Активные устройства</h3>
            <div className="eco-stats-value">{statistics.activeDevices}</div>
          </div>
        </div>
        
        <div className="eco-stats-card">
          <div className="eco-stats-icon">🧪</div>
          <div className="eco-stats-info">
            <h3>Всего операций</h3>
            <div className="eco-stats-value">{statistics.totalOperations}</div>
          </div>
        </div>
        
        <div className="eco-stats-card highlight">
          <div className="eco-stats-icon">💰</div>
          <div className="eco-stats-info">
            <h3>Общая выручка</h3>
            <div className="eco-stats-value">{statistics.totalRevenue.toFixed(0)} ₸</div>
          </div>
        </div>
      </div>
      
      {/* Recent operations */}
      <div className="eco-dashboard-section">
        <div className="eco-section-header">
          <h2>Последние операции</h2>
          <Link to="/admin/analytics" className="eco-view-all">
            Посмотреть все
          </Link>
        </div>
        
        <div className="eco-table-responsive">
          {recentOperations.length > 0 ? (
            <div className="eco-table-container">
              <table className="eco-table">
                <thead>
                  <tr>
                    <th>ID устройства</th>
                    <th>Дата и время</th>
                    <th>Химикат</th>
                    <th>Объем (мл)</th>
                    <th>Стоимость (₸)</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOperations.map((operation) => {
                    const pricePerLiter = operation.price_per_liter || 0;
                    const volumeInLiters = (operation.volume || 0) / 1000; // Convert ml to liters
                    const totalCost = (pricePerLiter * volumeInLiters).toFixed(0);
                    
                    return (
                      <tr key={operation.id}>
                        <td>{operation.deviceId}</td>
                        <td>
                          {new Date(operation.timestamp).toLocaleString()}
                        </td>
                        <td>{operation.chemical_name}</td>
                        <td>{operation.volume}</td>
                        <td>{totalCost} ₸</td>
                        <td>
                          <span className={`eco-status-badge ${operation.status}`}>
                            {operation.status === 'success' ? 'Успешно' : 
                             operation.status === 'pending' ? 'В процессе' : 
                             operation.status === 'failed' ? 'Ошибка' : 
                             operation.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="eco-empty-state">
              <p>Нет данных об операциях</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Low stock chemicals */}
      <div className="eco-dashboard-section">
        <div className="eco-section-header">
          <h2>Химикаты с низким запасом</h2>
          <Link to="/admin/chemicals" className="eco-view-all">
            Управление химикатами
          </Link>
        </div>
        
        <div className="eco-low-stock-container">
          {lowStockChemicals.length > 0 ? (
            <div className="eco-low-stock-grid">
              {lowStockChemicals.map((item) => (
                <div key={`${item.deviceId}-${item.tankId}`} className="eco-low-stock-card">
                  <div className="eco-low-stock-level">
                    <div className="eco-level-circle">
                      <div className="eco-level-value">{item.level}%</div>
                    </div>
                  </div>
                  <div className="eco-low-stock-info">
                    <h3>{item.chemicalName}</h3>
                    <p>Устройство: {item.deviceName}</p>
                    <p>Бак №{item.tankNumber}</p>
                    <Link to={`/admin/devices?device=${item.deviceId}`} className="eco-button small">
                      Перейти к устройству
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="eco-empty-state">
              <p>Все химикаты в достаточном количестве</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;