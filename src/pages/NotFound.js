// src/pages/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="eco-not-found">
      <div className="eco-not-found-code">404</div>
      <h1 className="eco-not-found-title">Страница не найдена</h1>
      <p className="eco-not-found-message">
        Извините, но запрашиваемая вами страница не существует или была перемещена.
      </p>
      
      <Link to="/" className="eco-button">
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFoundPage;