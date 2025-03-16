// src/components/common/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <Link to="/">
              <span className="logo-text">EcoTrend</span>
            </Link>
            <p className="tagline">Экологичное дозирование жидкостей</p>
          </div>
          
          <div className="footer-links">
            <div className="links-group">
              <h4>Навигация</h4>
              <ul>
                <li><Link to="/">Главная</Link></li>
                <li><Link to="/dispensing">Дозирование</Link></li>
                <li><Link to="/payment">Оплата</Link></li>
              </ul>
            </div>
            
            <div className="links-group">
              <h4>Контакты</h4>
              <ul>
                <li><a href="tel:+77001234567">+7 700 123 45 67</a></li>
                <li><a href="mailto:info@ecotrend.kz">info@ecotrend.kz</a></li>
                <li>г. Астана, ул. Примерная, 123</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="copyright">
            &copy; {currentYear} EcoTrend. Все права защищены.
          </p>
          <div className="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://t.me" target="_blank" rel="noopener noreferrer">Telegram</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;