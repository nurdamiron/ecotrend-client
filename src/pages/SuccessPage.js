// src/pages/SuccessPage.js
import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { saveTransaction } = useAuth();
  
  // Get data from state
  const { 
    deviceId, 
    chemical, 
    volume, 
    amount, 
    transactionId 
  } = location.state || {};
  
  // On component mount
  useEffect(() => {
    // Clear transaction from storage
    saveTransaction(null);
    
    // If no data, redirect to home
    if (!deviceId || !volume) {
      navigate('/');
      return;
    }
    
    // Show confetti effect on success
    const showConfetti = () => {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (error) {
        console.error('Confetti error:', error);
      }
    };
    
    // Run confetti with a delay
    const confettiTimer = setTimeout(showConfetti, 500);
    
    // Auto redirect after 30 seconds
    const redirectTimer = setTimeout(() => {
      navigate(`/device/${deviceId}`);
    }, 30000);
    
    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(redirectTimer);
    };
  }, [deviceId, volume, navigate, saveTransaction]);
  
  // If no data, don't render
  if (!deviceId || !volume) {
    return null;
  }
  
  // Format timestamp
  const formatDate = (dateString) => {
    try {
      return new Date().toLocaleString();
    } catch (error) {
      return new Date().toLocaleString();
    }
  };
  
  return (
    <div className="eco-container">
      <div className="eco-success-page">
        <div className="eco-success-container">
          <div className="eco-success-icon">✅</div>
          
          <h1>Операция успешно завершена!</h1>
          <p className="eco-success-message">Спасибо за использование EcoTrend!</p>
          
          <div className="eco-success-details">
            <h2>Детали операции</h2>
            
            <div className="eco-success-info">
              <div className="eco-success-row">
                <span className="eco-success-label">Дата и время:</span>
                <span className="eco-success-value">{formatDate()}</span>
              </div>
              
              <div className="eco-success-row">
                <span className="eco-success-label">Устройство:</span>
                <span className="eco-success-value">{deviceId}</span>
              </div>
              
              <div className="eco-success-row">
                <span className="eco-success-label">Средство:</span>
                <span className="eco-success-value">{chemical || 'Химикат'}</span>
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
                  <span className="eco-success-label">Номер транзакции:</span>
                  <span className="eco-success-value eco-transaction-id">{transactionId}</span>
                </div>
              )}
            </div>
            
            <div className="eco-receipt-note">
              <p>Сохраните данные о транзакции для возможных обращений в службу поддержки</p>
            </div>
          </div>
          
          <div className="eco-dispensing-instructions">
            <h3>Инструкция:</h3>
            <ol>
              <li>Убедитесь, что тара находится под дозатором</li>
              <li>Дождитесь окончания процесса дозирования</li>
              <li>Осторожно извлеките тару из-под дозатора</li>
              <li>Закройте тару крышкой</li>
            </ol>
          </div>
          
          <div className="eco-success-actions">
            <Link to={`/device/${deviceId}`} className="eco-button">
              Выбрать другое средство
            </Link>
            
            <Link to="/" className="eco-button outline">
              На главную
            </Link>
          </div>
        </div>
        
        <div className="eco-redirect-info">
          <p>Вы будете автоматически перенаправлены на страницу устройства через 30 секунд</p>
        </div>
        
        <div className="eco-eco-message">
          <div className="eco-eco-icon">🌱</div>
          <p>
            <span className="eco-eco-title">Спасибо, что заботитесь о природе!</span><br />
            Используя многоразовую тару, вы сокращаете количество пластиковых отходов и помогаете экологии нашей планеты.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;