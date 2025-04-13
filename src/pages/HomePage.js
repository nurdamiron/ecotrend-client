// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { deviceService } from '../services/api';
import { firebaseService } from '../services/firebase';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';

const HomePage = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // When component mounts, fetch devices from API
  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to fetch from API first
        try {
          const response = await deviceService.getAllDevices();
          
          if (response.success) {
            setDevices(response.data.devices || []);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.error('API error, falling back to Firebase:', apiError);
          // Continue to Firebase fallback
        }
        
        // Fallback to Firebase
        const devicesData = await firebaseService.getAvailableDevices();
        setDevices(devicesData);
      } catch (error) {
        console.error('Error fetching devices:', error);
        setError('Ошибка при загрузке списка устройств');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDevices();
  }, []);
  
  return (
    <>
      {/* Hero section */}
      <section className="eco-hero">
        <div>
          <h1>Экологичное дозирование моющих средств</h1>
          <p>Наливайте ровно столько, сколько нужно. Экономьте деньги и берегите природу.</p>
          <a href="#devices" className="eco-button outline">
            Найти ближайший автомат
          </a>
        </div>
      </section>

      {/* How it works section */}
      <section id="how-it-works" className="eco-section">
        <h2>Как это работает</h2>
        <div className="eco-steps">
          <div className="eco-step">
            <div className="eco-step-number">1</div>
            <h3>Выберите устройство</h3>
            <p>Найдите ближайшее устройство EcoTrend в вашем районе</p>
          </div>
          <div className="eco-step">
            <div className="eco-step-number">2</div>
            <h3>Выберите средство</h3>
            <p>Выберите нужное средство и укажите объем</p>
          </div>
          <div className="eco-step">
            <div className="eco-step-number">3</div>
            <h3>Оплатите через Kaspi</h3>
            <p>Оплатите покупку через Kaspi и получите свое средство</p>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="eco-section">
        <h2>Преимущества EcoTrend</h2>
        <div className="eco-features">
          <div className="eco-feature-card">
            <div className="eco-feature-icon">🌱</div>
            <h3>Экологичность</h3>
            <p>Уменьшение использования пластиковой упаковки для бытовой химии</p>
          </div>
          <div className="eco-feature-card">
            <div className="eco-feature-icon">💰</div>
            <h3>Экономия</h3>
            <p>Платите только за то количество средства, которое вам действительно нужно</p>
          </div>
          <div className="eco-feature-card">
            <div className="eco-feature-icon">⚡</div>
            <h3>Удобство</h3>
            <p>Быстрая оплата через Kaspi и мгновенное получение продукта</p>
          </div>
          <div className="eco-feature-card">
            <div className="eco-feature-icon">✅</div>
            <h3>Качество</h3>
            <p>Только проверенные средства от надежных производителей</p>
          </div>
        </div>
      </section>

      {/* Devices section */}
      <section id="devices" className="eco-section">
        <h2>Доступные устройства</h2>
        
        {loading ? (
          <div className="eco-loader-container">
            <Loader size="large" text="Загрузка устройств..." />
          </div>
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <div className="eco-devices-grid">
            {devices.length === 0 ? (
              <div className="eco-empty-state full-width">
                <p>В данный момент нет доступных устройств</p>
              </div>
            ) : (
              devices.map(device => (
                <div key={device.id} className="eco-device-card">
                  <div className="eco-device-header">
                    <h3>{device.name || `Устройство ${device.id}`}</h3>
                    <p className="eco-device-location">
                      <span className="eco-location-icon">📍</span> 
                      {device.location || 'Местоположение не указано'}
                    </p>
                    <div className="eco-device-status">
                      <span className={`eco-device-status-dot ${device.status === 'active' ? 'active' : 'inactive'}`}></span>
                      <span className="eco-device-status-text">
                        {device.status === 'active' ? 'Доступен' : 'Недоступен'}
                      </span>
                    </div>
                    {device.status === 'active' ? (
                      <Link 
                        to={`/device/${device.id}`} 
                        className="eco-button full-width"
                      >
                        Выбрать
                      </Link>
                    ) : (
                      <button 
                        disabled 
                        className="eco-button full-width"
                      >
                        Недоступно
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* Contact section */}
      <section className="eco-contact-section">
        <h2>У вас есть вопросы?</h2>
        <p className="eco-contact-text">Свяжитесь с нами, если вам нужна дополнительная информация или у вас есть предложения</p>
        
        <div className="eco-contact-buttons">
          <a href="tel:+77001234567" className="eco-button">
            <span className="eco-icon">📞</span> Позвонить
          </a>
          <a href="mailto:info@ecotrend.kz" className="eco-button secondary">
            <span className="eco-icon">✉️</span> Написать
          </a>
          <a href="https://t.me/ecotrend" className="eco-button">
            <span className="eco-icon">📱</span> Telegram
          </a>
        </div>
      </section>
    </>
  );
};

export default HomePage;