// src/components/admin/AdminLayout.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = ({ children, title }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <div className={`eco-admin-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className="eco-admin-sidebar">
        <div className="eco-admin-sidebar-header">
          <h2 className="eco-admin-logo">EcoTrend</h2>
          <button 
            className="eco-sidebar-toggle" 
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Свернуть меню" : "Развернуть меню"}
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        <nav className="eco-admin-nav">
          <ul className="eco-admin-menu">
            <li>
              <Link 
                to="/admin/dashboard" 
                className={`eco-admin-menu-item ${isActive('/admin/dashboard') ? 'active' : ''}`}
              >
                <span className="eco-admin-menu-icon">📊</span>
                <span className="eco-admin-menu-text">Дашборд</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/devices" 
                className={`eco-admin-menu-item ${isActive('/admin/devices') ? 'active' : ''}`}
              >
                <span className="eco-admin-menu-icon">🔧</span>
                <span className="eco-admin-menu-text">Управление устройствами</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/chemicals" 
                className={`eco-admin-menu-item ${isActive('/admin/chemicals') ? 'active' : ''}`}
              >
                <span className="eco-admin-menu-icon">🧪</span>
                <span className="eco-admin-menu-text">Управление химикатами</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/analytics" 
                className={`eco-admin-menu-item ${isActive('/admin/analytics') ? 'active' : ''}`}
              >
                <span className="eco-admin-menu-icon">📈</span>
                <span className="eco-admin-menu-text">Аналитика</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="eco-admin-sidebar-footer">
          <button 
            onClick={handleLogout} 
            className="eco-logout-button"
            aria-label="Выйти из аккаунта"
          >
            <span className="eco-admin-menu-icon">🚪</span>
            <span className="eco-admin-menu-text">Выйти</span>
          </button>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="eco-admin-content">
        <header className="eco-admin-header">
          <div className="eco-admin-header-title">
            {isMobile && (
              <button 
                className="eco-sidebar-toggle mobile" 
                onClick={toggleSidebar}
                aria-label={isSidebarOpen ? "Свернуть меню" : "Развернуть меню"}
              >
                {isSidebarOpen ? '✕' : '☰'}
              </button>
            )}
            <h1>{title}</h1>
          </div>
          
          <div className="eco-admin-user-info">
            {currentUser && (
              <>
                <span className="eco-admin-user-email">{currentUser.email}</span>
                <div className="eco-admin-user-avatar">
                  {currentUser.email.charAt(0).toUpperCase()}
                </div>
              </>
            )}
          </div>
        </header>
        
        <div className="eco-admin-main-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;