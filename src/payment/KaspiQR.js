// src/components/payment/KaspiQR.js
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { kaspiService } from '../../services/api';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';

const KaspiQR = ({ deviceId = 'DEVICE-001' }) => {
  const [amount, setAmount] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, pending, success, failed
  
  // Генерировать QR-код
  const generateQR = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Проверить, что сумма корректна
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        setError('Пожалуйста, введите корректную сумму');
        setIsLoading(false);
        return;
      }
      
      // Генерируем уникальный идентификатор транзакции
      const txnId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      setTransactionId(txnId);
      
      const response = await kaspiService.generateQR(deviceId, amountValue);
      
      if (response.success) {
        setQrCodeUrl(response.data.qr_code_url);
        setPaymentStatus('pending');
        // Начинаем проверять статус платежа
        setTimeout(() => startPaymentStatusCheck(txnId), 5000);
      } else {
        setError(response.message || 'Не удалось сгенерировать QR-код');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Произошла ошибка при генерации QR-кода');
    } finally {
      setIsLoading(false);
    }
  };

  // Периодически проверять статус платежа
  const startPaymentStatusCheck = (txnId) => {
    let checkCount = 0;
    const maxChecks = 60; // Максимальное количество проверок (5 минут при интервале 5 секунд)
    
    const checkInterval = setInterval(async () => {
      try {
        checkCount++;
        if (checkCount > maxChecks) {
          clearInterval(checkInterval);
          setPaymentStatus('failed');
          setError('Истекло время ожидания оплаты');
          return;
        }
        
        const response = await kaspiService.checkPaymentStatus(txnId, deviceId);
        
        if (response.success) {
          setPaymentStatus('success');
          clearInterval(checkInterval);
          
          // Показываем сообщение об успехе
          alert('Оплата прошла успешно! Теперь вы можете использовать устройство для дозирования.');
          
          // Сбрасываем состояние через 5 секунд
          setTimeout(() => {
            setQrCodeUrl('');
            setTransactionId('');
            setPaymentStatus('idle');
            setError('');
          }, 5000);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 5000); // Проверяем каждые 5 секунд
    
    // Сохраняем интервал для возможности его очистки
    return checkInterval;
  };

  // При размонтировании компонента
  useEffect(() => {
    let interval;
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  // Инструкции для пользователя
  const renderInstructions = () => (
    <div className="payment-instructions">
      <h3>Инструкция по оплате:</h3>
      <ol>
        <li>Укажите сумму и нажмите "Сгенерировать QR-код"</li>
        <li>Откройте приложение Kaspi на вашем телефоне</li>
        <li>Нажмите на значок QR в приложении Kaspi</li>
        <li>Отсканируйте QR-код, отображаемый на экране</li>
        <li>Подтвердите платеж в приложении Kaspi</li>
        <li>После подтверждения платежа, вы сможете использовать устройство</li>
      </ol>
    </div>
  );

  return (
    <div className="kaspi-qr-container">
      <h2>Оплата через Kaspi QR</h2>
      
      {!qrCodeUrl ? (
        <div className="amount-form">
          <div className="form-group">
            <label htmlFor="amount">Сумма оплаты (тенге):</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
              step="100"
              placeholder="Введите сумму"
            />
          </div>
          
          <button 
            onClick={generateQR} 
            disabled={isLoading}
            className="generate-qr-btn"
          >
            {isLoading ? 'Генерация...' : 'Сгенерировать QR-код'}
          </button>
          
          {error && <ErrorMessage message={error} />}
        </div>
      ) : (
        <div className="qr-code-container">
          <h3>Отсканируйте QR-код через приложение Kaspi</h3>
          
          <div className="qr-code">
            <QRCode value={qrCodeUrl} size={256} />
          </div>
          
          <div className="payment-status">
            <p>Статус оплаты: {
              paymentStatus === 'idle' ? 'Ожидание сканирования' :
              paymentStatus === 'pending' ? 'Ожидание оплаты...' :
              paymentStatus === 'success' ? 'Оплата прошла успешно!' :
              'Ошибка оплаты'
            }</p>
            
            {paymentStatus === 'pending' && <Loader />}
            
            {paymentStatus === 'failed' && error && <ErrorMessage message={error} />}
            
            {paymentStatus === 'success' && (
              <div className="payment-success">
                <p>Платеж успешно обработан!</p>
                <p>Теперь вы можете использовать устройство.</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => {
              setQrCodeUrl('');
              setTransactionId('');
              setPaymentStatus('idle');
              setError('');
            }}
            className="new-payment-btn"
          >
            Новый платеж
          </button>
        </div>
      )}
      
      {renderInstructions()}
    </div>
  );
};

export default KaspiQR;