// src/components/common/ConnectionError.js
import React from 'react';

const ConnectionError = ({ message, onRetry, showBackButton = true }) => {
  return (
    <div className="eco-connection-error">
      <div className="eco-connection-error-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15 9L9 15" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 9L15 15" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h3 className="eco-connection-error-title">Нет соединения с сервером</h3>
      <p className="eco-connection-error-message">
        {message || 'Не удалось подключиться к серверу. Проверьте подключение к интернету или убедитесь, что сервер запущен.'}
      </p>
      <div className="eco-connection-error-actions">
        {onRetry && (
          <button className="eco-button" onClick={onRetry}>
            Повторить попытку
          </button>
        )}
        {showBackButton && (
          <a href="/" className="eco-button outline">
            Вернуться на главную
          </a>
        )}
      </div>
    </div>
  );
};

export default ConnectionError;