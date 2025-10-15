import React, { useEffect } from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate, Outlet } from "react-router-dom";
import Sidebar from "../../components/sidebar";
import "./staff.css";

function StaffLayout() {
  // BƯỚC 1: Lấy thêm trạng thái `loading` từ context
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // BƯỚC 2: Chỉ kiểm tra và điều hướng sau khi quá trình xác thực đã hoàn tất
    if (!loading) {
      if (!user || user.role !== "staff") {
        console.log("Redirecting: User is not staff or not logged in.");
        navigate("/");
      }
    }

    // Logic thêm class cho body giữ nguyên
    document.body.classList.add("dashboard-active");
    return () => {
      document.body.classList.remove("dashboard-active");
    };
  }, [user, loading, navigate]); // Thêm `loading` vào dependency array

  // BƯỚC 3: Trong khi đang tải, hiển thị một thông báo chờ
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Đang tải dữ liệu người dùng...</h2>
      </div>
    );
  }

  // Nếu quá trình tải đã xong nhưng user không hợp lệ, sẽ không render gì cả
  // và `useEffect` sẽ thực hiện việc điều hướng
  if (!user || user.role !== "staff") {
    return null; 
  }

  // Nếu tải xong và user là staff, hiển thị layout
  return (
    <div className="staff-layout">
      <div className="background-glow"></div>

      <header className="staff-header">
        <div className="header-main">
          <div className="header-brand">
            <h3>Beauty Smile</h3>
          </div>
          <div className="user-profile">
            <i className="fas fa-envelope fa-lg"></i>
            <i className="fas fa-bell fa-lg"></i>
            {/* Hiển thị tên thật của user nếu có */}
            <span>Xin chào, {user.fullName || 'Staff'}!</span>
            <img src={user.avatar || "https://via.placeholder.com/40"} alt="User Avatar" />
          </div>
        </div>
      </header>

      <div className="layout-body">
        <aside className="staff-sidebar">
          <ul className="staff-sidebar-nav">
            <li>
              <NavLink to="." end>
                <i className="fas fa-tachometer-alt nav-icon"></i>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="appointments">
                <i className="fas fa-table nav-icon"></i>
                Lịch hẹn
              </NavLink>
            </li>
            <li>
              <NavLink to="contacts">
                <i className="fas fa-inbox nav-icon"></i>
                Hộp thư
              </NavLink>
            </li>
            <li>
              <NavLink to="patients">
                <i className="fas fa-user-injured nav-icon"></i>
                Bệnh nhân
              </NavLink>
            </li>
            <li>
              <NavLink to="invoices">
                <i className="fas fa-file-invoice nav-icon"></i>
                Hóa đơn
              </NavLink>
            </li>
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