// src/pages/DevicePage.js
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const DevicePage = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  
  // Эмуляция данных устройства
  const [device, setDevice] = useState(null);
  const [chemicals, setChemicals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Эмулируем загрузку данных
    setLoading(true);
    
    setTimeout(() => {
      if (deviceId === 'DEVICE-001' || deviceId === 'DEVICE-002') {
        setDevice({
          id: deviceId,
          name: deviceId === 'DEVICE-001' ? 'EcoBot 1000' : 'EcoBot 1000+',
          location: deviceId === 'DEVICE-001' ? 'ТЦ GreenMall, 1 этаж' : 'ТРЦ Кереметь, 2 этаж',
          status: 'active'
        });
        
        // Эмуляция химикатов
        setChemicals([
          {
            id: 'tank1',
            name: 'Эко-гель для посуды',
            description: 'Натуральный гель для мытья посуды с экстрактом алоэ',
            price: 850,
            tank_number: 1,
            level: 75,
            capacity: 20
          },
          {
            id: 'tank2',
            name: 'Средство для стирки',
            description: 'Гипоаллергенное средство для стирки детской одежды',
            price: 950,
            tank_number: 2,
            level: 60,
            capacity: 20
          },
          {
            id: 'tank3',
            name: 'Универсальное чистящее',
            description: 'Универсальное чистящее средство для всех поверхностей',
            price: 750,
            tank_number: 3,
            level: 90,
            capacity: 20
          }
        ]);
      } else {
        setError('Устройство не найдено');
      }
      
      setLoading(false);
    }, 1000);
  }, [deviceId]);
  
  if (loading) {
    return (
      <div className="eco-loader-container">
        <div className="eco-loader">
          <div className="eco-spinner"></div>
        </div>
        <p>Загрузка информации об устройстве...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="eco-error-container">
        <div className="eco-error">
          <p>{error}</p>
        </div>
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
        <h1>{device.name}</h1>
        <div className="eco-device-info">
          <p className="eco-device-location">
            <span className="eco-location-icon">📍</span> {device.location}
          </p>
          <div className="eco-device-status">
            <span className={`eco-device-status-dot active`}></span> Доступно
          </div>
        </div>
      </div>
      
      <div className="eco-section">
        <h2>Доступные средства</h2>
        
        <div className="eco-chemicals-grid">
          {chemicals.map(chemical => (
            <div key={chemical.id} className="eco-chemical-card">
              <div className="eco-chemical-content">
                <h3>{chemical.name}</h3>
                <p className="eco-chemical-description">{chemical.description}</p>
                
                <div className="eco-chemical-level">
                  <div className="eco-chemical-level-label">Уровень:</div>
                  <div className="eco-chemical-level-bar">
                    <div 
                      className="eco-chemical-level-fill" 
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
                <Link 
                  to={`/dispensing/${deviceId}/${chemical.id}`} 
                  className="eco-button"
                >
                  Выбрать
                </Link>
              </div>
            </div>
          ))}
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
              <p>Отсканируйте QR-код через приложение Kaspi для оплаты</p>
            </div>
          </div>
          
          <div className="eco-instruction-step">
            <div className="eco-instruction-number">4</div>
            <div className="eco-instruction-text">
              <h3>Получите средство</h3>
              <p>Поднесите тару к дозатору и получите выбранное средство</p>
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