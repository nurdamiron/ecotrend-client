// src/components/common/Header.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <header className="eco-header">
      <div className="eco-container">
        <div className="eco-header-container">
          <div>
            <Link to="/" className="eco-logo">EcoTrend</Link>
          </div>
          
          {/* Desktop menu */}
          <nav className="eco-nav d-none d-md-flex">
            <Link to="/" className={`eco-nav-link ${isActive('/') ? 'active' : ''}`}>
              Главная
            </Link>
            <a href="/#devices" className="eco-nav-link">
              Устройства
            </a>
            <a href="/#how-it-works" className="eco-nav-link">
              Как это работает
            </a>
          </nav>
          
          {/* Mobile menu button */}
          <div className="d-md-none">
            <button onClick={toggleMobileMenu} className="eco-menu-button">
              {mobileMenuOpen ? (
                <span className="eco-close-icon">✕</span>
              ) : (
                <span className="eco-menu-icon">☰</span>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="eco-mobile-menu">
            <nav className="eco-mobile-nav">
              <Link to="/" 
                className={`eco-mobile-nav-link ${isActive('/') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Главная
              </Link>
              <a href="/#devices" 
                className="eco-mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Устройства
              </a>
              <a href="/#how-it-works" 
                className="eco-mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Как это работает
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;