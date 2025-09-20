import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/authContext';
import AuthPage from './pages/AuthPage/AuthPage';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import Unauthorized from './pages/Unauthorized';
import Home from './pages/Home';
// import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          
          {/* Authentication Routes */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        
          {/* Doctor Routes */}
          
          
          
          {/* Patient Routes */}
          
          
          {/* Admin Routes */}
          
          
          {/* Receptionist Routes */}
          
          
          {/* Unauthorized Route */}
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;