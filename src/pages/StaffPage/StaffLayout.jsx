import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate, Outlet, NavLink } from "react-router-dom";
import { io } from "socket.io-client";
import "./staff.css";

// THÊM DÒNG NÀY ĐỂ SỬA LỖI 'API_BASE' is not defined
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function StaffLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Phần 1: Bảo vệ route
    if (!loading) {
      if (!user || user.role !== "staff") {
        console.log("Redirecting: User is not staff or not logged in.");
        navigate("/");
      }
    }

    // Phần 2: Thiết lập thông báo real-time
    if (!loading && user && user.role === 'staff') {
      
      const fetchInitialCount = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE}/contact/unread-count`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (data.success) {
            setUnreadCount(data.data.count);
          }
        } catch (error) {
          console.error("Failed to fetch initial unread count:", error);
        }
      };
      
      fetchInitialCount();

      const socket = io(API_BASE);

      socket.on("new_contact_received", () => {
        setUnreadCount(prevCount => prevCount + 1);
      });

      // Dọn dẹp kết nối socket khi component unmount
      return () => {
        socket.disconnect();
        document.body.classList.remove("dashboard-active");
      };
    }

    // Phần 3: Quản lý class cho body
    document.body.classList.add("dashboard-active");
    // Hàm return để dọn dẹp khi user không hợp lệ hoặc đang loading
    return () => {
      document.body.classList.remove("dashboard-active");
    };

  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Đang tải dữ liệu người dùng...</h2>
      </div>
    );
  }

  if (!user || user.role !== "staff") {
    return null; 
  }

  return (
    <div className="staff-layout">
      <div className="background-glow"></div>
      <header className="staff-header">
        <div className="header-main">
          <div className="header-brand"><h3>Beauty Smile</h3></div>
          <div className="user-profile">
            <i className="fas fa-envelope fa-lg"></i>
            <i className="fas fa-bell fa-lg"></i>
            <i className="fas fa-sign-out-alt fa-lg" onClick={logout} title="Đăng xuất" style={{ cursor: 'pointer' }}></i>
            <span>Xin chào, {user.fullName || 'Staff'}!</span>
            <img src={user.avatar || "https://via.placeholder.com/40"} alt="User Avatar" />
          </div>
        </div>
      </header>

      <div className="layout-body">
        <aside className="staff-sidebar">
          <ul className="staff-sidebar-nav">
            <li><NavLink to="." end><i className="fas fa-tachometer-alt nav-icon"></i>Dashboard</NavLink></li>
            <li><NavLink to="appointments"><i className="fas fa-table nav-icon"></i>Lịch hẹn</NavLink></li>
            <li>
              <NavLink to="contacts" className="position-relative">
                <i className="fas fa-inbox nav-icon"></i>
                Hộp thư
                {unreadCount > 0 && (
                  <span className="badge rounded-pill bg-danger position-absolute" style={{top: '10px', right: '10px'}}>
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            </li>
            <li><NavLink to="patients"><i className="fas fa-user-injured nav-icon"></i>Bệnh nhân</NavLink></li>
            <li><NavLink to="invoices"><i className="fas fa-file-invoice nav-icon"></i>Hóa đơn</NavLink></li>
          </ul>
        </aside>
        <main className="staff-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StaffLayout;