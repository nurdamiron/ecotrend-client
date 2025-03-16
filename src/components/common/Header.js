// src/components/common/Header.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  // Определить активный маршрут
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Обработчик клика по бургер-меню
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header className="main-header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to="/">
              <span className="logo-text">EcoTrend</span>
            </Link>
          </div>
          
          <div className="burger-menu" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          
          <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
            <ul>
              <li>
                <Link 
                  to="/" 
                  className={isActive('/') ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Главная
                </Link>
              </li>
              <li>
                <Link 
                  to="/dispensing" 
                  className={isActive('/dispensing') ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Дозирование
                </Link>
              </li>
              <li>
                <Link 
                  to="/payment" 
                  className={isActive('/payment') ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Оплата
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;