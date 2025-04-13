// src/components/common/Modal.js
import React, { useEffect, useRef } from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'medium', // small, medium, large, fullscreen
  closeOnOutsideClick = true,
  showCloseButton = true,
  className = '' 
}) => {
  const modalRef = useRef(null);
  
  // Handle closing the modal when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    // Lock body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  // Handle outside click
  const handleOutsideClick = (e) => {
    if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  // Determine modal size class
  const sizeClass = `eco-modal-${size}`;
  
  return (
    <div className="eco-modal-overlay" onClick={handleOutsideClick}>
      <div className={`eco-modal ${sizeClass} ${className}`} ref={modalRef}>
        <div className="eco-modal-header">
          <h3 className="eco-modal-title">{title}</h3>
          {showCloseButton && (
            <button 
              className="eco-modal-close" 
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="eco-modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;