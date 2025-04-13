// src/pages/admin/ChemicalManagement.js
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import { firebaseService } from '../../services/firebase';
import { getDatabase, ref, update } from 'firebase/database';

const ChemicalManagement = () => {
  const [devices, setDevices] = useState([]);
  const [allChemicals, setAllChemicals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    lowStock: false,
    device: 'all'
  });
  
  // Edit chemical state
  const [selectedChemical, setSelectedChemical] = useState(null);
  const [chemicalForm, setChemicalForm] = useState({
    name: '',
    price: 0,
    description: '',
    level: 0,
    capacity: 0,
    batch_number: '',
    expiration_date: ''
  });
  
  // Fetch devices and chemicals
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get all devices
        const devicesData = await firebaseService.getAvailableDevices();
        setDevices(devicesData);
        
        // Get chemicals from all devices
        const chemicalsPromises = devicesData.map(async (device) => {
          try {
            const containers = await firebaseService.getDeviceContainers(device.id);
            return containers.map(container => ({
              ...container,
              deviceId: device.id,
              deviceName: device.name || device.id
            }));
          } catch (err) {
            console.error(`Error fetching chemicals for device ${device.id}:`, err);
            return [];
          }
        });
        
        const allChemicalsData = (await Promise.all(chemicalsPromises)).flat();
        setAllChemicals(allChemicalsData);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter chemicals based on search and filters
  const filteredChemicals = allChemicals.filter(chemical => {
    // Search term filter
    const searchMatch = 
      chemical.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chemical.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chemical.deviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chemical.deviceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chemical.batch_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Low stock filter
    const lowStockMatch = !filters.lowStock || chemical.level < 20;
    
    // Device filter
    const deviceMatch = filters.device === 'all' || chemical.deviceId === filters.device;
    
    return searchMatch && lowStockMatch && deviceMatch;
  });
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Select chemical for editing
  const handleEditChemical = (chemical) => {
    setSelectedChemical(chemical);
    
    setChemicalForm({
      name: chemical.name || '',
      price: chemical.price || 0,
      description: chemical.description || '',
      level: chemical.level || 0,
      capacity: chemical.capacity || 0,
      batch_number: chemical.batch_number || '',
      expiration_date: chemical.expiration_date ? 
        new Date(chemical.expiration_date).toISOString().split('T')[0] : ''
    });
  };
  
  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    setChemicalForm(prev => ({
      ...prev,
      [name]: ['price', 'level', 'capacity'].includes(name) ? 
        parseFloat(value) : value
    }));
  };
  
  // Save chemical changes
  const handleSaveChemical = async () => {
    if (!selectedChemical) return;
    
    setLoading(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      const db = getDatabase();
      const containerRef = ref(db, `${selectedChemical.deviceId}/containers/${selectedChemical.id}`);
      
      // Format the update data
      const updateData = {
        name: chemicalForm.name,
        price: chemicalForm.price,
        description: chemicalForm.description,
        level: chemicalForm.level,
        capacity: chemicalForm.capacity,
        updated_at: new Date().toISOString()
      };
      
      if (chemicalForm.batch_number) {
        updateData.batch_number = chemicalForm.batch_number;
      }
      
      if (chemicalForm.expiration_date) {
        updateData.expiration_date = new Date(chemicalForm.expiration_date).toISOString();
      }
      
      await update(containerRef, updateData);
      
      // Update local state
      setAllChemicals(prev => prev.map(chemical => 
        chemical.id === selectedChemical.id && chemical.deviceId === selectedChemical.deviceId
          ? { ...chemical, ...updateData }
          : chemical
      ));
      
      setSelectedChemical(null);
      setSuccessMessage('Информация о химикате успешно обновлена');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('Error updating chemical:', err);
      setError('Ошибка при обновлении информации о химикате');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && allChemicals.length === 0) {
    return (
      <AdminLayout title="Управление химикатами">
        <div className="eco-loader-container">
          <Loader size="large" text="Загрузка данных..." />
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title="Управление химикатами">
      {error && <ErrorMessage message={error} />}
      {successMessage && (
        <div className="eco-success-message">
          <p>{successMessage}</p>
        </div>
      )}
      
      <div className="eco-admin-chemical-management">
        {/* Filters and search */}
        <div className="eco-filters-container">
          <div className="eco-search-container">
            <input
              type="text"
              className="eco-search-input"
              placeholder="Поиск по названию, устройству или партии..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="eco-filters">
            <div className="eco-filter-group">
              <select
                name="device"
                value={filters.device}
                onChange={handleFilterChange}
                className="eco-select"
              >
                <option value="all">Все устройства</option>
                {devices.map(device => (
                  <option key={device.id} value={device.id}>
                    {device.name || device.id}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="eco-filter-group">
              <label className="eco-checkbox-label">
                <input
                  type="checkbox"
                  name="lowStock"
                  checked={filters.lowStock}
                  onChange={handleFilterChange}
                  className="eco-checkbox"
                />
                Только низкий запас (&lt;20%)
              </label>
            </div>
          </div>
        </div>
        
        {/* Chemicals grid */}
        <div className="eco-chemicals-management-grid">
          {filteredChemicals.length > 0 ? (
            filteredChemicals.map(chemical => (
              <div 
                key={`${chemical.deviceId}-${chemical.id}`} 
                className={`eco-chemical-management-card ${chemical.level < 20 ? 'low-stock' : ''}`}
              >
                {selectedChemical?.id === chemical.id && 
                 selectedChemical?.deviceId === chemical.deviceId ? (
                  <div className="eco-chemical-edit-form">
                    <h3>Редактирование химиката</h3>
                    
                    <div className="eco-form-group">
                      <label htmlFor="chemical-name">Название</label>
                      <input
                        id="chemical-name"
                        name="name"
                        type="text"
                        value={chemicalForm.name}
                        onChange={handleFormChange}
                      />
                    </div>
                    
                    <div className="eco-form-group">
                      <label htmlFor="chemical-description">Описание</label>
                      <textarea
                        id="chemical-description"
                        name="description"
                        rows="2"
                        value={chemicalForm.description}
                        onChange={handleFormChange}
                      ></textarea>
                    </div>
                    
                    <div className="eco-form-row">
                      <div className="eco-form-group half">
                        <label htmlFor="chemical-price">Цена за литр (тенге)</label>
                        <input
                          id="chemical-price"
                          name="price"
                          type="number"
                          value={chemicalForm.price}
                          onChange={handleFormChange}
                          min="0"
                          step="10"
                        />
                      </div>
                      
                      <div className="eco-form-group half">
                        <label htmlFor="chemical-level">Уровень (%)</label>
                        <input
                          id="chemical-level"
                          name="level"
                          type="number"
                          value={chemicalForm.level}
                          onChange={handleFormChange}
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                    
                    <div className="eco-form-row">
                      <div className="eco-form-group half">
                        <label htmlFor="chemical-capacity">Объем бака (л)</label>
                        <input
                          id="chemical-capacity"
                          name="capacity"
                          type="number"
                          value={chemicalForm.capacity}
                          onChange={handleFormChange}
                          min="0"
                          step="0.5"
                        />
                      </div>
                      
                      <div className="eco-form-group half">
                        <label htmlFor="chemical-batch">Номер партии</label>
                        <input
                          id="chemical-batch"
                          name="batch_number"
                          type="text"
                          value={chemicalForm.batch_number}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>
                    
                    <div className="eco-form-group">
                      <label htmlFor="chemical-expiration">Срок годности</label>
                      <input
                        id="chemical-expiration"
                        name="expiration_date"
                        type="date"
                        value={chemicalForm.expiration_date}
                        onChange={handleFormChange}
                      />
                    </div>
                    
                    <div className="eco-form-actions">
                      <button 
                        className="eco-button"
                        onClick={handleSaveChemical}
                        disabled={loading}
                      >
                        {loading ? 'Сохранение...' : 'Сохранить'}
                      </button>
                      <button 
                        className="eco-button outline"
                        onClick={() => setSelectedChemical(null)}
                        disabled={loading}
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="eco-chemical-management-header">
                      <h3>{chemical.name}</h3>
                      <div className="eco-chemical-device">
                        {chemical.deviceName || chemical.deviceId}
                      </div>
                    </div>
                    
                    <div className="eco-chemical-level">
                      <div className="eco-level-label">Уровень заполнения:</div>
                      <div className="eco-level-bar">
                        <div 
                          className={`eco-level-fill ${chemical.level < 20 ? 'low' : ''}`}
                          style={{ width: `${chemical.level}%` }}
                        ></div>
                      </div>
                      <div className="eco-level-percentage">{chemical.level}%</div>
                    </div>
                    
                    <div className="eco-chemical-details">
                      {chemical.description && (
                        <div className="eco-chemical-description">
                          {chemical.description}
                        </div>
                      )}
                      
                      <div className="eco-detail-row">
                        <div className="eco-detail-item">
                          <div className="eco-detail-label">Цена:</div>
                          <div className="eco-detail-value">{chemical.price} ₸/л</div>
                        </div>
                        
                        <div className="eco-detail-item">
                          <div className="eco-detail-label">Объем бака:</div>
                          <div className="eco-detail-value">{chemical.capacity} л</div>
                        </div>
                      </div>
                      
                      <div className="eco-detail-row">
                        {chemical.batch_number && (
                          <div className="eco-detail-item">
                            <div className="eco-detail-label">Партия:</div>
                            <div className="eco-detail-value">{chemical.batch_number}</div>
                          </div>
                        )}
                        
                        {chemical.expiration_date && (
                          <div className="eco-detail-item">
                            <div className="eco-detail-label">Годен до:</div>
                            <div className="eco-detail-value">
                              {new Date(chemical.expiration_date).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="eco-detail-row">
                        <div className="eco-detail-item">
                          <div className="eco-detail-label">Бак:</div>
                          <div className="eco-detail-value">№{chemical.tank_number}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="eco-chemical-actions">
                      <button 
                        className="eco-button"
                        onClick={() => handleEditChemical(chemical)}
                      >
                        Редактировать
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="eco-empty-state full-width">
              <h3>Нет доступных химикатов</h3>
              <p>Попробуйте изменить параметры фильтрации</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ChemicalManagement;