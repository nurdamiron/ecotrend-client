// src/components/dispensing/DispensingForm.js
import React, { useState, useEffect } from 'react';
import { dispensingService } from '../../services/api';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';

const DispensingForm = ({ deviceId = 'DEVICE-001' }) => {
  const [chemicals, setChemicals] = useState([]);
  const [selectedChemical, setSelectedChemical] = useState('');
  const [volume, setVolume] = useState('500');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dispensingStatus, setDispensingStatus] = useState('idle'); // idle, loading, success, error
  const [dispensingResult, setDispensingResult] = useState(null);

  // Загрузка списка доступных химикатов
  useEffect(() => {
    const fetchChemicals = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const response = await dispensingService.getAvailableChemicals(deviceId);
        if (response.success) {
          setChemicals(response.data.chemicals || []);
          if (response.data.chemicals && response.data.chemicals.length > 0) {
            setSelectedChemical(response.data.chemicals[0].tank_number);
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

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedChemical) {
      setError('Пожалуйста, выберите химикат');
      return;
    }
    
    const volumeValue = parseFloat(volume);
    if (isNaN(volumeValue) || volumeValue <= 0) {
      setError('Пожалуйста, введите корректный объем');
      return;
    }
    
    setDispensingStatus('loading');
    setError('');
    
    try {
      const response = await dispensingService.dispenseChemical(
        deviceId,
        selectedChemical,
        volumeValue
      );
      
      if (response.success) {
        setDispensingStatus('success');
        setDispensingResult(response.data);
      } else {
        setDispensingStatus('error');
        setError(response.message || 'Не удалось выполнить дозирование');
      }
    } catch (error) {
      setDispensingStatus('error');
      setError(error.response?.data?.message || 'Произошла ошибка при дозировании');
    }
  };

  // Получить название химиката по номеру бака
  const getChemicalName = (tankNumber) => {
    const chemical = chemicals.find(c => c.tank_number === parseInt(tankNumber));
    return chemical ? chemical.name : 'Неизвестный химикат';
  };

  // Отображение результата дозирования
  const renderDispensingResult = () => {
    if (dispensingStatus !== 'success' || !dispensingResult) return null;
    
    return (
      <div className="dispensing-result">
        <h3>Дозирование успешно выполнено!</h3>
        <p>Устройство: {dispensingResult.device_id}</p>
        <p>Химикат: {getChemicalName(dispensingResult.tank_number)}</p>
        <p>Объем: {dispensingResult.volume} мл</p>
        <button 
          onClick={() => {
            setDispensingStatus('idle');
            setDispensingResult(null);
          }}
          className="new-dispensing-btn"
        >
          Новое дозирование
        </button>
      </div>
    );
  };

  // Отображение инструкций
  const renderInstructions = () => (
    <div className="dispensing-instructions">
      <h3>Инструкция по использованию:</h3>
      <ol>
        <li>Выберите нужный химикат из списка</li>
        <li>Укажите необходимый объем в миллилитрах</li>
        <li>Нажмите кнопку "Налить"</li>
        <li>Подождите завершения операции</li>
        <li>Заберите емкость с налитым средством</li>
      </ol>
    </div>
  );

  if (isLoading) {
    return <Loader />;
  }

  if (dispensingStatus === 'success') {
    return renderDispensingResult();
  }

  return (
    <div className="dispensing-form-container">
      <h2>Дозирование жидкостей</h2>
      
      {error && <ErrorMessage message={error} />}
      
      <form onSubmit={handleSubmit} className="dispensing-form">
        <div className="form-group">
          <label htmlFor="chemical">Выберите жидкость:</label>
          <select
            id="chemical"
            value={selectedChemical}
            onChange={(e) => setSelectedChemical(e.target.value)}
            disabled={dispensingStatus === 'loading' || chemicals.length === 0}
          >
            {chemicals.length === 0 ? (
              <option value="">Нет доступных химикатов</option>
            ) : (
              chemicals.map((chemical) => (
                <option key={chemical.tank_number} value={chemical.tank_number}>
                  {chemical.name} ({chemical.tank_number})
                </option>
              ))
            )}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="volume">Объем (мл):</label>
          <input
            type="number"
            id="volume"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            min="100"
            max="2000"
            step="100"
            disabled={dispensingStatus === 'loading'}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={dispensingStatus === 'loading' || chemicals.length === 0}
          className="dispense-button"
        >
          {dispensingStatus === 'loading' ? 'Дозирование...' : 'Налить'}
        </button>
      </form>
      
      {renderInstructions()}
    </div>
  );
};

export default DispensingForm;