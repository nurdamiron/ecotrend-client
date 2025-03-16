// src/pages/SuccessPage.js
import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Получаем данные из state
  const { deviceId, tankId, chemicalName, volume, amount, transactionId } = location.state || {};
  
  // Если нет данных, перенаправляем на главную страницу
  useEffect(() => {
    if (!deviceId || !volume) {
      navigate('/');
      return;
    }
    
    // Запускаем конфетти для празднования
    const launchConfetti = () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    };
    
    // Запускаем конфетти с небольшой задержкой
    const timer = setTimeout(launchConfetti, 500);
    
    // Через 30 секунд автоматически перенаправляем на главную страницу
    const redirectTimer = setTimeout(() => {
      navigate('/');
    }, 30000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(redirectTimer);
    };
  }, [deviceId, volume, navigate]);

  // Если нет данных, не рендерим содержимое
  if (!deviceId || !volume) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Операция успешно завершена!</h1>
        <p className="text-lg text-gray-600 mb-8">Спасибо за использование EcoTrend!</p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-8">
          <h2 className="font-semibold text-lg mb-4 border-b pb-2">Детали операции</h2>
          
          <div className="space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600">Устройство:</span>
              <span className="font-medium">{deviceId}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Средство:</span>
              <span className="font-medium">{chemicalName ? chemicalName.replace(/_/g, ' ') : 'Выбранное средство'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Объем:</span>
              <span className="font-medium">{volume} мл</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Стоимость:</span>
              <span className="font-medium">{amount} тенге</span>
            </div>
            
            {transactionId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Транзакция:</span>
                <span className="font-medium text-xs">{transactionId}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <Link 
            to="/" 
            className="block w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Вернуться на главную
          </Link>
          
          <Link 
            to={`/device/${deviceId}`} 
            className="block w-full bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-300 transition"
          >
            Выбрать другое средство
          </Link>
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Вы будете автоматически перенаправлены на главную страницу через 30 секунд</p>
      </div>
      
      <div className="mt-6 px-4 py-3 bg-green-50 border border-green-200 rounded-lg max-w-md">
        <p className="text-center text-green-700">
          <span className="font-semibold">Спасибо, что заботитесь о природе!</span><br />
          Используя многоразовую тару, вы сокращаете количество пластиковых отходов.
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;