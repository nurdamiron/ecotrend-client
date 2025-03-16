// src/pages/PaymentPage.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas }  from 'qrcode.react';

const PaymentPage = () => {
  const { deviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Получаем данные о выбранном средстве и объеме
  const { tankId, tankNumber, chemicalName, price, volume, totalAmount } = location.state || {};
  
  // Состояния компонента
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, checking, success, failure
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(300); // 5 минут на оплату
  const [txnId, setTxnId] = useState('');
  
  // Форматирование времени обратного отсчета
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Генерация QR-кода и данных для оплаты
  useEffect(() => {
    if (!deviceId || !tankId || !volume) {
      setError('Недостаточно данных для оплаты');
      setLoading(false);
      return;
    }
    
    // Эмуляция генерации QR-кода
    setLoading(true);
    
    setTimeout(() => {
      // Генерируем уникальный ID транзакции
      const generatedTxnId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      setTxnId(generatedTxnId);
      
      // URL для QR-кода
      const generatedQRUrl = `https://pay.kaspi.kz/payment?service=CHEMICAL_DISPENSING&account=${deviceId}&amount=${totalAmount}&txn_id=${generatedTxnId}`;
      setQrCodeUrl(generatedQRUrl);
      
      setLoading(false);
      
      // Запускаем обратный отсчет
      startCountdown();
      
      // Эмуляция проверки статуса платежа
      startPaymentCheck();
    }, 1500);
    
    // Очистка таймеров при размонтировании
    return () => {
      if (window.paymentCheckInterval) {
        clearInterval(window.paymentCheckInterval);
      }
      if (window.countdownInterval) {
        clearInterval(window.countdownInterval);
      }
    };
  }, [deviceId, tankId, volume, totalAmount]);
  
  // Запуск обратного отсчета
  const startCountdown = () => {
    window.countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(window.countdownInterval);
          // Если таймер истек, а оплата не завершена
          if (paymentStatus !== 'success') {
            setPaymentStatus('failure');
            setError('Время ожидания оплаты истекло');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Эмуляция проверки статуса оплаты
  const startPaymentCheck = () => {
    // Первая проверка через 10 секунд
    setTimeout(() => {
      // Эмулируем успешную оплату через случайный интервал (5-15 секунд)
      const successTimeout = setTimeout(() => {
        setPaymentStatus('success');
        
        // Перенаправляем на страницу успеха через 3 секунды
        setTimeout(() => {
          navigate('/success', {
            state: {
              deviceId,
              tankId,
              chemicalName: chemicalName || 'Выбранное средство',
              volume,
              amount: totalAmount,
              transactionId: txnId
            }
          });
        }, 3000);
      }, Math.floor(Math.random() * 10000) + 5000);
      
      // Устанавливаем интервал для проверки
      window.paymentCheckInterval = setInterval(() => {
        setPaymentStatus('checking');
      }, 3000);
      
      // Сохраняем timeout для очистки при размонтировании
      return () => {
        clearTimeout(successTimeout);
        clearInterval(window.paymentCheckInterval);
      };
    }, 10000);
  };
  
  // Отображение состояния загрузки
  if (loading) {
    return (
      <div className="eco-loader-container">
        <div className="eco-loader">
          <div className="eco-spinner"></div>
        </div>
        <p>Подготовка QR-кода для оплаты...</p>
      </div>
    );
  }
  
  // Отображение ошибки
  if (error && paymentStatus === 'failure') {
    return (
      <div className="eco-error-container">
        <div className="eco-error">
          <p>{error}</p>
        </div>
        <Link 
          to={`/dispensing/${deviceId}/${tankId}`} 
          className="eco-button"
        >
          Вернуться к выбору объема
        </Link>
      </div>
    );
  }
  
  return (
    <div className="eco-payment-page">
      <div className="eco-page-header">
        <Link 
          to={`/dispensing/${deviceId}/${tankId}`} 
          className="eco-back-link"
        >
          ← Вернуться к выбору объема
        </Link>
        <h1>Оплата через Kaspi QR</h1>
        <p className="eco-page-description">Отсканируйте QR-код с помощью приложения Kaspi.kz</p>
      </div>
      
      <div className="eco-payment-container">
        <div className="eco-payment-grid">
          {/* QR-код для оплаты */}
          <div className="eco-payment-qr">
            <h2>Сканируйте QR-код</h2>
            
            <div className="eco-qr-container">
              <div className="eco-qr-code">
                <QRCodeCanvas
                  value={qrCodeUrl}
                  size={240}
                  fgColor="#000000"
                  bgColor="#FFFFFF"
                  level="H"
                  includeMargin={true}
                  renderAs="svg"
                />
              </div>
            </div>
            
            <div className="eco-payment-timer">
              <p>Время до истечения QR-кода: <span className="eco-timer">{formatCountdown()}</span></p>
            </div>
            
            {/* Статус оплаты */}
            <div className="eco-payment-status">
              {paymentStatus === 'pending' && (
                <div className="eco-status-pending">
                  <div className="eco-status-icon">⏳</div>
                  <p>Ожидание сканирования QR-кода</p>
                </div>
              )}
              
              {paymentStatus === 'checking' && (
                <div className="eco-status-checking">
                  <div className="eco-loader">
                    <div className="eco-spinner"></div>
                  </div>
                  <p>Проверка статуса оплаты...</p>
                </div>
              )}
              
              {paymentStatus === 'success' && (
                <div className="eco-status-success">
                  <div className="eco-status-icon">✅</div>
                  <p>Оплата прошла успешно! Перенаправление...</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Информация о заказе */}
          <div className="eco-payment-details">
            <h2>Детали заказа</h2>
            
            <div className="eco-order-details">
              <div className="eco-order-row">
                <span className="eco-order-label">Устройство:</span>
                <span className="eco-order-value">{deviceId}</span>
              </div>
              
              <div className="eco-order-row">
                <span className="eco-order-label">Средство:</span>
                <span className="eco-order-value">{chemicalName || 'Выбранное средство'}</span>
              </div>
              
              <div className="eco-order-row">
                <span className="eco-order-label">Объем:</span>
                <span className="eco-order-value">{volume} мл</span>
              </div>
              
              <div className="eco-order-row">
                <span className="eco-order-label">Цена за литр:</span>
                <span className="eco-order-value">{price} тенге</span>
              </div>
              
              <div className="eco-order-total">
                <span className="eco-order-total-label">Итого:</span>
                <span className="eco-order-total-value">{totalAmount} тенге</span>
              </div>
            </div>
            
            {/* Инструкция */}
            <div className="eco-payment-instructions">
              <h3>Как оплатить через Kaspi QR:</h3>
              <ol className="eco-instructions-list">
                <li>Откройте приложение Kaspi.kz на своем телефоне</li>
                <li>Нажмите на значок <strong>QR</strong> в нижнем меню</li>
                <li>Направьте камеру на QR-код на экране</li>
                <li>Подтвердите платеж в приложении</li>
                <li>Дождитесь подтверждения оплаты на этой странице</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
      
      {/* Дополнительная информация */}
      <div className="eco-payment-info">
        <h3>Важная информация</h3>
        <ul className="eco-info-list">
          <li>После успешной оплаты автомат автоматически начнет дозирование выбранного средства</li>
          <li>У вас будет 30 секунд, чтобы поднести тару к дозатору</li>
          <li>В случае отмены платежа или ошибки, деньги вернутся на ваш счет в Kaspi в течение 24 часов</li>
          <li>При возникновении проблем обращайтесь по телефону +7 (700) 123-45-67</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentPage;