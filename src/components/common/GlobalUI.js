// src/components/common/GlobalUI.js
import React from 'react';
import NotificationSystem from './NotificationSystem';
import Modal from './Modal';
import { useUI } from '../../contexts/UIContext';

const GlobalUI = () => {
  const { globalLoading, globalModal, closeModal } = useUI();
  
  return (
    <>
      {/* Global Notifications */}
      <NotificationSystem />
      
      {/* Global Loading Overlay */}
      {globalLoading && (
        <div className="eco-global-loading-overlay">
          <div className="eco-global-loader">
            <div className="eco-spinner"></div>
            <p>Загрузка...</p>
          </div>
        </div>
      )}
      
      {/* Global Modal */}
      <Modal
        isOpen={globalModal.isOpen}
        onClose={closeModal}
        title={globalModal.title}
        size={globalModal.size}
      >
        {globalModal.content}
      </Modal>
    </>
  );
};

export default GlobalUI;