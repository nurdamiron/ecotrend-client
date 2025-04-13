// src/pages/PaymentPage.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import { paymentService } from '../services/payment';
import { useAuth } from '../contexts/AuthContext';

const PaymentPage = () => {
  const { deviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { lastTransaction } = useAuth();
  
  // Get transaction ID from URL if coming back from payment
  const queryParams = new URLSearchParams(location.search);
  const txnIdFromUrl = queryParams.get('txn_id');
  
  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('checking'); // checking, success, failed
  
  // If we have URL transaction ID, we're coming back from Kaspi
  // Check payment status
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (txnIdFromUrl) {
        setLoading(true);
        setError(null);
        
        try {
          // Check payment status
          const result = await paymentService.checkPaymentStatus(txnIdFromUrl, deviceId);
          
          if (result.success) {
            setPaymentStatus('success');
            
            // If we have transaction info, initiate dispensing
            if (lastTransaction && lastTransaction.tankNumber && lastTransaction.volume) {
              try {
                await paymentService.dispenseChemical(
                  deviceId,
                  lastTransaction.tankNumber,
                  lastTransaction.volume
                );
                
                // Redirect to success page
                setTimeout(() => {
                  navigate('/success', { 
                    state: { 
                      deviceId, 
                      chemical: lastTransaction.chemicalName,
                      volume: lastTransaction.volume,
                      amount: lastTransaction.amount,
                      transactionId: txnIdFromUrl
                    } 
                  });
                }, 2000);
              } catch (dispensingError) {
                console.error('Dispensing error:', dispensingError);
                setError('Оплата прошла успешно, но возникла ошибка при выдаче средства. Пожалуйста, обратитесь к администратору.');
                setPaymentStatus('failed');
              }
            } else {
              setError('Не удалось получить данные о транзакции');
              setPaymentStatus('failed');
            }
          } else {
            setPaymentStatus('failed');
            setError('Платеж не был успешно обработан. Проверьте статус платежа в приложении Kaspi.');
          }
        } catch (error) {
          console.error('Payment status check error:', error);
          setPaymentStatus('failed');
          setError('Ошибка при проверке статуса платежа');
        } finally {
          setLoading(false);
        }
      } else if (location.state) {
        // We're here from DispensingPage with state data, ready to pay
        // No need to do anything, the component will render payment instructions
        setLoading(false);
      } else {
        // We're here without data, redirect to home
        navigate('/');
      }
    };
    
    checkPaymentStatus();
  }, [txnIdFromUrl, deviceId, lastTransaction, navigate, location.state]);
  
  // If we just loaded the page (not from redirect), redirect to Kaspi
  useEffect(() => {
    const initiatePayment = async () => {
      // Only proceed if we have state data and no txnId in URL (not a redirect)
      if (location.state && !txnIdFromUrl && !lastTransaction) {
        const { tankId, tankNumber, chemicalName, price, volume, totalAmount } = location.state;
        
        if (!deviceId || !totalAmount) {
          setError('Недостаточно данных для оплаты');
          setLoading(false);
          return;
        }
        
        try {
          // Generate payment URL
          const response = await paymentService.generatePaymentUrl(deviceId, totalAmount);
          
          if (response.success) {
            // Save transaction info
            const transactionInfo = {
              deviceId,
              tankId,
              tankNumber: tankNumber || null,
              chemicalName: chemicalName || 'Выбранное средство',
              volume,
              amount: totalAmount,
              txnId: response.data.txn_id,
              timestamp: new Date().toISOString()
            };
            
            // Save to localStorage
            localStorage.setItem('lastTransaction', JSON.stringify(transactionInfo));
            
            // Redirect to Kaspi payment
            window.location.href = response.data.qr_code_url;
          } else {
            setError(response.message || 'Не удалось создать платеж');
            setLoading(false);
          }
        } catch (error) {
          console.error('Payment error:', error);
          setError(error.response?.data?.message || 'Произошла ошибка при создании платежа');
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    initiatePayment();
  }, [deviceId, location.state, txnIdFromUrl, lastTransaction]);
  
  if (loading) {
    return (
      <div className="eco-container">
        <div className="eco-loader-container">
          <Loader size="large" text="Проверка платежа..." />
        </div>
      </div>
    );
  }
  
  // Handle payment status display
  if (txnIdFromUrl) {
    return (
      <div className="eco-container">
        <div className="eco-payment-status-container">
          {paymentStatus === 'checking' && (
            <div className="eco-payment-checking">
              <Loader size="large" text="Проверка статуса платежа..." />
            </div>
          )}
          
          {paymentStatus === 'success' && (
            <div className="eco-payment-success">
              <div className="eco-success-icon">✓</div>
              <h2>Оплата прошла успешно!</h2>
              <p>Ваш заказ обрабатывается, дозирование начнется через несколько секунд.</p>
              <Loader size="small" text="Перенаправление..." />
            </div>
          )}
          
          {paymentStatus === 'failed' && (
            <div className="eco-payment-failed">
              <div className="eco-failed-icon">✗</div>
              <h2>Ошибка при обработке платежа</h2>
              {error && <ErrorMessage message={error} />}
              <div className="eco-payment-actions">
                <Link to={`/device/${deviceId}`} className="eco-button">
                  Вернуться к выбору средств
                </Link>
                <Link to="/" className="eco-button secondary">
                  На главную
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Show payment instructions if we have state data
  if (location.state) {
    const { chemicalName, volume, totalAmount } = location.state;
    
    return (
      <div className="eco-container">
        <div className="eco-payment-instructions-container">
          <h2>Перенаправление на оплату...</h2>
          <Loader size="large" text="Подготовка к оплате через Kaspi..." />
          
          <div className="eco-payment-summary">
            <h3>Информация о заказе:</h3>
            <div className="eco-summary-item">
              <span>Средство:</span>
              <span>{chemicalName || 'Выбранное средство'}</span>
            </div>
            <div className="eco-summary-item">
              <span>Объем:</span>
              <span>{volume} мл</span>
            </div>
            <div className="eco-summary-item total">
              <span>Сумма к оплате:</span>
              <span>{totalAmount} тенге</span>
            </div>
          </div>
          
          {error && <ErrorMessage message={error} />}
          
          <div className="eco-payment-note">
            <p>Если перенаправление не произошло автоматически, нажмите кнопку ниже:</p>
            <button 
              className="eco-button" 
              onClick={() => {
                if (lastTransaction?.txnId) {
                  window.location.href = `https://pay.kaspi.kz/payment?service=CHEMICAL_DISPENSING&account=${deviceId}&amount=${totalAmount}&txn_id=${lastTransaction.txnId}`;
                } else {
                  window.location.reload();
                }
              }}
            >
              Перейти к оплате
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Fallback for direct access to page without data
  return (
    <div className="eco-container">
      <div className="eco-empty-state large">
        <h2>Информация о платеже отсутствует</h2>
        <p>Перейдите к выбору химикатов для создания нового платежа</p>
        <Link to="/" className="eco-button">
          На главную
        </Link>
      </div>
    </div>
  );
};

export default PaymentPage;