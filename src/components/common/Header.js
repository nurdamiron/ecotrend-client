// src/components/common/Header.js
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { currentUser, isAdmin } = useAuth();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Close mobile menu on location change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <header className={`eco-header ${scrolled ? 'eco-header-scrolled' : ''}`}>
      <div className="eco-container">
        <div className="eco-header-container">
          <div className="eco-logo-container">
            <Link to="/" className="eco-logo">
              <span className="eco-logo-text">EcoTrend</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="eco-nav">
            <NavLink to="/" className={({ isActive }) => 
              `eco-nav-link ${isActive ? 'active' : ''}`
            }>
              Главная
            </NavLink>
            <a href="/#devices" className="eco-nav-link">
              Устройства
            </a>
            <a href="/#how-it-works" className="eco-nav-link">
              Как это работает
            </a>
            {isAdmin && (
              <NavLink to="/admin/dashboard" className={({ isActive }) => 
                `eco-nav-link admin ${isActive ? 'active' : ''}`
              }>
                Панель администратора
              </NavLink>
            )}
            {!currentUser && !isAdmin && (
              <NavLink to="/admin/login" className={({ isActive }) => 
                `eco-nav-link login ${isActive ? 'active' : ''}`
              }>
                Вход для администраторов
              </NavLink>
            )}
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu} 
            className="eco-menu-button"
            aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={mobileMenuOpen}
          >
            <div className={`eco-menu-icon ${mobileMenuOpen ? 'eco-menu-open' : ''}`}>
              <span className="eco-menu-line"></span>
              <span className="eco-menu-line"></span>
              <span className="eco-menu-line"></span>
            </div>
          </button>
        </div>
        
        {/* Mobile Menu */}
        <div className={`eco-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <nav className="eco-mobile-nav">
            <NavLink to="/" 
              className={({ isActive }) => 
                `eco-mobile-nav-link ${isActive ? 'active' : ''}`
              }
            >
              Главная
            </NavLink>
            <a href="/#devices" 
              className="eco-mobile-nav-link"
            >
              Устройства
            </a>
            <a href="/#how-it-works" 
              className="eco-mobile-nav-link"
            >
              Как это работает
            </a>
            {isAdmin && (
              <NavLink to="/admin/dashboard" 
                className={({ isActive }) => 
                  `eco-mobile-nav-link admin ${isActive ? 'active' : ''}`
                }
              >
                Панель администратора
              </NavLink>
            )}
            {!currentUser && !isAdmin && (
              <NavLink to="/admin/login" 
                className={({ isActive }) => 
                  `eco-mobile-nav-link login ${isActive ? 'active' : ''}`
                }
              >
                Вход для администраторов
              </NavLink>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;