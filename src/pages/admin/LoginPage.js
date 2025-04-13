// src/pages/admin/LoginPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  
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
      
      let errorMessage = 'Ошибка при входе в систему';
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Неверный email или пароль';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Пользователь не найден';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Неверный пароль';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Слишком много попыток входа. Попробуйте позже';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
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
              <div className="eco-error">
                <p>{error}</p>
              </div>
            )}
            
            <div className="eco-form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите email"
                required
              />
            </div>
            
            <div className="eco-form-group">
              <label htmlFor="password">Пароль</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="eco-button" 
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
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