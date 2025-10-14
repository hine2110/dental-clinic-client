import React, { useEffect } from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate, Outlet } from "react-router-dom";
import Sidebar from "../../components/sidebar";
import "./management.css";

function ManagementLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "management") {
      navigate("/");
    }
    document.body.classList.add("dashboard-active");
    return () => {
      document.body.classList.remove("dashboard-active");
    };
  }, [user, navigate]);

  if (!user || user.role !== "management") return null;

  return (
    <div className="management-layout">
      <div className="background-glow"></div>

      <header className="management-header">
        <div className="header-main">
          <div className="header-brand">
            <h3>Beauty Smile</h3>
          </div>
          <div className="user-profile">
            <i className="fas fa-envelope fa-lg"></i>
            <i className="fas fa-bell fa-lg"></i>
            <span>Xin chào, Management!</span>
            <img src="https://via.placeholder.com/40" alt="User Avatar" />
          </div>
        </div>
      </header>

      <div className="layout-body">
        <Sidebar />

        <main className="management-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ManagementLayout;
