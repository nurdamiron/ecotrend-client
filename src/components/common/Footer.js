// src/components/common/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="eco-footer">
      <div className="eco-container">
        {/* Main Footer Content */}
        <div className="eco-footer-grid">
          {/* About Column */}
          <div className="eco-footer-about">
            <Link to="/" className="eco-footer-logo">EcoTrend</Link>
            <p className="eco-footer-tagline">Экологичное дозирование жидкостей</p>
            <p className="eco-footer-description">
              Инновационные решения для сокращения использования пластиковой упаковки.
              Разумное потребление для заботы о планете.
            </p>
            
            <div className="eco-footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg className="eco-social-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg className="eco-social-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                <svg className="eco-social-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12s5.374 12 12 12 12-5.373 12-12-5.374-12-12-12zm5.224 8.222c-.13.599-.481 2.67-2.022 5.551-.619 1.155-1.892 3.203-3.361 5.154-.27-.292-.552-.596-.851-.913-1.026-1.09-2.459-2.609-2.79-3.053-.563-.76-.563-1.055-.287-1.597.274-.542.823-.973 1.34-1.494.347-.35.656-.662.878-.994.223-.332.384-.71.305-1.239-.115-.779-1.263-3.023-1.796-3.658-.527-.633-1.067-.475-1.397-.357-.73.27-1.263.56-1.724.87-1.066.702-1.201 1.723-1.001 2.457.6 3.122 4.151 9.424 9.651 11.943.946.442 1.836.621 2.667.621 1.588 0 2.988-.826 3.436-2.13.296-.853.185-1.902-1.139-3.023-.744-.637-2.048-1.171-3.29-1.588 1.871-1.416 3.425-2.727 4.231-3.638.694-.782.837-1.436.77-1.986-.11-.876-.941-1.626-1.897-1.627-1.318-.002-2.253.695-2.834 1.252-.2.188-.368.346-.503.497-.127-.143-.266-.294-.417-.455-.564-.6-1.228-1.307-1.893-2.215.667-.141 1.346-.26 2.043-.344 1.498-.183 3.075-.123 3.933.476.517.362.816.879.816 1.518 0 .323-.061.633-.18.93z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Contact Column */}
          <div className="eco-footer-links">
            <h3>Контакты</h3>
            <ul className="eco-footer-contact-list">
              <li className="eco-footer-contact-item">
                <a href="tel:+77001234567" className="eco-footer-contact-link">
                  <span className="eco-footer-icon">📞</span> +7 (700) 123-45-67
                </a>
              </li>
              <li className="eco-footer-contact-item">
                <a href="mailto:info@ecotrend.kz" className="eco-footer-contact-link">
                  <span className="eco-footer-icon">✉️</span> info@ecotrend.kz
                </a>
              </li>
              <li className="eco-footer-contact-item">
                <a href="#" className="eco-footer-contact-link">
                  <span className="eco-footer-icon">📍</span> г. Астана, ул. Примерная, 123
                </a>
              </li>
            </ul>
          </div>
          
          {/* Navigation Column */}
          <div className="eco-footer-links">
            <h3>Навигация</h3>
            <ul className="eco-footer-nav-list">
              <li className="eco-footer-nav-item">
                <Link to="/" className="eco-footer-nav-link">Главная</Link>
              </li>
              <li className="eco-footer-nav-item">
                <a href="/#devices" className="eco-footer-nav-link">Устройства</a>
              </li>
              <li className="eco-footer-nav-item">
                <a href="/#how-it-works" className="eco-footer-nav-link">Как это работает</a>
              </li>
              <li className="eco-footer-nav-item">
                <Link to="/admin/login" className="eco-footer-nav-link">Для администраторов</Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="eco-footer-bottom">
          <p className="eco-copyright">
            &copy; {currentYear} ТОО "EcoTrend". Все права защищены.
          </p>
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