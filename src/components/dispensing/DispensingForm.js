// src/components/dispensing/DispensingForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { dispensingService } from '../../services/api';
import { paymentService } from '../../services/payment';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import { useAuth } from '../../contexts/AuthContext';

const DispensingForm = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { saveTransaction } = useAuth();
  
  // Get transaction ID from URL if coming back from payment
  const queryParams = new URLSearchParams(location.search);
  const txnIdFromUrl = queryParams.get('txn_id');
  
  // Component state
  const [chemicals, setChemicals] = useState([]);
  const [selectedChemical, setSelectedChemical] = useState(null);
  const [volume, setVolume] = useState(500);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Load available chemicals
  useEffect(() => {
    const fetchChemicals = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await dispensingService.getAvailableChemicals(deviceId);
        
        if (response.success) {
          const chemicalsData = response.data.chemicals || [];
          setChemicals(chemicalsData);
          
          if (chemicalsData.length > 0) {
            setSelectedChemical(chemicalsData[0]);
          }
        } else {
          setError(response.message || 'Не удалось загрузить список химикатов');
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Произошла ошибка при загрузке химикатов');
      } finally {
        setLoading(false);
      }
    };

    fetchChemicals();
  }, [deviceId]);

  // Check payment status if returning from Kaspi
  useEffect(() => {
    const checkPayment = async () => {
      if (txnIdFromUrl) {
        setProcessingPayment(true);
        setError('');
        
        try {
          // Check payment status
          const paymentResult = await paymentService.checkPaymentStatus(txnIdFromUrl, deviceId);
          
          if (paymentResult.success) {
            setPaymentSuccess(true);
            
            // Get chemical data from the transaction info we saved earlier
            const savedTransaction = JSON.parse(localStorage.getItem('lastTransaction'));
            
            if (savedTransaction && savedTransaction.tankNumber && savedTransaction.volume) {
              // Initiate dispensing
              await paymentService.dispenseChemical(
                deviceId,
                savedTransaction.tankNumber,
                savedTransaction.volume
              );
              
              // Redirect to success page
              navigate('/success', { 
                state: { 
                  deviceId, 
                  chemical: savedTransaction.chemicalName,
                  volume: savedTransaction.volume,
                  amount: savedTransaction.amount,
                  transactionId: txnIdFromUrl
                } 
              });
            } else {
              setError('Не удалось получить данные о транзакции');
            }
          } else {
            setError('Платеж не был успешно обработан. Пожалуйста, попробуйте еще раз.');
          }
        } catch (error) {
          console.error('Error checking payment:', error);
          setError('Ошибка при проверке статуса платежа');
        } finally {
          setProcessingPayment(false);
          
          // Clear transaction ID from URL to avoid confusion on refresh
          navigate(location.pathname, { replace: true });
        }
      }
    };
    
    checkPayment();
  }, [txnIdFromUrl, deviceId, navigate, location.pathname]);

  // Calculate price
  const calculatePrice = () => {
    if (!selectedChemical) return 0;
    return (selectedChemical.price * volume / 1000).toFixed(0);
  };
  
  // Initiate payment process
  const handleProceedToPayment = async () => {
    if (!selectedChemical) {
      setError('Пожалуйста, выберите химикат');
      return;
    }
    
    const amount = calculatePrice();
    
    if (amount <= 0) {
      setError('Невозможно оплатить нулевую сумму');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Generate payment URL
      const response = await paymentService.generatePaymentUrl(deviceId, amount);
      
      if (response.success) {
        // Save transaction info for later use
        const transactionInfo = {
          deviceId,
          tankNumber: selectedChemical.tank_number,
          chemicalName: selectedChemical.name,
          volume,
          amount,
          txnId: response.data.txn_id,
          timestamp: new Date().toISOString()
        };
        
        // Save to context and localStorage
        saveTransaction(transactionInfo);
        
        // Redirect to Kaspi payment page
        window.location.href = response.data.qr_code_url;
      } else {
        setError(response.message || 'Не удалось создать платеж');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.response?.data?.message || 'Произошла ошибка при создании платежа');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle chemical selection
  const handleChemicalChange = (e) => {
    const selectedId = e.target.value;
    const chemical = chemicals.find(c => c.id === selectedId || c.tank_number === selectedId);
    setSelectedChemical(chemical);
  };
  
  // Handle volume change
  const handleVolumeChange = (e) => {
    setVolume(parseInt(e.target.value));
  };

  if (loading) {
    return <Loader size="large" text="Загрузка данных..." />;
  }
  
  if (processingPayment) {
    return <Loader size="large" text="Проверка статуса платежа..." />;
  }

  return (
    <div className="eco-dispensing-form">
      <h2>Дозирование жидкостей</h2>
      
      {error && <ErrorMessage message={error} />}
      
      <form className="eco-form">
        <div className="eco-form-group">
          <label htmlFor="chemical">Выберите жидкость:</label>
          <select
            id="chemical"
            value={selectedChemical?.id || selectedChemical?.tank_number || ''}
            onChange={handleChemicalChange}
            disabled={chemicals.length === 0}
            className="eco-select"
          >
            {chemicals.length === 0 ? (
              <option value="">Нет доступных химикатов</option>
            ) : (
              chemicals.map((chemical) => (
                <option 
                  key={chemical.id || chemical.tank_number} 
                  value={chemical.id || chemical.tank_number}
                >
                  {chemical.name} - {chemical.price} тенге/литр
                </option>
              ))
            )}
          </select>
        </div>
        
        <div className="eco-form-group">
          <label htmlFor="volume">Объем (мл):</label>
          <input
            type="range"
            id="volume"
            value={volume}
            onChange={handleVolumeChange}
            min="100"
            max="2000"
            step="100"
            className="eco-range"
          />
          
          <div className="eco-volume-display">
            <span>{volume} мл</span>
            <span>Цена: {calculatePrice()} тенге</span>
          </div>
          
          <div className="eco-volume-indicator">
            <div className="eco-volume-circle">
              <span className="eco-volume-value">{volume}</span>
            </div>
            <span>миллилитров</span>
          </div>
        </div>
        
        <div className="eco-price-summary">
          <div className="eco-summary-row">
            <span>Объем:</span>
            <span>{volume} мл</span>
          </div>
          <div className="eco-summary-row">
            <span>Цена за литр:</span>
            <span>{selectedChemical?.price || 0} тенге</span>
          </div>
          <div className="eco-summary-total">
            <span>Итого к оплате:</span>
            <span>{calculatePrice()} тенге</span>
          </div>
        </div>
        
        <button 
          type="button" 
          onClick={handleProceedToPayment}
          disabled={!selectedChemical || chemicals.length === 0 || loading}
          className="eco-button full-width"
        >
          {loading ? 'Подождите...' : 'Оплатить через Kaspi'}
        </button>
      </form>
      
      <div className="eco-payment-instructions">
        <h3>Инструкция по использованию:</h3>
        <ol className="eco-instructions-list">
          <li>Выберите нужный химикат из списка</li>
          <li>Укажите необходимый объем в миллилитрах</li>
          <li>Нажмите кнопку "Оплатить через Kaspi"</li>
          <li>Выполните оплату в приложении Kaspi</li>
          <li>После успешной оплаты средство будет выдано автоматически</li>
        </ol>
      </div>
    </div>
  );
};

export default DispensingForm;