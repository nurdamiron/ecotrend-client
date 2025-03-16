// src/components/Header.js
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
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="text-blue-600 text-2xl font-bold">EcoTrend</Link>
          </div>
          
          {/* Desktop menu */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className={`text-gray-600 hover:text-blue-600 ${isActive('/') ? 'font-semibold text-blue-600' : ''}`}>
              Главная
            </Link>
            <a href="/#devices" className="text-gray-600 hover:text-blue-600">
              Устройства
            </a>
            <a href="/#how-it-works" className="text-gray-600 hover:text-blue-600">
              Как это работает
            </a>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="text-gray-500 hover:text-blue-600 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link to="/" 
                className={`text-gray-600 hover:text-blue-600 ${isActive('/') ? 'font-semibold text-blue-600' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Главная
              </Link>
              <a href="/#devices" 
                className="text-gray-600 hover:text-blue-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Устройства
              </a>
              <a href="/#how-it-works" 
                className="text-gray-600 hover:text-blue-600"
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