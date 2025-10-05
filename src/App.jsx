import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import Home from "./pages/Home";
import AuthSuccess from "./pages/AuthSuccess";
import { CreateAccount, AdminDashboard } from "./pages/AdminPage";
import ProfilePage from "./pages/patient/ProfilePage";
import ProfileGuard from "./components/ProfileGuard";
import ForgotPasswordPage from "./pages/ForgotPassword";
import PaymentStatusPage from "./pages/patient/PaymentStatusPage";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <ProfileGuard>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth-success" element={<AuthSuccess />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ForgotPasswordPage />} />
            <Route path="/payment" element={<PaymentStatusPage />} />
          </Routes>
        </ProfileGuard>
      </Router>
    </AuthProvider>
  );
}

export default App;
