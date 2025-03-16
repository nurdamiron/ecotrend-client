// src/components/common/ErrorMessage.js
import React from 'react';

const ErrorMessage = ({ message, onClose }) => {
  return (
    <div className="error-message">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <p>{message}</p>
      </div>
      {onClose && (
        <button className="error-close" onClick={onClose}>
          &times;
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;