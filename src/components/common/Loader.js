// src/components/common/Loader.js
import React from 'react';

const Loader = ({ size = 'medium', text = 'Загрузка...' }) => {
  // Класс на основе размера
  const loaderClass = `loader loader-${size}`;
  
  return (
    <div className="loader-container">
      <div className={loaderClass}>
        <div className="spinner"></div>
      </div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default Loader;