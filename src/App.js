// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import GlobalUI from './components/common/GlobalUI';
import HomePage from './pages/HomePage';
import DevicePage from './pages/DevicePage';
import DispensingPage from './pages/DispensingPage';
import PaymentPage from './pages/PaymentPage';
import SuccessPage from './pages/SuccessPage';
import NotFoundPage from './pages/NotFound';
import LoginPage from './pages/admin/LoginPage';
import AdminDashboard from './pages/admin/Dashboard';
import DeviceManagement from './pages/admin/DeviceManagement';
import ChemicalManagement from './pages/admin/ChemicalManagement';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import './App.css';
import './styles/ecoStyle.css';
import './styles/darkMode.css';
import './styles/globalUI.css';

function App() {
  const { deviceId, currentUser, isAdmin, checkAuthentication } = useAuth();
  
  // Check authentication status on app load
  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  return (
    <Router>
      <div className="eco-app">
        <Header />
        <main className="eco-main">
          <div className="eco-container">
            <Routes>
              {/* Client Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/device/:deviceId" element={<DevicePage />} />
              <Route path="/dispensing/:deviceId/:tankId" element={<DispensingPage />} />
              <Route path="/payment/:deviceId" element={<PaymentPage />} />
              <Route path="/success" element={<SuccessPage />} />
              
              {/* Authentication */}
              <Route path="/admin/login" element={
                isAdmin ? <Navigate to="/admin/dashboard" /> : <LoginPage />
              } />
              
              {/* Admin Routes - Protected */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute isAdmin={isAdmin}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/devices" 
                element={
                  <ProtectedRoute isAdmin={isAdmin}>
                    <DeviceManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/chemicals" 
                element={
                  <ProtectedRoute isAdmin={isAdmin}>
                    <ChemicalManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/analytics" 
                element={
                  <ProtectedRoute isAdmin={isAdmin}>
                    <AnalyticsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 Page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </main>
        <Footer />
        
        {/* Global UI Elements */}
        <GlobalUI />
      </div>
    </Router>
  );
}

export default App;