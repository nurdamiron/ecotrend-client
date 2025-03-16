// src/components/common/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="eco-footer">
      <div className="eco-container">
        <div className="eco-footer-grid">
          <div className="eco-footer-about">
            <Link to="/" className="eco-footer-logo">EcoTrend</Link>
            <p className="eco-footer-tagline">Экологичное дозирование жидкостей</p>
            <p className="eco-footer-description">
              Мы разрабатываем и размещаем устройства для экологичного дозирования 
              моющих средств в многоразовую тару.
            </p>
          </div>
          
          <div className="eco-footer-links">
            <h3>Контакты</h3>
            <ul>
              <li>
                <a href="tel:+77001234567" className="eco-footer-contact-link">
                  <span className="eco-footer-icon">📞</span> +7 (700) 123-45-67
                </a>
              </li>
              <li>
                <a href="mailto:info@ecotrend.kz" className="eco-footer-contact-link">
                  <span className="eco-footer-icon">✉️</span> info@ecotrend.kz
                </a>
              </li>
              <li>
                <a href="#" className="eco-footer-contact-link">
                  <span className="eco-footer-icon">📍</span> г. Астана, ул. Примерная, 123
                </a>
              </li>
            </ul>
          </div>
          
          <div className="eco-footer-links">
            <h3>Следите за нами</h3>
            <ul>
              <li>
                <a href="https://facebook.com" className="eco-footer-social-link" target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://instagram.com" className="eco-footer-social-link" target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://t.me/ecotrend" className="eco-footer-social-link" target="_blank" rel="noopener noreferrer">
                  Telegram
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="eco-footer-bottom">
          <p className="eco-copyright">&copy; {currentYear} ТОО "EcoTrend". Все права защищены.</p>
          <div className="eco-footer-legal">
            <Link to="/terms" className="eco-footer-legal-link">Условия использования</Link>
            <Link to="/privacy" className="eco-footer-legal-link">Политика конфиденциальности</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;