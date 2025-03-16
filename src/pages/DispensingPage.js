// src/pages/DispensingPage.js
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';

const DispensingPage = () => {
  const { deviceId, tankId } = useParams();
  const navigate = useNavigate();
  
  const [device, setDevice] = useState(null);
  const [chemical, setChemical] = useState(null);
  const [volume, setVolume] = useState(500);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Получаем информацию об устройстве
        const deviceInfo = await firebaseService.getDeviceInfo(deviceId);
        
        if (!deviceInfo) {
          setError('Устройство не найдено');
          setLoading(false);
          return;
        }
        
        if (deviceInfo.status !== 'active') {
          setError('Устройство недоступно в данный момент');
          setLoading(false);
          return;
        }
        
        setDevice({
          id: deviceId,
          ...deviceInfo
        });
        
        // Получаем информацию о контейнерах
        const containersData = await firebaseService.getDeviceContainers(deviceId);
        
        // Находим нужный контейнер
        const selectedChemical = containersData.find(c => c.id === tankId);
        
        if (!selectedChemical) {
          setError('Выбранное средство не найдено');
          setLoading(false);
          return;
        }
        
        if (selectedChemical.level < 20) {
          setError('Недостаточный уровень средства в контейнере');
          setLoading(false);
          return;
        }
        
        setChemical(selectedChemical);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deviceId, tankId]);

  // Обработчик изменения объема
  const handleVolumeChange = (e) => {
    setVolume(parseInt(e.target.value));
  };

  // Расчет стоимости
  const calculatePrice = () => {
    if (!chemical) return 0;
    return (chemical.price * volume / 1000).toFixed(0);
  };

  // Переход к оплате
  const handleProceedToPayment = () => {
    navigate(`/payment/${deviceId}`, { 
      state: { 
        tankId, 
        tankNumber: chemical.tank_number,
        chemicalName: chemical.name,
        price: chemical.price,
        volume,
        totalAmount: calculatePrice()
      } 
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="large" text="Загрузка информации о средстве..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorMessage message={error} />
        <div className="mt-6">
          <Link to={`/device/${deviceId}`} className="text-blue-600 hover:underline flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Вернуться к выбору средств
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="mb-6">
        <Link to={`/device/${deviceId}`} className="text-blue-600 hover:underline flex items-center mb-4 inline-block">
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Вернуться к выбору средств
        </Link>
        <h1 className="text-3xl font-bold mb-2">Выбор объема дозирования</h1>
        <p className="text-gray-600">Укажите необходимый объем средства для дозирования</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:space-x-8">
          {/* Информация о выбранном средстве */}
          <div className="md:w-1/3 mb-6 md:mb-0">
            <h2 className="text-xl font-semibold mb-4">Выбранное средство</h2>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{chemical.name.replace(/_/g, ' ')}</h3>
              <div className="mb-3">
                <span className="text-gray-600">Цена:</span> 
                <span className="font-medium"> {chemical.price} тенге/литр</span>
              </div>
              
              {/* Индикатор уровня */}
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${chemical.level > 30 ? 'bg-green-500' : 'bg-yellow-500'}`}
                    style={{ width: `${chemical.level}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Уровень: {chemical.level}%</span>
                  <span>{chemical.capacity} л</span>
                </div>
              </div>
              
              {/* Дополнительная информация */}
              {(chemical.batch_number || chemical.expiration_date || chemical.manufacturing_date) && (
                <div className="text-xs text-gray-500 border-t pt-2 mt-2">
                  {chemical.batch_number && (
                    <p className="mb-1">Партия: {chemical.batch_number}</p>
                  )}
                  {chemical.manufacturing_date && (
                    <p className="mb-1">Дата изготовления: {new Date(chemical.manufacturing_date).toLocaleDateString()}</p>
                  )}
                  {chemical.expiration_date && (
                    <p>Годен до: {new Date(chemical.expiration_date).toLocaleDateString()}</p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Выбор объема */}
          <div className="md:w-2/3">
            <h2 className="text-xl font-semibold mb-4">Укажите объем</h2>
            <div className="p-6 border rounded-lg">
              <div className="mb-8">
                <label htmlFor="volume" className="block text-gray-700 mb-2">Объем (мл):</label>
                <input 
                  type="range" 
                  id="volume" 
                  min="100" 
                  max="2000" 
                  step="100" 
                  value={volume} 
                  onChange={handleVolumeChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>100 мл</span>
                  <span>500 мл</span>
                  <span>1000 мл</span>
                  <span>1500 мл</span>
                  <span>2000 мл</span>
                </div>
              </div>
              
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 flex items-center justify-center bg-blue-50 rounded-full">
                  <span className="text-3xl font-bold text-blue-600">{volume} мл</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Объем:</span>
                  <span className="font-medium">{volume} мл</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Цена за литр:</span>
                  <span className="font-medium">{chemical.price} тенге</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-600">Итого:</span>
                  <span className="text-blue-600">{calculatePrice()} тенге</span>
                </div>
              </div>
              
              <button 
                onClick={handleProceedToPayment}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Перейти к оплате
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Информационные блоки */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Инструкция</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Укажите необходимый объем с помощью ползунка</li>
            <li>Нажмите кнопку "Перейти к оплате"</li>
            <li>Оплатите покупку через Kaspi QR</li>
            <li>После успешной оплаты автомат начнет дозирование</li>
            <li>Поднесите тару к дозатору и получите средство</li>
          </ol>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Обратите внимание</h3>
          <ul className="list-disc pl-5 space-y-2">
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