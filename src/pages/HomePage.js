// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';

const HomePage = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      try {
        const devicesData = await firebaseService.getAvailableDevices();
        setDevices(devicesData);
      } catch (err) {
        console.error('Ошибка при загрузке устройств:', err);
        setError('Не удалось загрузить список устройств');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  return (
    <div>
      {/* Hero секция */}
      <section className="bg-gradient-to-r from-blue-600 to-green-500 rounded-lg text-white p-8 mb-12 shadow-lg">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Экологичное дозирование моющих средств</h1>
          <p className="text-xl mb-8">Наливайте ровно столько, сколько нужно. Экономьте деньги и берегите природу.</p>
          <a href="#devices" className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition inline-block">
            Найти ближайший автомат
          </a>
        </div>
      </section>

      {/* Секция "Как это работает" */}
      <section id="how-it-works" className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">Как это работает</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold mx-auto mb-4">1</div>
            <h3 className="text-xl font-semibold mb-2">Сканируйте QR-код</h3>
            <p className="text-gray-600">Найдите автомат и отсканируйте QR-код с помощью смартфона</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold mx-auto mb-4">2</div>
            <h3 className="text-xl font-semibold mb-2">Выберите средство</h3>
            <p className="text-gray-600">Выберите нужное средство и укажите объем</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold mx-auto mb-4">3</div>
            <h3 className="text-xl font-semibold mb-2">Оплатите через Kaspi</h3>
            <p className="text-gray-600">Оплатите покупку через Kaspi QR и получите свое средство</p>
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">Преимущества EcoTrend</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
            <h3 className="text-xl font-semibold mb-2">Экологичность</h3>
            <p className="text-gray-600">Уменьшение использования пластиковой упаковки для бытовой химии</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
            <h3 className="text-xl font-semibold mb-2">Экономия</h3>
            <p className="text-gray-600">Платите только за то количество средства, которое вам действительно нужно</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-yellow-500">
            <h3 className="text-xl font-semibold mb-2">Удобство</h3>
            <p className="text-gray-600">Быстрая оплата через Kaspi и мгновенное получение продукта</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-500">
            <h3 className="text-xl font-semibold mb-2">Качество</h3>
            <p className="text-gray-600">Только проверенные средства от надежных производителей</p>
          </div>
        </div>
      </section>

      {/* Список устройств */}
      <section id="devices" className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">Доступные устройства</h2>
        
        {loading ? (
          <div className="flex justify-center">
            <Loader size="large" text="Загрузка доступных устройств..." />
          </div>
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {devices.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">
                <p>В данный момент нет доступных устройств</p>
              </div>
            ) : (
              devices.map(device => (
                <div key={device.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{device.name}</h3>
                    <p className="text-gray-600 mb-4">
                      <span className="inline-block mr-2">📍</span> 
                      {device.location}
                    </p>
                    <div className="flex items-center mb-4">
                      <span className={`inline-block w-3 h-3 rounded-full mr-2 ${device.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-sm text-gray-500">
                        {device.status === 'active' ? 'Доступен' : 'Недоступен'}
                      </span>
                    </div>
                    {device.status === 'active' ? (
                      <Link 
                        to={`/device/${device.id}`} 
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        Выбрать
                      </Link>
                    ) : (
                      <button 
                        disabled 
                        className="inline-block bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed"
                      >
                        Недоступно
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* Связь с нами */}
      <section className="bg-gray-100 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-6">У вас есть вопросы?</h2>
        <p className="text-center text-gray-600 mb-8">Свяжитесь с нами, если вам нужна дополнительная информация или у вас есть предложения</p>
        
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <a href="tel:+77001234567" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Позвонить
          </a>
          <a href="mailto:info@ecotrend.kz" className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Написать
          </a>
          <a href="https://t.me/ecotrend" className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"></path>
            </svg>
            Telegram
          </a>
        </div>
      </section>
    </div>
  );
};

export default HomePage;