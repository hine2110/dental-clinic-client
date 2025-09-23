import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import Home from "./pages/Home";
import AuthSuccess from "./pages/AuthSuccess";
import { CreateAccount, AdminDashboard } from "./pages/AdminPage";
import ProfilePage from "./pages/patient/ProfilePage";
import ProfileGuard from "./components/ProfileGuard";
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
          </Routes>
        </ProfileGuard>
      </Router>
    </AuthProvider>
  );
}

export default App;
