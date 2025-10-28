// StaffLayout.jsx
// (ĐÃ SỬA LỖI KẾT NỐI SOCKET.IO)

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate, Outlet, NavLink } from "react-router-dom";
import { io } from "socket.io-client";
import "./staff.css";

// 1. Đảm bảo API_BASE được định nghĩa (Giống như các file khác)
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function StaffLayout() {
  // 2. Lấy state toàn cục từ context (Như chúng ta đã làm ở bước trước)
  const { user, staff, loading, logout, unreadCount, setUnreadCount } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "staff") {
        console.log("Redirecting: User is not staff or not logged in.");
        navigate("/");
      }
    }

    if (!loading && user && user.staffType === 'receptionist') {
      
      // 3. XÓA hàm fetchInitialCount() (Context đã làm)
      
      // ===== BƯỚC 2: SỬA LỖI KẾT NỐI SOCKET =====
      const token = localStorage.getItem('token'); // Lấy token
      const socket = io(API_BASE.replace("/api", ""), { // Dùng API_BASE
        auth: { token: token } // Gửi token xác thực
      });
      // =========================================

      socket.on("new_contact_received", () => {
        setUnreadCount(prevCount => prevCount + 1);
      });

      return () => {
        socket.disconnect();
        document.body.classList.remove("dashboard-active");
      };
    }

    document.body.classList.add("dashboard-active");
    return () => {
      document.body.classList.remove("dashboard-active");
    };

  }, [user, loading, navigate, setUnreadCount]); 

  // ... (Toàn bộ code còn lại của StaffLayout giữ nguyên) ...
  const staffType = staff?.staffType || user?.staffType;

  let profileUrl = "/";
  if (staffType === "receptionist") {
    profileUrl = "/staff/receptionist/profile/self";
  } else if (staffType === "storeKepper") {
    profileUrl = "/staff/store/profile/self";
  }

  const handleProfileClick = () => {
    if (profileUrl !== "/") {
      navigate(profileUrl);
    } else {
      console.error("Không thể xác định loại nhân viên để điều hướng hồ sơ.");
    }
  };

  const avatarUrl = user?.avatar 
    ? `${API_BASE}/${user.avatar.replace(/\\/g, '/')}` 
    : "https://via.placeholder.com/40";

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
            <img 
               src={avatarUrl}
               alt="User Avatar" 
               onClick={handleProfileClick}
               title="Hồ sơ cá nhân"
               style={{
                 cursor: 'pointer',
                 width: '40px',
                 height: '40px',
                 borderRadius: '50%',
                 objectFit: 'cover',
                 marginLeft: '15px'
               }} 
             />
          </div>
        </div>
      </header>

      <div className="layout-body">
        <aside className="staff-sidebar">
          <ul className="staff-sidebar-nav">
            <li><NavLink to="work-schedule"><i className="fas fa-tachometer-alt nav-icon"></i>Lịch Làm Việc</NavLink></li>
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
            <li><NavLink to="invoices"><i className="fas fa-file-invoice nav-icon"></i>Thanh toán</NavLink></li>
            <li><NavLink to="payment-history"><i className="fas fa-history nav-icon"></i>Lịch sử hóa đơn</NavLink></li>
            <li><NavLink to="inventory"><i className="fas fa-pills nav-icon"></i>Quản lý Thuốc</NavLink></li>
            <li><NavLink to="equipment"><i className="fas fa-tools nav-icon"></i>Quản lý Thiết bị</NavLink></li>
            <li><NavLink to="report-issue"><i className="fas fa-exclamation-triangle nav-icon"></i>Báo cáo Hỏng</NavLink></li>
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