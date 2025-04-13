// src/components/common/DeviceList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { firebaseService } from '../../services/firebase';
import Loader from './Loader';
import { useUI } from '../../contexts/UIContext';
import DeviceQRCode from '../admin/DeviceQRCode';

const DeviceList = ({ 
  isAdminView = false, 
  onDeviceSelect = null,
  selectedDeviceId = null,
  showQRCodeButton = false
}) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { openModal } = useUI();
  
  // Fetch devices on component mount
  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const devicesData = await firebaseService.getAvailableDevices();
        setDevices(devicesData);
      } catch (err) {
        console.error('Error fetching devices:', err);
        setError('Ошибка при загрузке списка устройств');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDevices();
  }, []);
  
  // Filter devices based on search term and status filter
  const filteredDevices = devices.filter(device => {
    // Search filter
    const searchMatch = 
      device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const statusMatch = statusFilter === 'all' || device.status === statusFilter;
    
    return searchMatch && statusMatch;
  });
  
  // Show QR code modal
  const showQRCode = (device) => {
    openModal({
      title: `QR-код для устройства ${device.name || device.id}`,
      content: (
        <DeviceQRCode 
          deviceId={device.id} 
          deviceName={device.name || device.id}
          size={300}
        />
      ),
      size: 'medium'
    });
  };
  
  if (loading) {
    return (
      <div className="eco-loader-container">
        <Loader size="medium" text="Загрузка устройств..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="eco-error">
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div className="eco-devices-list-container">
      {/* Search and filters */}
      <div className="eco-devices-list-filters">
        <div className="eco-search-container">
          <input
            type="text"
            className="eco-search-input"
            placeholder="Поиск устройств..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="eco-devices-filter">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="eco-select"
          >
            <option value="all">Все устройства</option>
            <option value="active">Активные</option>
            <option value="inactive">Неактивные</option>
            <option value="maintenance">На обслуживании</option>
          </select>
        </div>
      </div>
      
      {filteredDevices.length > 0 ? (
        <div className={isAdminView ? "eco-devices-list-admin" : "eco-devices-grid"}>
          {filteredDevices.map(device => (
            isAdminView ? (
              // Admin list view
              <div 
                key={device.id}
                className={`eco-device-list-item ${selectedDeviceId === device.id ? 'active' : ''}`}
                onClick={() => onDeviceSelect && onDeviceSelect(device)}
              >
                <div className="eco-device-list-status">
                  <span 
                    className={`eco-status-indicator ${device.status}`}
                    title={
                      device.status === 'active' ? 'Активно' :
                      device.status === 'inactive' ? 'Неактивно' :
                      device.status === 'maintenance' ? 'На обслуживании' :
                      'Неизвестный статус'
                    }
                  ></span>
                </div>
                
                <div className="eco-device-list-info">
                  <h3>{device.name || device.id}</h3>
                  <p className="eco-device-list-location">
                    {device.location || 'Нет данных о местоположении'}
                  </p>
                  
                  {showQRCodeButton && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        showQRCode(device);
                      }}
                      className="eco-button small outline"
                    >
                      QR-код
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // Public grid view
              <div key={device.id} className="eco-device-card">
                <div className="eco-device-header">
                  <h3>{device.name || device.id}</h3>
                  <p className="eco-device-location">
                    <span className="eco-location-icon">📍</span> 
                    {device.location || 'Нет данных о местоположении'}
                  </p>
                  
                  <div className="eco-device-status">
                    <span 
                      className={`eco-device-status-dot ${device.status === 'active' ? 'active' : 'inactive'}`}
                    ></span>
                    <span className="eco-device-status-text">
                      {device.status === 'active' ? 'Доступен' : 
                       device.status === 'maintenance' ? 'На обслуживании' : 
                       'Недоступен'}
                    </span>
                  </div>
                  
                  {device.status === 'active' ? (
                    <Link 
                      to={`/device/${device.id}`} 
                      className="eco-button"
                    >
                      Выбрать
                    </Link>
                  ) : (
                    <button 
                      disabled 
                      className="eco-button disabled"
                    >
                      Недоступно
                    </button>
                  )}
                </div>
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="eco-empty-state">
          <p>Устройства не найдены</p>
          <p className="eco-empty-state-subtitle">Попробуйте изменить параметры поиска</p>
        </div>
      )}
    </div>
  );
};

export default DeviceList;