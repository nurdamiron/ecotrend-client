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

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/device/:deviceId" element={<DevicePage />} />
            <Route path="/dispensing/:deviceId/:tankId" element={<DispensingPage />} />
            <Route path="/payment/:deviceId" element={<PaymentPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;