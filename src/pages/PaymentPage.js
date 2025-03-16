// src/pages/PaymentPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import KaspiQR from '../components/payment/KaspiQR';

const PaymentPage = () => {
  // Можно получить deviceId из URL или из localStorage, если это необходимо
  const deviceId = new URLSearchParams(window.location.search).get('deviceId') || 'DEVICE-001';
  
  return (
    <div className="payment-page">
      <div className="page-header">
        <h1>Оплата через Kaspi QR</h1>
        <p>Оплатите услугу быстро и удобно с помощью Kaspi QR</p>
      </div>
      
      <KaspiQR deviceId={deviceId} />
      
      <div className="back-link">
        <Link to="/">← Вернуться на главную</Link>
      </div>
      
      <div className="info-box">
        <h3>Информация об оплате</h3>
        <p>
          Для оплаты вам понадобится приложение Kaspi.kz на вашем смартфоне. Если у вас 
          его еще нет, вы можете скачать его в App Store или Google Play.
        </p>
        <p>
          После успешной оплаты вы сможете перейти к дозированию выбранной жидкости.
        </p>
      </div>
      
      <div className="payment-tips">
        <h3>Советы по оплате</h3>
        <ul>
          <li>Убедитесь, что на вашем смартфоне включен интернет</li>
          <li>Обратите внимание на сумму перед подтверждением платежа</li>
          <li>Проверьте, что камера вашего смартфона работает корректно</li>
          <li>Держите смартфон на расстоянии 15-20 см от QR-кода</li>
        </ul>
      </div>
      
      <div className="device-info">
        <h3>Устройство: {deviceId}</h3>
        <p>Проверьте номер устройства перед оплатой</p>
      </div>
    </div>
  );
};

export default PaymentPage;