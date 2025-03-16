// src/pages/SuccessPage.js
import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Получаем данные из предыдущей страницы
  const { deviceId, tankId, chemicalName, volume, amount, transactionId } = location.state || {};
  
  // Перенаправляем на главную, если нет данных
  useEffect(() => {
    if (!deviceId || !volume) {
      navigate('/');
      return;
    }
    
    // Эмуляция конфетти
    const showConfetti = () => {
      // Здесь мог бы быть код для эффекта конфетти
      console.log('Confetti effect!');
    };
    
    // Запускаем конфетти с небольшой задержкой
    const timer = setTimeout(showConfetti, 500);
    
    // Автоматически перенаправляем на главную через 30 секунд
    const redirectTimer = setTimeout(() => {
      navigate('/');
    }, 30000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(redirectTimer);
    };
  }, [deviceId, volume, navigate]);
  
  // Если нет данных, не отображаем страницу
  if (!deviceId || !volume) {
    return null;
  }
  
  return (
    <div className="eco-success-page">
      <div className="eco-success-container">
        <div className="eco-success-icon">
          <span>✅</span>
        </div>
        
        <h1>Операция успешно завершена!</h1>
        <p className="eco-success-message">Спасибо за использование EcoTrend!</p>
        
        <div className="eco-success-details">
          <h2>Детали операции</h2>
          
          <div className="eco-success-info">
            <div className="eco-success-row">
              <span className="eco-success-label">Устройство:</span>
              <span className="eco-success-value">{deviceId}</span>
            </div>
            
            <div className="eco-success-row">
              <span className="eco-success-label">Средство:</span>
              <span className="eco-success-value">{chemicalName || 'Выбранное средство'}</span>
            </div>
            
            <div className="eco-success-row">
              <span className="eco-success-label">Объем:</span>
              <span className="eco-success-value">{volume} мл</span>
            </div>
            
            <div className="eco-success-row">
              <span className="eco-success-label">Стоимость:</span>
              <span className="eco-success-value">{amount} тенге</span>
            </div>
            
            {transactionId && (
              <div className="eco-success-row">
                <span className="eco-success-label">Транзакция:</span>
                <span className="eco-success-value eco-transaction-id">{transactionId}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="eco-success-actions">
          <Link to="/" className="eco-button">
            Вернуться на главную
          </Link>
          
          <Link to={`/device/${deviceId}`} className="eco-button outline">
            Выбрать другое средство
          </Link>
        </div>
      </div>
      
      <div className="eco-redirect-info">
        <p>Вы будете автоматически перенаправлены на главную страницу через 30 секунд</p>
      </div>
      
      <div className="eco-eco-message">
        <p>
          <span className="eco-eco-title">Спасибо, что заботитесь о природе!</span><br />
          Используя многоразовую тару, вы сокращаете количество пластиковых отходов.
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;