import React, { useEffect } from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate, Outlet } from "react-router-dom";
import Sidebar from "../../components/sidebar";
import { LogoutOutlined } from "@ant-design/icons";
import "./management.css";

function ManagementLayout() {
  const { user, loading, logout} = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "management") {
        console.log("Redirecting: User is not management or not logged in.");
        navigate("/");
      }
    }

    document.body.classList.add("dashboard-active");
    return () => {
      document.body.classList.remove("dashboard-active");
    };
  }, [user, loading, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate("/management/profile");
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Đang tải dữ liệu người dùng...</h2>
      </div>
    );
  }

  if (!user || user.role !== "management") return null;

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  const avatarUrl = user.avatar 
    ? `${API_BASE_URL}/${user.avatar.replace(/\\/g, '/')}` 
    : "https://via.placeholder.com/40";

  return (
    <div className="management-layout">
      <div className="background-glow"></div>

      <header className="management-header">
        <div className="header-main">
          <div className="header-brand">
            <h3>Beauty Smile</h3>
          </div>
          <div className="user-profile">
            {/* <i className="fas fa-envelope fa-lg"></i>
            <i className="fas fa-bell fa-lg"></i> */}
            
            <img 
              src={avatarUrl} // <-- Sử dụng avatar thật
              alt="User Avatar" 
              style={{ 
                cursor: "pointer", 
                width: "40px",      // Thêm kích thước cố định
                height: "40px",     // Thêm kích thước cố định
                borderRadius: "50%" // Làm cho nó tròn
              }} 
              onClick={handleProfileClick} // <-- Thêm sự kiện click
              title="Hồ sơ cá nhân" // Tooltip khi hover
            />
            <LogoutOutlined
              onClick={handleLogout}
              style={{
                cursor: "pointer",
                color: "#000000", // Giữ màu đỏ
                fontSize: "20px",    // Chỉnh kích thước cho dễ thấy
                marginLeft: "16px" // Thêm khoảng cách
              }}
              title="Đăng xuất" // Tooltip khi hover
            />
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
