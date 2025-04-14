// src/pages/admin/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ConnectionError from '../../components/common/ConnectionError';
import authService from '../../services/authService';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    checking: true,
    connected: true
  });
  const navigate = useNavigate();
  const { login, isAdmin, currentUser } = useAuth();
  
  // Check backend connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      setConnectionStatus({ checking: true, connected: true });
      const result = await authService.checkConnection();
      setConnectionStatus({ checking: false, connected: result.connected });
    };
    
    checkConnection();
  }, []);
  
  // Redirect if already logged in
  useEffect(() => {
    if (currentUser && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [currentUser, isAdmin, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    
    try {
      setLoading(true);
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.isConnectionError) {
        setConnectionStatus({ checking: false, connected: false });
      } else {
        setError(error.message || 'Ошибка при входе в систему');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleRetryConnection = async () => {
    setConnectionStatus({ checking: true, connected: true });
    const result = await authService.checkConnection();
    setConnectionStatus({ checking: false, connected: result.connected });
  };
  
  // Show connection error if not connected
  if (!connectionStatus.checking && !connectionStatus.connected) {
    return (
      <div className="eco-admin-login">
        <ConnectionError onRetry={handleRetryConnection} />
      </div>
    );
  }
  
  return (
    <div className="eco-admin-login">
      <div className="eco-login-container">
        <div className="eco-login-header">
          <h1>Панель администратора</h1>
          <p>Войдите для доступа к управлению системой</p>
        </div>
        
        <div className="eco-login-form-container">
          <form onSubmit={handleSubmit} className="eco-login-form">
            {error && (
              <div className="eco-error-message">
                <div className="eco-error-icon">⚠️</div>
                <p>{error}</p>
              </div>
            )}
            
            <div className="eco-form-group">
              <label htmlFor="email">Email</label>
              <div className="eco-input-with-icon">
                <span className="eco-input-icon">✉️</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Введите email"
                  required
                />
              </div>
            </div>
            
            <div className="eco-form-group">
              <label htmlFor="password">Пароль</label>
              <div className="eco-input-with-icon">
                <span className="eco-input-icon">🔒</span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="eco-button eco-login-button" 
              disabled={loading || connectionStatus.checking}
            >
              {loading || connectionStatus.checking ? (
                <>
                  <span className="eco-spinner"></span>
                  <span>{connectionStatus.checking ? 'Проверка соединения...' : 'Вход...'}</span>
                </>
              ) : (
                'Войти'
              )}
            </button>
          </form>
          
          <div className="eco-login-footer">
            <p>
              <Link to="/" className="eco-back-link">
                ← Вернуться на главную страницу
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;