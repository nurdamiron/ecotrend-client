// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  // Эмуляция списка устройств
  const [devices, setDevices] = useState([
    {
      id: 'DEVICE-001',
      name: 'EcoBot 1000',
      location: 'ТЦ GreenMall, 1 этаж',
      status: 'active'
    },
    {
      id: 'DEVICE-002',
      name: 'EcoBot 1000+',
      location: 'ТРЦ Кереметь, 2 этаж',
      status: 'active'
    },
    {
      id: 'DEVICE-003',
      name: 'EcoBot Slim',
      location: 'Магазин Натуральные продукты, ул. Экологичная 15',
      status: 'inactive'
    }
  ]);
  
  const [loading, setLoading] = useState(false);

  return (
    <div>
      {/* Hero секция */}
      <section className="eco-hero">
        <div>
          <h1>Экологичное дозирование моющих средств</h1>
          <p>Наливайте ровно столько, сколько нужно. Экономьте деньги и берегите природу.</p>
          <a href="#devices" className="eco-button outline">
            Найти ближайший автомат
          </a>
        </div>
      </section>

      {/* Секция "Как это работает" */}
      <section id="how-it-works" className="eco-section">
        <h2>Как это работает</h2>
        <div className="eco-steps">
          <div className="eco-step">
            <div className="eco-step-number">1</div>
            <h3>Сканируйте QR-код</h3>
            <p>Найдите автомат и отсканируйте QR-код с помощью смартфона</p>
          </div>
          <div className="eco-step">
            <div className="eco-step-number">2</div>
            <h3>Выберите средство</h3>
            <p>Выберите нужное средство и укажите объем</p>
          </div>
          <div className="eco-step">
            <div className="eco-step-number">3</div>
            <h3>Оплатите через Kaspi</h3>
            <p>Оплатите покупку через Kaspi QR и получите свое средство</p>
          </div>
        </div>
      </section>

      {/* Преимущества */}
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

      {/* Список устройств */}
      <section id="devices" className="eco-section">
        <h2>Доступные устройства</h2>
        
        {loading ? (
          <div className="eco-loader">
            <div className="eco-spinner"></div>
          </div>
        ) : (
          <div className="eco-devices-grid">
            {devices.length === 0 ? (
              <div className="eco-empty-message">
                <p>В данный момент нет доступных устройств</p>
              </div>
            ) : (
              devices.map(device => (
                <div key={device.id} className="eco-device-card">
                  <div className="eco-device-header">
                    <h3>{device.name}</h3>
                    <p className="eco-device-location">
                      <span className="eco-location-icon">📍</span> 
                      {device.location}
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
              ))
            )}
          </div>
        )}
      </section>

      {/* Связь с нами */}
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
    </div>
  );
};

export default HomePage;