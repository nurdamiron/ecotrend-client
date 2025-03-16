// src/pages/PaymentPage.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { kaspiService } from '../services/api';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import { QRCodeCanvas } from 'qrcode.react';
const PaymentPage = () => {
  const { deviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Данные о средстве и объеме, полученные из предыдущей страницы
  const { tankId, tankNumber, chemicalName, price, volume, totalAmount } = location.state || {};
  
  // Состояния компонента
  const [qrData, setQrData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, checking, success, failure
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(300); // 5 минут на оплату
  
  // Ref для хранения ID интервала проверки статуса оплаты
  const checkIntervalRef = useRef(null);
  
  // Ref для хранения ID интервала отсчета времени
  const countdownIntervalRef = useRef(null);

  // Эффект для генерации QR-кода при загрузке страницы
  useEffect(() => {
    // Проверяем, есть ли необходимые данные
    if (!deviceId || !tankId || !volume) {
      setError('Недостаточно данных для оплаты');
      setLoading(false);
      return;
    }
    
    const generateQR = async () => {
      try {
        setLoading(true);
        const response = await kaspiService.generateQR(deviceId, totalAmount);
        
        if (response.success) {
          setQrData(response.data);
          // Запускаем проверку статуса платежа
          startPaymentCheck(response.data.txn_id);
          // Запускаем обратный отсчет
          startCountdown();
        } else {
          setError(response.message || 'Не удалось сгенерировать QR-код для оплаты');
          setPaymentStatus('failure');
        }
      } catch (err) {
        console.error('Ошибка при генерации QR-кода:', err);
        setError('Произошла ошибка при подготовке оплаты');
        setPaymentStatus('failure');
      } finally {
        setLoading(false);
      }
    };

    generateQR();
    
    // Очистка интервалов при размонтировании компонента
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [deviceId, tankId, volume, totalAmount]);

  // Функция для запуска периодической проверки статуса платежа
  const startPaymentCheck = (txnId) => {
    // Первая проверка через 10 секунд
    const timeout = setTimeout(() => {
      checkPaymentStatus(txnId);
      
      // Дальнейшие проверки каждые 5 секунд
      checkIntervalRef.current = setInterval(() => {
        checkPaymentStatus(txnId);
      }, 5000);
    }, 10000);
    
    return () => {
      clearTimeout(timeout);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  };
  
  // Функция для запуска обратного отсчета
  const startCountdown = () => {
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
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

  // Функция для проверки статуса платежа
  const checkPaymentStatus = async (txnId) => {
    try {
      setPaymentStatus('checking');
      const response = await kaspiService.checkPaymentStatus(txnId, deviceId);
      
      if (response.success) {
        // Очищаем интервалы, так как оплата успешна
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
        
        setPaymentStatus('success');
        
        // Перенаправляем на страницу успешной оплаты через 3 секунды
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
      }
    } catch (err) {
      console.error('Ошибка при проверке статуса платежа:', err);
      // Не меняем статус на failure, продолжаем проверять
    }
  };

  // Форматирование времени обратного отсчета
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Отображение состояния ожидания
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader size="large" text="Подготовка QR-кода для оплаты..." />
      </div>
    );
  }

  // Отображение ошибки
  if (error && paymentStatus === 'failure') {
    return (
      <div className="py-8">
        <ErrorMessage message={error} />
        <div className="flex justify-center mt-8">
          <Link 
            to={`/dispensing/${deviceId}/${tankId}`} 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Вернуться к выбору объема
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="mb-6">
        <Link 
          to={`/dispensing/${deviceId}/${tankId}`} 
          className="text-blue-600 hover:underline flex items-center mb-4 inline-block"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Вернуться к выбору объема
        </Link>
        <h1 className="text-3xl font-bold mb-2">Оплата через Kaspi QR</h1>
        <p className="text-gray-600">Отсканируйте QR-код с помощью приложения Kaspi.kz</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:space-x-8">
          {/* QR-код для оплаты */}
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-xl font-semibold mb-4 text-center">Сканируйте QR-код</h2>
            
            <div className="flex justify-center">
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                {qrData ? (
                  <QRCodeCanvas
                    value={qrData.qr_code_url} 
                    size={240}
                    renderAs="svg"
                    includeMargin={true}
                    level="H"
                  />
                ) : (
                  <div className="w-60 h-60 bg-gray-200 animate-pulse rounded"></div>
                )}
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">Время до истечения QR-кода: <span className="font-semibold">{formatCountdown()}</span></p>
            </div>
            
            {/* Статус оплаты */}
            <div className="mt-6">
              {paymentStatus === 'pending' && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Ожидание сканирования QR-кода</span>
                </div>
              )}
              
              {paymentStatus === 'checking' && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-center">
                  <svg className="animate-spin h-5 w-5 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Проверка статуса оплаты...</span>
                </div>
              )}
              
              {paymentStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Оплата прошла успешно! Перенаправление...</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Информация о заказе */}
          <div className="md:w-1/2 md:border-l md:pl-8">
            <h2 className="text-xl font-semibold mb-4">Детали заказа</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Устройство:</span>
                <span className="font-medium">{deviceId}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Средство:</span>
                <span className="font-medium">{chemicalName ? chemicalName.replace(/_/g, ' ') : 'Выбранное средство'}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Объем:</span>
                <span className="font-medium">{volume} мл</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Цена за литр:</span>
                <span className="font-medium">{price} тенге</span>
              </div>
              
              <div className="flex justify-between pt-2 text-lg font-semibold">
                <span className="text-gray-700">Итого:</span>
                <span className="text-blue-600">{totalAmount} тенге</span>
              </div>
            </div>
            
            {/* Инструкция */}
            <div className="mt-8 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Как оплатить через Kaspi QR:</h3>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold mb-3">Важная информация</h3>
        <ul className="list-disc pl-5 space-y-2">
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