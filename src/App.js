// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './styles/global.css';

// Импорт страниц
import Home from './pages/Home';
import DispensingPage from './pages/DispensingPage';
import PaymentPage from './pages/PaymentPage';
import NotFound from './pages/NotFound';

// Импорт компонентов
import Header from './components/common/Header';
import Footer from './components/common/Footer';

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Header />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dispensing" element={<DispensingPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
};

export default App;