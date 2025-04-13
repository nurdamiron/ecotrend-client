// src/pages/admin/DeviceManagement.js
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import { firebaseService } from '../../services/firebase';
import { getDatabase, ref, update } from 'firebase/database';

const DeviceManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form state for editing device
  const [editMode, setEditMode] = useState(false);
  const [deviceForm, setDeviceForm] = useState({
    name: '',
    location: '',
    status: 'active'
  });
  
  // Form state for editing container
  const [editingContainer, setEditingContainer] = useState(null);
  const [containerForm, setContainerForm] = useState({
    name: '',
    price: 0,
    level: 0,
    capacity: 0
  });
  
  // Load devices
  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const devicesData = await firebaseService.getAvailableDevices();
        setDevices(devicesData);
        
        // Check if device ID is in URL
        const deviceIdFromUrl = searchParams.get('device');
        if (deviceIdFromUrl) {
          const device = devicesData.find(d => d.id === deviceIdFromUrl);
          if (device) {
            handleSelectDevice(device);
          }
        }
        
      } catch (err) {
        console.error('Error fetching devices:', err);
        setError('Ошибка при загрузке списка устройств');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDevices();
  }, [searchParams]);
  
  // Handle device selection
  const handleSelectDevice = async (device) => {
    setSelectedDevice(device);
    setEditMode(false);
    setDeviceForm({
      name: device.name || '',
      location: device.location || '',
      status: device.status || 'active'
    });
    
    try {
      setLoading(true);
      const containersData = await firebaseService.getDeviceContainers(device.id);
      setContainers(containersData);
    } catch (err) {
      console.error(`Error fetching containers for device ${device.id}:`, err);
      setError(`Ошибка при загрузке данных о контейнерах устройства ${device.id}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle device form changes
  const handleDeviceFormChange = (e) => {
    const { name, value } = e.target;
    setDeviceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save device changes
  const handleSaveDevice = async () => {
    if (!selectedDevice) return;
    
    setLoading(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      const db = getDatabase();
      const deviceRef = ref(db, `${selectedDevice.id}/info`);
      
      await update(deviceRef, {
        name: deviceForm.name,
        location: deviceForm.location,
        status: deviceForm.status,
        updated_at: new Date().toISOString()
      });
      
      // Update local state
      setDevices(prev => prev.map(d => 
        d.id === selectedDevice.id 
          ? { ...d, ...deviceForm } 
          : d
      ));
      
      setSelectedDevice(prev => ({ ...prev, ...deviceForm }));
      setEditMode(false);
      setSuccessMessage('Информация об устройстве успешно обновлена');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('Error updating device:', err);
      setError('Ошибка при обновлении информации об устройстве');
    } finally {
      setLoading(false);
    }
  };
  
  // Start editing container
  const handleEditContainer = (container) => {
    setEditingContainer(container);
    setContainerForm({
      name: container.name || '',
      price: container.price || 0,
      level: container.level || 0,
      capacity: container.capacity || 0
    });
  };
  
  // Handle container form changes
  const handleContainerFormChange = (e) => {
    const { name, value } = e.target;
    setContainerForm(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'level' || name === 'capacity' 
        ? parseFloat(value) 
        : value
    }));
  };
  
  // Save container changes
  const handleSaveContainer = async () => {
    if (!selectedDevice || !editingContainer) return;
    
    setLoading(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      const db = getDatabase();
      const containerRef = ref(db, `${selectedDevice.id}/containers/${editingContainer.id}`);
      
      await update(containerRef, {
        name: containerForm.name,
        price: containerForm.price,
        level: containerForm.level,
        capacity: containerForm.capacity,
        updated_at: new Date().toISOString()
      });
      
      // Update local state
      setContainers(prev => prev.map(c => 
        c.id === editingContainer.id 
          ? { ...c, ...containerForm } 
          : c
      ));
      
      setEditingContainer(null);
      setSuccessMessage('Информация о контейнере успешно обновлена');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('Error updating container:', err);
      setError('Ошибка при обновлении информации о контейнере');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && devices.length === 0) {
    return (
      <AdminLayout title="Управление устройствами">
        <div className="eco-loader-container">
          <Loader size="large" text="Загрузка данных..." />
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title="Управление устройствами">
      {error && <ErrorMessage message={error} />}
      {successMessage && (
        <div className="eco-success-message">
          <p>{successMessage}</p>
        </div>
      )}
      
      <div className="eco-admin-device-management">
        {/* Devices list */}
        <div className="eco-devices-list">
          <h2>Список устройств</h2>
          
          {devices.length > 0 ? (
            <ul className="eco-devices-list-container">
              {devices.map(device => (
                <li 
                  key={device.id}
                  className={`eco-device-list-item ${selectedDevice?.id === device.id ? 'active' : ''}`}
                  onClick={() => handleSelectDevice(device)}
                >
                  <div className="eco-device-list-status">
                    <span 
                      className={`eco-status-indicator ${device.status === 'active' ? 'active' : 'inactive'}`}
                    ></span>
                  </div>
                  <div className="eco-device-list-info">
                    <h3>{device.name || device.id}</h3>
                    <p className="eco-device-list-location">{device.location || 'Нет данных о местоположении'}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="eco-empty-state">
              <p>Нет доступных устройств</p>
            </div>
          )}
        </div>
        
        {/* Device details */}
        <div className="eco-device-details">
          {selectedDevice ? (
            <>
              <div className="eco-device-details-header">
                <h2>{editMode ? 'Редактирование устройства' : 'Информация об устройстве'}</h2>
                {!editMode && (
                  <button 
                    className="eco-button small"
                    onClick={() => setEditMode(true)}
                  >
                    Редактировать
                  </button>
                )}
              </div>
              
              {editMode ? (
                <div className="eco-device-edit-form">
                  <div className="eco-form-group">
                    <label htmlFor="device-name">Название устройства</label>
                    <input
                      id="device-name"
                      name="name"
                      type="text"
                      value={deviceForm.name}
                      onChange={handleDeviceFormChange}
                    />
                  </div>
                  
                  <div className="eco-form-group">
                    <label htmlFor="device-location">Местоположение</label>
                    <input
                      id="device-location"
                      name="location"
                      type="text"
                      value={deviceForm.location}
                      onChange={handleDeviceFormChange}
                    />
                  </div>
                  
                  <div className="eco-form-group">
                    <label htmlFor="device-status">Статус</label>
                    <select
                      id="device-status"
                      name="status"
                      value={deviceForm.status}
                      onChange={handleDeviceFormChange}
                    >
                      <option value="active">Активно</option>
                      <option value="inactive">Неактивно</option>
                      <option value="maintenance">На обслуживании</option>
                    </select>
                  </div>
                  
                  <div className="eco-form-actions">
                    <button 
                      className="eco-button"
                      onClick={handleSaveDevice}
                      disabled={loading}
                    >
                      {loading ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button 
                      className="eco-button outline"
                      onClick={() => setEditMode(false)}
                      disabled={loading}
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <div className="eco-device-info-card">
                  <div className="eco-info-row">
                    <div className="eco-info-label">ID устройства:</div>
                    <div className="eco-info-value">{selectedDevice.id}</div>
                  </div>
                  
                  <div className="eco-info-row">
                    <div className="eco-info-label">Название:</div>
                    <div className="eco-info-value">{selectedDevice.name || 'Нет названия'}</div>
                  </div>
                  
                  <div className="eco-info-row">
                    <div className="eco-info-label">Местоположение:</div>
                    <div className="eco-info-value">{selectedDevice.location || 'Не указано'}</div>
                  </div>
                  
                  <div className="eco-info-row">
                    <div className="eco-info-label">Статус:</div>
                    <div className="eco-info-value">
                      <span className={`eco-status-badge ${selectedDevice.status}`}>
                        {selectedDevice.status === 'active' ? 'Активно' : 
                         selectedDevice.status === 'inactive' ? 'Неактивно' : 
                         selectedDevice.status === 'maintenance' ? 'На обслуживании' : 
                         selectedDevice.status}
                      </span>
                    </div>
                  </div>
                  
                  {selectedDevice.created_at && (
                    <div className="eco-info-row">
                      <div className="eco-info-label">Создано:</div>
                      <div className="eco-info-value">
                        {new Date(selectedDevice.created_at).toLocaleString()}
                      </div>
                    </div>
                  )}
                  
                  {selectedDevice.updated_at && (
                    <div className="eco-info-row">
                      <div className="eco-info-label">Обновлено:</div>
                      <div className="eco-info-value">
                        {new Date(selectedDevice.updated_at).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Containers list */}
              <div className="eco-containers-section">
                <h3>Контейнеры с химикатами</h3>
                
                {loading ? (
                  <Loader size="medium" text="Загрузка данных о контейнерах..." />
                ) : containers.length > 0 ? (
                  <div className="eco-containers-grid">
                    {containers.map(container => (
                      <div key={container.id} className="eco-container-card">
                        {editingContainer?.id === container.id ? (
                          <div className="eco-container-edit-form">
                            <div className="eco-form-group">
                              <label htmlFor={`container-name-${container.id}`}>Название</label>
                              <input
                                id={`container-name-${container.id}`}
                                name="name"
                                type="text"
                                value={containerForm.name}
                                onChange={handleContainerFormChange}
                              />
                            </div>
                            
                            <div className="eco-form-group">
                              <label htmlFor={`container-price-${container.id}`}>Цена за литр (тенге)</label>
                              <input
                                id={`container-price-${container.id}`}
                                name="price"
                                type="number"
                                value={containerForm.price}
                                onChange={handleContainerFormChange}
                                min="0"
                                step="10"
                              />
                            </div>
                            
                            <div className="eco-form-group">
                              <label htmlFor={`container-level-${container.id}`}>Уровень (%)</label>
                              <input
                                id={`container-level-${container.id}`}
                                name="level"
                                type="number"
                                value={containerForm.level}
                                onChange={handleContainerFormChange}
                                min="0"
                                max="100"
                              />
                            </div>
                            
                            <div className="eco-form-group">
                              <label htmlFor={`container-capacity-${container.id}`}>Объем (л)</label>
                              <input
                                id={`container-capacity-${container.id}`}
                                name="capacity"
                                type="number"
                                value={containerForm.capacity}
                                onChange={handleContainerFormChange}
                                min="0"
                                step="0.5"
                              />
                            </div>
                            
                            <div className="eco-form-actions">
                              <button 
                                className="eco-button small"
                                onClick={handleSaveContainer}
                                disabled={loading}
                              >
                                {loading ? 'Сохранение...' : 'Сохранить'}
                              </button>
                              <button 
                                className="eco-button outline small"
                                onClick={() => setEditingContainer(null)}
                                disabled={loading}
                              >
                                Отмена
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="eco-container-header">
                              <h4>Бак №{container.tank_number}</h4>
                              <button 
                                className="eco-button small"
                                onClick={() => handleEditContainer(container)}
                              >
                                Изменить
                              </button>
                            </div>
                            
                            <div className="eco-container-name">{container.name}</div>
                            
                            <div className="eco-container-level">
                              <div className="eco-level-label">Уровень заполнения:</div>
                              <div className="eco-level-bar">
                                <div 
                                  className={`eco-level-fill ${container.level < 20 ? 'low' : ''}`}
                                  style={{ width: `${container.level}%` }}
                                ></div>
                              </div>
                              <div className="eco-level-percentage">{container.level}%</div>
                            </div>
                            
                            <div className="eco-container-details">
                              <div className="eco-detail-item">
                                <div className="eco-detail-label">Цена:</div>
                                <div className="eco-detail-value">{container.price} ₸/л</div>
                              </div>
                              
                              <div className="eco-detail-item">
                                <div className="eco-detail-label">Объем бака:</div>
                                <div className="eco-detail-value">{container.capacity} л</div>
                              </div>
                              
                              {container.batch_number && (
                                <div className="eco-detail-item">
                                  <div className="eco-detail-label">Партия:</div>
                                  <div className="eco-detail-value">{container.batch_number}</div>
                                </div>
                              )}
                              
                              {container.expiration_date && (
                                <div className="eco-detail-item">
                                  <div className="eco-detail-label">Годен до:</div>
                                  <div className="eco-detail-value">
                                    {new Date(container.expiration_date).toLocaleDateString()}
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="eco-empty-state">
                    <p>У этого устройства нет контейнеров с химикатами</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="eco-empty-state large">
              <h3>Выберите устройство из списка слева</h3>
              <p>Для просмотра детальной информации и управления устройством</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default DeviceManagement;