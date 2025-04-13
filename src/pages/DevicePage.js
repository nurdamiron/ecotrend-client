// src/pages/DevicePage.js
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import { deviceService, dispensingService } from '../services/api';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import { useAuth } from '../contexts/AuthContext';

const DevicePage = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const { setCurrentDevice } = useAuth();
  
  const [device, setDevice] = useState(null);
  const [chemicals, setChemicals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Save current device ID to context
  useEffect(() => {
    if (deviceId) {
      setCurrentDevice(deviceId);
    }
  }, [deviceId, setCurrentDevice]);
  
  // Fetch device data and chemicals
  useEffect(() => {
    const fetchDeviceData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to fetch from API first
        try {
          const deviceResponse = await deviceService.getDeviceById(deviceId);
          
          if (deviceResponse.success) {
            setDevice({
              id: deviceId,
              ...deviceResponse.data
            });
          }
        } catch (apiError) {
          console.error('API error, falling back to Firebase:', apiError);
          
          // Fallback to Firebase
          const deviceInfo = await firebaseService.getDeviceInfo(deviceId);
          
          if (!deviceInfo) {
            setError('Устройство не найдено');
            setLoading(false);
            return;
          }
          
          if (deviceInfo.status !== 'active') {
            setError('Устройство недоступно в данный момент');
            setLoading(false);
            return;
          }
          
          setDevice({
            id: deviceId,
            ...deviceInfo
          });
        }
        
        // Try to fetch chemicals from API
        try {
          const chemicalsResponse = await dispensingService.getAvailableChemicals(deviceId);
          
          if (chemicalsResponse.success) {
            setChemicals(chemicalsResponse.data.chemicals || []);
          }
        } catch (apiError) {
          console.error('API error fetching chemicals, falling back to Firebase:', apiError);
          
          // Fallback to Firebase
          const containersData = await firebaseService.getDeviceContainers(deviceId);
          setChemicals(containersData);
        }
      } catch (error) {
        console.error('Error fetching device data:', error);
        setError('Ошибка при загрузке данных устройства');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeviceData();
  }, [deviceId]);
  
  // Handle chemical selection
  const handleSelectChemical = (chemical) => {
    navigate(`/dispensing/${deviceId}/${chemical.id}`);
  };
  
  if (loading) {
    return (
      <div className="eco-loader-container">
        <Loader size="large" text="Загрузка информации об устройстве..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="eco-error-container">
        <ErrorMessage message={error} />
        <Link to="/" className="eco-button">
          Вернуться на главную
        </Link>
      </div>
    );
  }
  
  return (
    <div className="eco-device-page">
      <div className="eco-page-header">
        <Link to="/" className="eco-back-link">
          ← Вернуться к списку устройств
        </Link>
        <h1>{device?.name || `Устройство ${deviceId}`}</h1>
        <div className="eco-device-info">
          <p className="eco-device-location">
            <span className="eco-location-icon">📍</span> {device?.location || 'Нет данных о местоположении'}
          </p>
          <div className="eco-device-status">
            <span className={`eco-device-status-dot active`}></span> Доступно
          </div>
        </div>
      </div>
      
      <div className="eco-section">
        <h2>Доступные средства</h2>
        
        <div className="eco-chemicals-grid">
          {chemicals.length > 0 ? (
            chemicals.map(chemical => (
              <div key={chemical.id} className="eco-chemical-card">
                <div className="eco-chemical-content">
                  <h3>{chemical.name}</h3>
                  <p className="eco-chemical-description">
                    {chemical.description || 'Средство для использования в дозирующем устройстве'}
                  </p>
                  
                  <div className="eco-chemical-level">
                    <div className="eco-chemical-level-label">Уровень:</div>
                    <div className="eco-chemical-level-bar">
                      <div 
                        className={`eco-chemical-level-fill ${chemical.level < 20 ? 'low' : ''}`} 
                        style={{width: `${chemical.level}%`}}
                      ></div>
                    </div>
                    <div className="eco-chemical-level-value">{chemical.level}%</div>
                  </div>
                  
                  <div className="eco-chemical-price">
                    <span className="eco-price-label">Цена:</span>
                    <span className="eco-price-value">{chemical.price} тенге/литр</span>
                  </div>
                </div>
                
                <div className="eco-chemical-actions">
                  <button 
                    className="eco-button full-width"
                    onClick={() => handleSelectChemical(chemical)}
                    disabled={chemical.level < 5}
                  >
                    {chemical.level < 5 ? 'Нет в наличии' : 'Выбрать'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="eco-empty-state">
              <p>Нет доступных средств для этого устройства</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="eco-section">
        <h2>Как использовать</h2>
        <div className="eco-instructions">
          <div className="eco-instruction-step">
            <div className="eco-instruction-number">1</div>
            <div className="eco-instruction-text">
              <h3>Выберите средство</h3>
              <p>Нажмите кнопку "Выбрать" на карточке нужного средства</p>
            </div>
          </div>
          
          <div className="eco-instruction-step">
            <div className="eco-instruction-number">2</div>
            <div className="eco-instruction-text">
              <h3>Укажите объем</h3>
              <p>На следующем экране выберите необходимый объем средства</p>
            </div>
          </div>
          
          <div className="eco-instruction-step">
            <div className="eco-instruction-number">3</div>
            <div className="eco-instruction-text">
              <h3>Оплатите через Kaspi</h3>
              <p>После выбора объема вы будете перенаправлены на страницу оплаты Kaspi</p>
            </div>
          </div>
          
          <div className="eco-instruction-step">
            <div className="eco-instruction-number">4</div>
            <div className="eco-instruction-text">
              <h3>Получите средство</h3>
              <p>После успешной оплаты поднесите тару к дозатору и получите выбранное средство</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="eco-contact-box">
        <h3>Нужна помощь?</h3>
        <p>Если у вас возникли проблемы с использованием устройства, свяжитесь с нами:</p>
        <div className="eco-contact-methods">
          <a href="tel:+77001234567" className="eco-contact-method">
            <span className="eco-contact-icon">📞</span> +7 (700) 123-45-67
          </a>
          <a href="https://t.me/ecotrend" className="eco-contact-method">
            <span className="eco-contact-icon">📱</span> Telegram
          </a>
        </div>
      </div>
    </div>
  );
};

export default DevicePage;