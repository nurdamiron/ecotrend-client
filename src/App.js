// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import DevicePage from './pages/DevicePage';
import DispensingPage from './pages/DispensingPage';
import PaymentPage from './pages/PaymentPage';
import SuccessPage from './pages/SuccessPage';
import NotFoundPage from './pages/NotFound';
import './App.css';
import './styles/ecoStyle.css'; // Новый файл стилей с экологичной темой

function App() {
  return (
    <Router>
      <div className="eco-app">
        <Header />
        <main className="eco-main">
          <div className="eco-container">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/device/:deviceId" element={<DevicePage />} />
              <Route path="/dispensing/:deviceId/:tankId" element={<DispensingPage />} />
              <Route path="/payment/:deviceId" element={<PaymentPage />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;