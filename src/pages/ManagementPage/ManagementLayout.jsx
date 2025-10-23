import React, { useEffect } from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate, Outlet } from "react-router-dom";
import { Menu, Dropdown } from "antd";
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

  const userMenu = (
    <Menu>
      
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        style={{ color: "#ff4d4f" }}
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Đang tải dữ liệu người dùng...</h2>
      </div>
    );
  }

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
            <Dropdown overlay={userMenu} trigger={["click"]}>
              <img src="https://via.placeholder.com/40" alt="User Avatar" style={{ cursor: "pointer" }} />
            </Dropdown>
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
