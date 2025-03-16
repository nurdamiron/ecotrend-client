// src/components/dispensing/DispensingForm.js - обновленная версия
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { dispensingService, kaspiService } from '../../services/api';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import QRCode from 'qrcode.react';

const DispensingForm = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  
  // Состояния компонента
  const [chemicals, setChemicals] = useState([]);
  const [selectedChemical, setSelectedChemical] = useState(null);
  const [volume, setVolume] = useState(500);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentStep, setPaymentStep] = useState('select'); // select, qr, processing, success, error
  const [paymentData, setPaymentData] = useState(null);
  
  // Загрузка списка доступных химикатов
  useEffect(() => {
    const fetchChemicals = async () => {
      setIsLoading(true);
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
        setIsLoading(false);
      }
    };

    fetchChemicals();
  }, [deviceId]);

  // Расчет стоимости
  const calculatePrice = () => {
    if (!selectedChemical) return 0;
    return (selectedChemical.price * volume / 1000).toFixed(0);
  };
  
  // Генерация QR-кода для оплаты
  const generatePaymentQR = async () => {
    if (!selectedChemical) {
      setError('Пожалуйста, выберите химикат');
      return;
    }
    
    const amount = calculatePrice();
    
    if (amount <= 0) {
      setError('Невозможно оплатить нулевую сумму');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Вызов обновленного сервиса для инициализации платежа
      const response = await kaspiService.initiatePayment(deviceId, amount);
      
      if (response.success) {
        setPaymentData(response.data);
        setPaymentStep('qr');
        
        // Начинаем проверять статус платежа через 5 секунд
        setTimeout(() => checkPaymentStatus(response.data.txn_id), 5000);
      } else {
        setError(response.message || 'Не удалось сгенерировать QR-код');
        setPaymentStep('error');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Произошла ошибка при создании платежа');
      setPaymentStep('error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Проверка статуса платежа
  const checkPaymentStatus = async (txnId) => {
    if (paymentStep !== 'qr') return;
    
    try {
      const response = await kaspiService.processPayment(
        txnId,
        deviceId,
        calculatePrice()
      );
      
      if (response.success) {
        // Платеж успешен
        setPaymentStep('success');
        
        // Запрос на дозирование
        const tankNumber = selectedChemical.tank_number || selectedChemical.id;
        await dispensingService.dispenseChemical(deviceId, tankNumber, volume);
        
        // Перенаправление на страницу успеха через 3 секунды
        setTimeout(() => {
          navigate('/success', { 
            state: { 
              deviceId, 
              chemical: selectedChemical.name,
              volume,
              amount: calculatePrice() 
            } 
          });
        }, 3000);
      } else {
        // Продолжаем проверять каждые 5 секунд
        setTimeout(() => checkPaymentStatus(txnId), 5000);
      }
    } catch (error) {
      console.error('Ошибка при проверке статуса платежа:', error);
      // Продолжаем проверять, даже если произошла ошибка
      setTimeout(() => checkPaymentStatus(txnId), 5000);
    }
  };
  
  // Обработчик выбора химиката
  const handleChemicalChange = (e) => {
    const selectedId = e.target.value;
    const chemical = chemicals.find(c => c.id === selectedId || c.tank_number === selectedId);
    setSelectedChemical(chemical);
  };
  
  // Обработчик изменения объема
  const handleVolumeChange = (e) => {
    setVolume(parseInt(e.target.value));
  };
  
  // Отображение инструкций по этапам
  const renderInstructions = () => {
    if (paymentStep === 'qr') {
      return (
        <div className="payment-instructions">
          <h3>Инструкция по оплате:</h3>
          <ol>
            <li>Откройте приложение Kaspi на вашем телефоне</li>
            <li>Выберите "Платежи" → "Сканировать"</li>
            <li>Отсканируйте QR-код, отображаемый на экране</li>
            <li>Подтвердите платеж в приложении Kaspi</li>
            <li>После подтверждения платежа, средство будет выдано автоматически</li>
          </ol>
        </div>
      );
    }
    
    return (
      <div className="dispensing-instructions">
        <h3>Инструкция по использованию:</h3>
        <ol>
          <li>Выберите нужный химикат из списка</li>
          <li>Укажите необходимый объем в миллилитрах</li>
          <li>Нажмите кнопку "Перейти к оплате"</li>
          <li>Оплатите через Kaspi QR</li>
          <li>Подождите завершения операции</li>
          <li>Заберите емкость с налитым средством</li>
        </ol>
      </div>
    );
  };

  // Отображение QR-кода для оплаты
  const renderPaymentQR = () => {
    if (!paymentData) return null;
    
    return (
      <div className="payment-qr">
        <h3>Отсканируйте QR-код для оплаты</h3>
        <div className="qr-container">
          <QRCode value={paymentData.qr_code_url} size={256} />
        </div>
        <p>Сумма к оплате: <strong>{calculatePrice()} тенге</strong></p>
        <p>Ожидание оплаты...</p>
        
        <button 
          onClick={() => setPaymentStep('select')}
          className="cancel-button"
        >
          Отменить
        </button>
      </div>
    );
  };
  
  // Отображение состояния успешной оплаты
  const renderPaymentSuccess = () => {
    return (
      <div className="payment-success">
        <h3>Платеж успешно обработан!</h3>
        <p>Дозирование начнется через несколько секунд...</p>
        <div className="loader"></div>
      </div>
    );
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="dispensing-form-container">
      <h2>Дозирование жидкостей</h2>
      
      {error && <ErrorMessage message={error} />}
      
      {paymentStep === 'select' && (
        <form className="dispensing-form">
          <div className="form-group">
            <label htmlFor="chemical">Выберите жидкость:</label>
            <select
              id="chemical"
              value={selectedChemical?.id || selectedChemical?.tank_number || ''}
              onChange={handleChemicalChange}
              disabled={chemicals.length === 0}
            >
              {chemicals.length === 0 ? (
                <option value="">Нет доступных химикатов</option>
              ) : (
                chemicals.map((chemical) => (
                  <option key={chemical.id || chemical.tank_number} value={chemical.id || chemical.tank_number}>
                    {chemical.name} - {chemical.price} тенге/литр
                  </option>
                ))
              )}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="volume">Объем (мл):</label>
            <input
              type="range"
              id="volume"
              value={volume}
              onChange={handleVolumeChange}
              min="100"
              max="2000"
              step="100"
            />
            <div className="volume-display">
              <span>{volume} мл</span>
              <span>Цена: {calculatePrice()} тенге</span>
            </div>
          </div>
          
          <button 
            type="button" 
            onClick={generatePaymentQR}
            disabled={!selectedChemical || chemicals.length === 0}
            className="payment-button"
          >
            Перейти к оплате
          </button>
        </form>
      )}
      
      {paymentStep === 'qr' && renderPaymentQR()}
      {paymentStep === 'success' && renderPaymentSuccess()}
      
      {renderInstructions()}
    </div>
  );
};

export default DispensingForm;