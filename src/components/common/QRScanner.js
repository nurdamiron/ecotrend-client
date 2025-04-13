// src/components/common/QRScanner.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../../contexts/UIContext';

const QRScanner = ({ onClose }) => {
  const [hasCamera, setHasCamera] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const navigate = useNavigate();
  const { addNotification } = useUI();
  
  // Setup camera when component mounts
  useEffect(() => {
    const setupCamera = async () => {
      try {
        // Check if browser supports camera access
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setErrorMessage('Ваш браузер не поддерживает доступ к камере.');
          return;
        }
        
        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCamera(true);
          setTimeout(() => setScanning(true), 1000); // Start scanning after a delay
        }
      } catch (error) {
        console.error('Camera access error:', error);
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setErrorMessage('Доступ к камере запрещен. Пожалуйста, разрешите доступ к камере.');
        } else {
          setErrorMessage('Ошибка при доступе к камере: ' + error.message);
        }
      }
    };
    
    setupCamera();
    
    // Clean up camera when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Scan QR code from video
  useEffect(() => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    let animationId;
    
    const scanQRCode = async () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        try {
          // Use BarcodeDetector API if available
          if ('BarcodeDetector' in window) {
            const barcodeDetector = new window.BarcodeDetector({
              formats: ['qr_code']
            });
            
            const barcodes = await barcodeDetector.detect(canvas);
            
            if (barcodes.length > 0) {
              processQRCodeResult(barcodes[0].rawValue);
              return;
            }
          } else {
            // If BarcodeDetector API is not available, 
            // we can't scan in the browser - would need to use a library
            console.log('BarcodeDetector API not available');
          }
        } catch (error) {
          console.error('QR code scanning error:', error);
        }
      }
      
      // Continue scanning
      animationId = requestAnimationFrame(scanQRCode);
    };
    
    animationId = requestAnimationFrame(scanQRCode);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [scanning]);
  
  // Process QR code result
  const processQRCodeResult = (result) => {
    // Stop scanning
    setScanning(false);
    
    try {
      // Expected format: https://domain.com/device/DEVICE-ID
      // Or similar structure with device ID
      
      let deviceId = null;
      
      // If it's a URL, try to extract device ID
      if (result.startsWith('http')) {
        const url = new URL(result);
        const pathParts = url.pathname.split('/').filter(part => part.length > 0);
        
        // Check if the URL structure matches our expected format
        if (pathParts.length >= 2 && pathParts[0] === 'device') {
          deviceId = pathParts[1];
        }
      } 
      // If it's just a device ID (e.g., DEVICE-001)
      else if (result.startsWith('DEVICE-')) {
        deviceId = result;
      }
      
      if (deviceId) {
        // Close scanner
        onClose();
        
        // Show success notification
        addNotification({
          type: 'success',
          message: `QR-код успешно отсканирован. Переход к устройству ${deviceId}...`
        });
        
        // Navigate to device page
        navigate(`/device/${deviceId}`);
      } else {
        // Unrecognized QR code format
        setErrorMessage('Неподдерживаемый формат QR-кода. Попробуйте другой QR-код.');
        setTimeout(() => setScanning(true), 2000); // Resume scanning after delay
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      setErrorMessage('Ошибка при обработке QR-кода. Попробуйте еще раз.');
      setTimeout(() => setScanning(true), 2000); // Resume scanning after delay
    }
  };
  
  return (
    <div className="eco-qr-scanner">
      <div className="eco-scanner-header">
        <h3>Сканирование QR-кода</h3>
        <p className="eco-scanner-subtitle">
          Наведите камеру на QR-код устройства
        </p>
      </div>
      
      <div className="eco-scanner-container">
        {errorMessage && (
          <div className="eco-scanner-error">
            <p>{errorMessage}</p>
            <button 
              onClick={onClose}
              className="eco-button small"
            >
              Закрыть
            </button>
          </div>
        )}
        
        {!errorMessage && (
          <>
            <div className="eco-scanner-viewport">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                onCanPlay={() => videoRef.current.play()}
              ></video>
              <div className="eco-scanner-overlay">
                <div className="eco-scanner-target">
                  <div className="eco-scanner-border-tl"></div>
                  <div className="eco-scanner-border-tr"></div>
                  <div className="eco-scanner-border-bl"></div>
                  <div className="eco-scanner-border-br"></div>
                </div>
                {scanning && (
                  <div className="eco-scanner-line"></div>
                )}
              </div>
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
          </>
        )}
        
        <div className="eco-scanner-actions">
          <button 
            onClick={onClose}
            className="eco-button outline"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;