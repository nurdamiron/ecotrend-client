// src/pages/DispensingPage.js
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import { dispensingService } from '../services/api';
import { paymentService } from '../services/payment';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import { useAuth } from '../contexts/AuthContext';

const DispensingPage = () => {
  const { deviceId, tankId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { saveTransaction } = useAuth();
  
  // Get transaction ID from URL if coming back from payment
  const queryParams = new URLSearchParams(location.search);
  const txnIdFromUrl = queryParams.get('txn_id');
  
  // States
  const [device, setDevice] = useState(null);
  const [chemical, setChemical] = useState(null);
  const [volume, setVolume] = useState(500);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState(null);
  
  // Load data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get device info
        let deviceData;
        try {
          // Try API first
          const response = await dispensingService.getDeviceById(deviceId);
          deviceData = response.data;
        } catch (error) {
          console.error('API error, falling back to Firebase for device:', error);
          // Fallback to Firebase
          deviceData = await firebaseService.getDeviceInfo(deviceId);
        }
        
        if (!deviceData) {
          setError('Устройство не найдено');
          setLoading(false);
          return;
        }
        
        if (deviceData.status !== 'active') {
          setError('Устройство недоступно в данный момент');
          setLoading(false);
          return;
        }
        
        setDevice({
          id: deviceId,
          ...deviceData
        });
        
        // Get chemical/container info
        let chemicalData;
        try {
          // Try API first
          const response = await dispensingService.getAvailableChemicals(deviceId);
          if (response.success) {
            const chemicals = response.data.chemicals || [];
            chemicalData = chemicals.find(c => c.id === tankId || c.tank_id === tankId);
          }
        } catch (error) {
          console.error('API error, falling back to Firebase for chemicals:', error);
          // Fallback to Firebase
          const containers = await firebaseService.getDeviceContainers(deviceId);
          chemicalData = containers.find(c => c.id === tankId);
        }
        
        if (!chemicalData) {
          setError('Выбранное средство не найдено');
          setLoading(false);
          return;
        }
        
        if (chemicalData.level < 20) {
          setError('Недостаточный уровень средства в контейнере');
          setLoading(false);
          return;
        }
        
        setChemical(chemicalData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    // Check payment status if returning from Kaspi
    const checkPayment = async () => {
      if (txnIdFromUrl) {
        setProcessingPayment(true);
        setError(null);
        
        try {
          // Check payment status
          const paymentResult = await paymentService.checkPaymentStatus(txnIdFromUrl, deviceId);
          
          if (paymentResult.success) {
            // Get saved transaction data
            const savedTransaction = JSON.parse(localStorage.getItem('lastTransaction'));
            
            if (savedTransaction && savedTransaction.volume) {
              // Initiate dispensing
              await dispensingService.dispenseChemical(
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
              setProcessingPayment(false);
            }
          } else {
            setError('Платеж не был успешно обработан. Пожалуйста, попробуйте еще раз.');
            setProcessingPayment(false);
          }
        } catch (error) {
          console.error('Error checking payment:', error);
          setError('Ошибка при проверке статуса платежа');
          setProcessingPayment(false);
        } finally {
          // Clear transaction ID from URL
          navigate(location.pathname, { replace: true });
        }
      } else {
        // If no txnId, load device and chemical data
        fetchData();
      }
    };
    
    checkPayment();
  }, [deviceId, tankId, txnIdFromUrl, navigate, location.pathname]);

  // Handle volume change
  const handleVolumeChange = (e) => {
    setVolume(parseInt(e.target.value));
  };

  // Calculate price
  const calculatePrice = () => {
    if (!chemical) return 0;
    return (chemical.price * volume / 1000).toFixed(0);
  };

  // Proceed to payment
  const handleProceedToPayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const amount = calculatePrice();
      
      // Generate payment URL
      const response = await paymentService.generatePaymentUrl(deviceId, amount);
      
      if (response.success) {
        // Save transaction info for later use
        const transactionInfo = {
          deviceId,
          tankId,
          tankNumber: chemical.tank_number,
          chemicalName: chemical.name,
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

  if (loading) {
    return (
      <div className="eco-loader-container">
        <Loader size="large" text="Загрузка информации о средстве..." />
      </div>
    );
  }
  
  if (processingPayment) {
    return (
      <div className="eco-loader-container">
        <Loader size="large" text="Проверка статуса платежа..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="eco-error-container">
        <ErrorMessage message={error} />
        <div className="eco-error-actions">
          <Link to={`/device/${deviceId}`} className="eco-button">
            Вернуться к выбору средств
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="eco-dispensing-page">
      <div className="eco-page-header">
        <Link to={`/device/${deviceId}`} className="eco-back-link">
          ← Вернуться к выбору средств
        </Link>
        <h1>Выбор объема дозирования</h1>
        <p className="eco-page-description">Укажите необходимый объем средства для дозирования</p>
      </div>

      <div className="eco-dispensing-grid">
        {/* Chemical information */}
        <div className="eco-chemical-info-card">
          <h2>Выбранное средство</h2>
          <div className="eco-chemical-details">
            <h3>{chemical.name}</h3>
            
            {chemical.description && (
              <p className="eco-chemical-description">{chemical.description}</p>
            )}
            
            <div className="eco-level-info">
              <div className="eco-level-label">Уровень заполнения:</div>
              <div className="eco-level-bar">
                <div 
                  className={`eco-level-fill ${chemical.level < 30 ? 'low' : ''}`}
                  style={{ width: `${chemical.level}%` }}
                ></div>
              </div>
              <div className="eco-level-text">
                <span>{chemical.level}%</span>
                <span>{chemical.capacity} л</span>
              </div>
            </div>
            
            <div className="eco-price-info">
              <div className="eco-price-label">Цена:</div>
              <div className="eco-price-value">{chemical.price} тенге/литр</div>
            </div>
            
            {/* Additional information */}
            {(chemical.batch_number || chemical.expiration_date || chemical.manufacturing_date) && (
              <div className="eco-additional-info">
                {chemical.batch_number && (
                  <div className="eco-info-item">
                    <span className="eco-info-label">Партия:</span>
                    <span className="eco-info-value">{chemical.batch_number}</span>
                  </div>
                )}
                
                {chemical.manufacturing_date && (
                  <div className="eco-info-item">
                    <span className="eco-info-label">Дата изготовления:</span>
                    <span className="eco-info-value">
                      {new Date(chemical.manufacturing_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {chemical.expiration_date && (
                  <div className="eco-info-item">
                    <span className="eco-info-label">Годен до:</span>
                    <span className="eco-info-value">
                      {new Date(chemical.expiration_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Volume selection */}
        <div className="eco-volume-selection">
          <h2>Укажите объем</h2>
          
          <div className="eco-volume-slider-container">
            <label htmlFor="volume" className="eco-volume-label">Объем (мл):</label>
            <input 
              type="range" 
              id="volume" 
              min="100" 
              max="2000" 
              step="100" 
              value={volume} 
              onChange={handleVolumeChange}
              className="eco-volume-slider"
            />
            
            <div className="eco-volume-marks">
              <span>100 мл</span>
              <span>500 мл</span>
              <span>1000 мл</span>
              <span>1500 мл</span>
              <span>2000 мл</span>
            </div>
          </div>
          
          <div className="eco-volume-display">
            <div className="eco-volume-circle">
              <span className="eco-volume-value">{volume}</span>
              <span className="eco-volume-unit">мл</span>
            </div>
          </div>
          
          <div className="eco-price-summary">
            <div className="eco-summary-row">
              <span className="eco-summary-label">Объем:</span>
              <span className="eco-summary-value">{volume} мл</span>
            </div>
            
            <div className="eco-summary-row">
              <span className="eco-summary-label">Цена за литр:</span>
              <span className="eco-summary-value">{chemical.price} тенге</span>
            </div>
            
            <div className="eco-summary-total">
              <span className="eco-total-label">Итого:</span>
              <span className="eco-total-value">{calculatePrice()} тенге</span>
            </div>
          </div>
          
          <button 
            onClick={handleProceedToPayment}
            disabled={loading}
            className="eco-button full-width"
          >
            {loading ? 'Обработка...' : 'Перейти к оплате'}
          </button>
        </div>
      </div>

      {/* Information blocks */}
      <div className="eco-info-blocks">
        <div className="eco-info-block instructions">
          <h3>Инструкция</h3>
          <ol className="eco-instruction-list">
            <li>Укажите необходимый объем с помощью ползунка</li>
            <li>Нажмите кнопку "Перейти к оплате"</li>
            <li>Оплатите покупку через Kaspi</li>
            <li>После успешной оплаты автомат начнет дозирование</li>
            <li>Поднесите тару к дозатору и получите средство</li>
          </ol>
        </div>
        
        <div className="eco-info-block notes">
          <h3>Обратите внимание</h3>
          <ul className="eco-notes-list">
            <li>Минимальный объем для дозирования: 100 мл</li>
            <li>Максимальный объем за одну операцию: 2000 мл</li>
            <li>Сумма списывается с вашего Kaspi кошелька</li>
            <li>После оплаты у вас будет 30 секунд для подготовки тары</li>
            <li>В случае возникновения проблем, обратитесь по номеру: +7 (700) 123-45-67</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DispensingPage;