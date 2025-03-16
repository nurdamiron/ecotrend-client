// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Добро пожаловать в систему дозирования жидкостей EcoTrend</h1>
          <p>Выберите действие, которое вы хотите выполнить:</p>
          
          <div className="action-buttons">
            <Link to="/dispensing" className="action-button dispense">
              <div className="icon">💧</div>
              <div className="text">
                <h2>Налить жидкость</h2>
                <p>Выберите тип жидкости и объем для дозирования</p>
              </div>
            </Link>
            
            <Link to="/payment" className="action-button payment">
              <div className="icon">💰</div>
              <div className="text">
                <h2>Оплатить услугу</h2>
                <p>Оплатите услугу через Kaspi QR</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
      
      <section className="features">
        <h2>Преимущества нашей системы</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Точное дозирование</h3>
            <p>Наша система обеспечивает точное дозирование жидкостей с погрешностью менее 1%</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🌿</div>
            <h3>Экологичность</h3>
            <p>Многоразовое использование тары снижает количество пластиковых отходов</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💸</div>
            <h3>Экономия</h3>
            <p>Покупайте только нужное количество продукта без переплаты за упаковку</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Быстрая оплата</h3>
            <p>Быстрая и удобная оплата через Kaspi QR без очередей</p>
          </div>
        </div>
      </section>
      
      <section className="how-it-works">
        <h2>Как это работает</h2>
        
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Подходите к автомату</h3>
            <p>Найдите QR-код на корпусе автомата</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>Сканируйте QR</h3>
            <p>Отсканируйте QR-код своим телефоном</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>Выберите жидкость</h3>
            <p>Выберите нужный тип жидкости и объем</p>
          </div>
          
          <div className="step">
            <div className="step-number">4</div>
            <h3>Оплатите услугу</h3>
            <p>Оплатите через Kaspi QR</p>
          </div>
          
          <div className="step">
            <div className="step-number">5</div>
            <h3>Заберите продукт</h3>
            <p>Заберите свою тару с налитым средством</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;