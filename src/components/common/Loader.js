// src/components/common/Loader.js
import React from 'react';

const Loader = ({ 
  size = 'medium', 
  text = 'Загрузка...', 
  color = 'primary',
  fullScreen = false,
  overlay = false,
  center = true
}) => {
  const sizeClass = `eco-loader-${size}`;
  const colorClass = `eco-loader-${color}`;
  const containerClass = `eco-loader-container ${center ? 'eco-loader-centered' : ''} ${fullScreen ? 'eco-loader-fullscreen' : ''} ${overlay ? 'eco-loader-overlay' : ''}`;
  
  return (
    <div className={containerClass}>
      <div className={`eco-loader ${sizeClass} ${colorClass}`}>
        <svg className="eco-loader-svg" viewBox="0 0 50 50">
          <circle
            className="eco-loader-circle"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="5"
          ></circle>
        </svg>
      </div>
      {text && <p className="eco-loader-text">{text}</p>}
    </div>
  );
};

export default Loader;