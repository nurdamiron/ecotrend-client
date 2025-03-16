// src/pages/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Страница не найдена</h2>
        <p>Извините, но запрашиваемая вами страница не существует или была перемещена.</p>
        
        <Link to="/" className="home-button">
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;